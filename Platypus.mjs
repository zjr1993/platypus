import express, { static as staticFile } from 'express';
import bodyParser from 'body-parser';
import * as db from './database/mongodb.mjs';

var app = express();
const port = 3989;
const static_directory = './public';
const cfgDB = 'config';
const cfgCollection = 'users';
const dftDB = 'platypus';
const dftCollection = 'demo';
const _Debug = 1;

app.set('Debug', process.env.DEBUG || _Debug);
app.set('port', process.env.PORT || port);

app.use(staticFile(static_directory));
app.use(bodyParser.json({
    limit: '10mb',
    extended: true
}));

// Replace the parameters in the formula and evaluate
function FormulaCalc(obj, param) {
    if (!param) {
        return eval(obj);
    }
    if (typeof (obj) != 'string') {
        return obj;
    }
    else {
        obj = obj.replaceAll('COS', 'Math.cos');
        obj = obj.replaceAll('INT', 'parseInt');
        for (let p in param) {
            if (p.length >= 3) {
                obj = obj.replaceAll(p, param[p]);
            }
        }
        for (let p in param) {
            if (p.length >= 2 && p.length < 3) {
                obj = obj.replaceAll(p, param[p]);
            }
        }
        for (let p in param) {
            if (p.length < 2) {
                obj = obj.replaceAll(p, param[p]);
            }
        }
    }
    return eval(obj);
}


// function mapTosubItem(material) {
//     if (material.length >= 10) {
//         return '410-5-7';
//     }
//     let key = material[0].toLowerCase();
//     switch (key) {
//         case 'a':
//             return '403-3-1';
//         case 'c':
//             return '403-3-2';
//         case 'd':
//             return '403-3-3';
//         case 's':
//             return '418-4';
//         default:
//             return null;
//     }
// }

function mapTosubItem(material) {
    if (material.includes('混凝土')) {
        return '410-6-4';
    }
    return '403-4-2';
}



function materialDensity(material) {
    function RebarDensity(d) {
        let Den = 1; // C50
        switch (d) {
            case 10:
                Den = 0.00617;
                break;
            case 12:
                Den = 0.00888;
                break;
            case 14:
                Den = 0.0121;
                break;
            case 16:
                Den = 0.0158;
                break;
            case 18:
                Den = 0.02;
                break;
            case 20:
                Den = 0.0247;
                break;
            case 22:
                Den = 0.0298;
                break;
            case 25:
                Den = 0.0385;
                break;
            case 28:
                Den = 0.0483;
                break;
            case 32:
                Den = 0.0631;
                break;
            default:
                break;
        }
        return Den;
    }

    if (material.length > 3) {
        // SBS防水卷材 混凝土
        return 1;
    }
    else {
        return RebarDensity(Number(material.slice(1, 3)));
    }
}



function debug(message) {
    if (app.get('Debug') == 1) {
        return console.log(message);
    }
    else {
        return;
    }
}

/**
 * 403==> database error
 * 404==> result is null|empty
 * 303==> result is not complete
 * 200==> successful
 */

// verify sign in
app.get('/login', (req, res) => {
    let username = req.query.username;
    let password = req.query.password;
    let filter = { "username": username, "password": password };
    let options = { projection: { "_id": 0 } };

    // show some login record
    debug(`${username} with password ${password} try login at ${new Date()}`);

    db.findOne(cfgDB, cfgCollection, filter, options, (x) => {
        debug("error happen in findOne!");
        debug(x);
        res.status(403);
        res.send(x);
    }).then((value) => {
        if (value == null) {
            res.status(404);
            res.send("The user does not exist, contact your administrator");
        }
        else {
            res.status(200);
            res.send("login successful!");
        }
    });
})

app.get('/register', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const filter = { "username": username, "password": password };
    const options = { projection: { "_id": 0 } };
    debug(`${username} with password ${password} try sign up at ${new Date()}`);
    db.findOne(cfgDB, cfgCollection, filter, options).then((value) => {
        if (value) {
            res.status(303);
            res.send("username is already exist!");
        }
        else {
            db.insertOne(cfgDB, cfgCollection, {
                "username": username, "password": password,
            }).then((value) => {
                if (value) {
                    debug(`${username} sign up successfully!`);
                    res.status(200);
                    // value is the _id
                    res.send(value);
                }
                else {
                    debug(`${username} fail to sign up!`);
                    res.status(403);
                    res.send("unknown");
                }
            })
        }
    })
})

