import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const LocalUrl = 'mongodb://127.0.0.1:27017';
const AtlasUrl = 'mongodb+srv://qchen1129:n3WPaICENour31FJ\
@cqlove521.kyydatm.mongodb.net/?retryWrites=true&w=majority';

const url = process.env.REMOTE ? AtlasUrl : LocalUrl;

const Client = new MongoClient(url);

async function findOne(database, collection, query, options, errHandle){
    let TargetDocument = null;
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        TargetDocument = await collect.findOne(query, options);
    }
    catch (error){
        if ( errHandle != undefined ){
            errHandle(error);
        }
    }
    finally {
        return TargetDocument;
    }
}

async function updateOne(database, collection, filter, updateDoc, options, errHandle){
    let result = {'acknowledged': false};
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        result = await collect.updateOne(filter, updateDoc, options);
    }
    catch (error){
        if ( errHandle != undefined ){
            errHandle(error);
        }
    }
    finally {
        // acknowledged: boolean, matchedCount: number, modifiedCount: number
        // upsertedCount: number, upsertedId: _id
        return result;
    }
}

function stringToID(str){
    return new ObjectId(str);
}


async function findMany(database, collection, query, options, errHandle){
    let TargetDocuments = new Array();
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        const cursor = collect.find(query, options);
        // TargetDocuments = await cursor.toArray();
        for await (const doc of cursor){
            TargetDocuments.push(doc);
        }
    }
    catch (error){
        if ( errHandle != undefined ){
            errHandle(error);
        }
    }
    finally {
        return TargetDocuments;
    }
}

async function findManyDist(database, collection, distKey, filter, errHandle) {
    let retn = [];
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        const res = await collect.distinct(distKey, filter);
        retn = res;
        // console.log(retn);
    }
    catch (error) {
        if (errHandle != undefined) {
            errHandle(error);
        }
    }
    finally {
        return retn;
    }
}


async function insertOne(database, collection, document, errHandle) {
    let insertOneId = null;
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        const insertOneResult = await collect.insertOne(document);
        insertOneId = (insertOneResult.acknowledged) ? insertOneResult.insertedId.toString() : null;
    }
    catch (error) {
        if (errHandle != undefined) {
            errHandle(error);
        }
    }
    finally {
        return insertOneId;
    }
}

async function insertMany(database, collection, documents, errHandle) {
    var insertManyIds = new Array();
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        const insertManyResult = await collect.insertMany(documents);
        if (insertManyResult.acknowledged) {
            Object.values(insertManyResult.insertedIds).forEach((x) => {
                insertManyIds.push(x.toString());
            });
        }
    }
    catch (error) {
        if (errHandle != undefined) {
            errHandle(error);
        }
    }
    finally {
        return insertManyIds;
    }
}


async function aggregate(database, collection, pipeline, errHandle){
    var out_pipe = new Array();
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        const aggCursor = collect.aggregate(pipeline);
        for await (const doc of aggCursor) {
            out_pipe.push(doc);
        }
    }
    catch (error) {
        if (errHandle != undefined) {
            errHandle(error);
        }
    }
    finally {
        return out_pipe;
    }
}

async function createIndex(database, collection, keyMap, options, errHandle){
    var ret = null;
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        ret = await collect.createIndex(keyMap, options);
    }
    catch{
        if (errHandle != undefined) {
            errHandle(error);
        }
    }
    finally {
        return ret;
    }
}

const _findOne = findOne;
export { _findOne as findOne };

const _createIndex = createIndex;
export { _createIndex as createIndex };

const _aggregate = aggregate;
export { _aggregate as aggregate };

const _findMany = findMany;
export { _findMany as findMany };

const _insertMany = insertMany;
export { _insertMany as insertMany };

const _insertOne = insertOne;
export { _insertOne as insertOne };

const _findManyDist = findManyDist;
export { _findManyDist as findManyDist };

const _updateOne = updateOne;
export {_updateOne as updateOne};

const _stringToID = stringToID;
export {_stringToID as stringToID};
// async function insert