// 通用查询,指定database, collection, filter, options
// return the query results directly
// const body = {
//     filters: {},
//     options: {}
// }
app.post('/filters', (req, res) => {
    const database = req.query.database;
    const collection = req.query.collection;
    const filters = req.body.filters;
    const options = req.body.options;
    debug(`a filter on ${database}.${collection}`);
    db.findMany(database, collection, filters, options, (x) => {
        debug("error occurred in function findMany");
        debug(x);
        res.status(403);
        res.send([]);
    }).then((value) => {
        if (value.length < 1) {
            res.status(404);
            res.send([]);
        }
        else {
            res.status(200);
            // a array
            res.send(value);
        }
    });
})


app.get('/pre', (req, res) => {
    const database = req.query.database;
    const collection = req.query.collection;
    const tid = req.query.tid;
    const pid = req.query.pid;

    db.findOne(database, 'positionRebar', { '_id': db.stringToID(pid) }, { projection: { _id: 0 } }).then((value) => {
        if (value) {
            value.multiply = 1;
            value.TempID = pid;
            let updateDoc = { $push: { dataStore: value } };
            db.updateOne('CqDemo', collection, { '_id': db.stringToID(tid) }, updateDoc, (error) => {
                // do some thing
                console.dir(error);
                res.status(403);
                res.send('0');
            }).then((value) => {
                if (value.acknowledged) {
                    res.status(200);
                    res.send('1');
                }
                else {
                    res.status(403);
                    res.send('0');
                }
            })
        }
        else {
            res.status(403);
            res.send('0');
        }
    });


})


app.post('/aggregate', (req, res) => {
    const database = req.query.database;
    const collection = req.query.collection;
    const pipeline = req.body;
    debug(`a aggregate on ${database}.${collection}`);
    db.aggregate(database, collection, pipeline, (x) => {
        debug("error occurred in function aggregate");
        debug(x);
        res.status(403);
        res.send([]);
    }).then((value) => {
        if (value.length < 1) {
            res.status(404);
            res.send([]);
        }
        else {
            res.status(200);
            // a array
            res.send(value);
        }
    });
})

app.post('/createIndex', (req, res) => {
    const database = req.query.database;
    const collection = req.query.collection;
    const keyMap = req.body.keyMap;
    const options = req.body.options;
    db.createIndex(database, collection, keyMap, options).then((value) => {
        if (value === null) {
            for (let key in keyMap) {
                debug(`createIndex of ${key} is failed`);
            }
            res.status(403);
            res.send('failed');
        }
        else {
            res.status(200);
            res.send(value);
        }
    });
})

app.post('/findDist', (req, res) => {
    let distKey = req.query.distkey;
    let database = req.query.database;
    let collection = req.query.collection;
    let filters = req.body;
    db.findManyDist(database, collection, distKey, filters,
        console.dir).then((value) => {
            if (value.length < 1) {
                res.status(404);
                res.send([]);
            }
            else {
                res.status(200);
                res.send(value);
            }
        })
})




// push many documents to database collection
app.post('/insert', (req, res) => {
    let database = req.query.database;
    let collection = req.query.collection;
    let documents = req.body;

    debug(`insert to the ${database}.${collection}`);

    db.insertMany(database, collection, documents, (x) => {
        debug(`A MongoBulkWriteException occurred, but there are successfully processed documents.`);
        let insertManyIds = new Array();
        let _MongoBulkWriteError = x.result;
        let _BulkWriteResult = _MongoBulkWriteError.result;
        Object.values(_BulkWriteResult.insertedIds).forEach((y) => {
            insertManyIds.push(y.toString());
        })
        // Partial Results
        res.status(303);
        res.send(insertManyIds);
    }).then((value) => {
        if (value.length < 1) {
            res.status(403);
            res.send([]);
        }
        else {
            res.status(200);
            // a array of _ids  
            // console.log(value);
            res.send(value);
            debug(`${value.length} documents are inserted successfully`);
        }
    });
})

app.post('/BeamType', (req, res) => {
    let data = req.body;
    let doc = {};
    for (let key in data) {
        doc.name = key;
        doc.data = data[key];
        break;
    }
    db.insertOne('CqDemo', 'BeamSome', doc).then((value) => {
        if (value) {
            res.status(200);
            // value is the _id
            res.send(value);
        }
        else {
            debug(`insert BeamType failed`);
            res.status(403);
            res.send("");
        }
    })
})



app.post('/data', (req, res) => {
    let data = req.body;
    let successfulCount = 0;
    let count = 0;
    for (let _k in data) {
        count += 1;
    }
    for (let key in data) {
        // insert in PartList 分部分项的表中去
        let keyId = db.stringToID(key);
        let updateArray = new Array();
        let paramArray = data[key];
        let len = paramArray.length;
        for (let item of paramArray) {
            // console.dir(item.param);
            db.findOne('CqDemo', 'BeamTemp', { '_id': db.stringToID(item.id) }, { projection: { '_id': 0, 'param': 0 } }).then((value) => {
                // 对value的数据部分做修改
                for (let row of value.data) {
                    if (row.hasFormula) {
                        row.number = FormulaCalc(row.number, item.param);
                        row.formulaLength = FormulaCalc(row.formulaLength, item.param);
                    }
                    row.subItemIndex = mapTosubItem(row.material);
                    row.density = materialDensity(row.material);
                    row.total = row.number * row.formulaLength * row.density;
                }
                value.TempID = item.id;
                value.multiply = item.multiply;
                updateArray.push(value);

                if (updateArray.length >= len) {
                    // 更新到数据库中去
                    const updateDoc = { $push: { dataStore: { $each: updateArray } } }
                    db.updateOne('CqDemo', 'PartListNew', { '_id': keyId }, updateDoc, (error) => {
                        // do some thing
                        console.dir(error);

                    }).then((v) => {
                        if (v.acknowledged) {
                            successfulCount++;
                            if (successfulCount >= count) {
                                debug(successfulCount);
                                res.status(200);
                                res.send({ 'UpDateCounts': successfulCount, 'isOk': 1 });
                            }
                        }
                        else {
                            res.status(303);
                            res.send({ 'isOk': 0, 'UpDateCounts': successfulCount });
                            debug(`${keyId}-${item.id} error happen!!`);
                        }
                    });
                }
            });
        }
    }
})


app.post('/update', (req, res) => {
    let database = req.query.database;
    let collection = req.query.collection;
    let documents = req.body;

    // debug(`update to the ${database}.${collection}`);
    const updateDoc = { $push: { dataStore: { $each: documents.data } } }
    db.updateOne(database, collection, {
        _id: db.stringToID(documents._id)
    }, updateDoc).then((v) => {
        if (v.acknowledged) {
            res.status(200);
            res.send(`${v.modifiedCount}`);
        }
        else {
            res.status(303);
            res.send('0');
        }
    });
})



app.post('/pushdoc', (req, res) => {
    // query some data
    let database = "CqDemo";
    let collection = "BeamTemp";
    let doc = req.body;
    debug(`insert a doc type of ${doc["info"]['TypeOfBeam']}
    part of ${doc["info"]['part']}
    content of ${doc["info"]['content']}`);
    db.insertOne(database, collection, doc, (x) => {
        debug("insert document failed!");
        res.status(403);
        res.send(x.result);
    }).then((value) => {
        if (value == null) {
            res.status(303);
            res.send("no_ id return");
        }
        else {
            res.status(200);
            res.send(value);
        }
    })

})

app.post('/insertOne', (req, res) => {
    let collection = req.query.collection;
    let database = req.query.database;
    debug(`a document put into the ${database}.${collection}`);

    let doc = req.body;
    db.insertOne(database, collection, doc, (x) => {
        debug("put document failed!");
        res.status(403);
        res.send(x.result);
    }).then((value) => {
        if (value == null) {
            res.status(303);
            res.send("no _id return");
        }
        else {
            res.status(200);
            res.send(value);
        }
    });
})



app.post('/Temp', (req, res) => {
    let collection = req.query.collection;
    let database = req.query.database;
    debug(`a document put into the ${database}.${collection}`);

    let doc = req.body;
    db.insertOne(database, collection, doc, (x) => {
        debug("put document failed!");
        res.status(403);
        res.send(x.result);
    }).then((value) => {
        if (value == null) {
            res.status(303);
            res.send("no _id return");
        }
        else {
            res.status(200);
            res.send(value);
        }
    });
})


// // put a document into database.collection
// app.post('/put', (req, res) => {
//     let database = req.query.database;
//     let collection = req.query.collection;
//     debug(`a put to the ${database}.${collection}`);
//     let doc = req.body;
//     db.insertOne(database, collection, doc, (x) => {
//         debug(x.result);
//         res.status(403);
//         res.send("put document failed");
//     }).then((value) => {
//         if (value == null) {
//             res.status(303);
//             res.send("no _id return");
//         }
//         else {
//             res.status(200);
//             res.send(value);
//         }
//     });
// })



app.listen(app.get('port'), function () {
    let _port = app.get('port');
    debug('WxHCq started on http://127.0.0.1:' + _port);
    debug('press Ctrl + C to terminate.');
    // do some initial work
})