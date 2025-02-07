/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use('CqDemo');


db.getCollection('PartListNew').aggregate([{ $out: 'RHGS_TJ02_11090134' }])
db.getCollection('RHGS_TJ02_11090134').createIndex({ 'Identity': 1 }, { 'unique': 1 })



// Insert a few documents into the sales collection.
db.getCollection('RHGS_TJ02_11090134').aggregate([
  {
    $match: {
      PartProj: {
        $in: ['上部构造预制和安装', '上部构造现场浇筑', '桥面系、附属工程及桥梁总体']
      }
    }
  },
  { $unwind: "$dataStore" }, { $unwind: "$dataStore.data" },
  {
    $addFields: { total: { $multiply: ['$dataStore.multiply', '$dataStore.data.total'] } }
  },
  { $match: { total: { $gt: 0 } } },
  {
    $group: {
      _id: { subItemIndex: '$dataStore.data.subItemIndex', Identity: '$Identity' },
      graphNo: { $first: '$dataStore.info.graphNo' },
      total: { $sum: '$total' }
    }
  },
  {
    $lookup: {
      from: 'TableList', localField: '_id.subItemIndex', foreignField: 'subItemIndex',
      as: 'result'
    }
  },
  {
    $addFields: {
      price: { $getField: { field: 'price', input: { $arrayElemAt: ['$result', 0] } } },
      subItemName: { $getField: { field: 'subItemName', input: { $arrayElemAt: ['$result', 0] } } },
      unit: { $getField: { field: 'unit', input: { $arrayElemAt: ['$result', 0] } } },
    }
  },
  {
    $addFields: { count: { $multiply: ['$total', '$price'] } }
  },
  {
    $group: {
      _id: '$_id.Identity',
      data: {
        $push: {
          subItemIndex: '$_id.subItemIndex', price: '$price',
          subItemName: '$subItemName', unit: '$unit', quantity: '$total', designQuantity: '$total',
          Amount: '$count', refGraphNo: '$graphNo'
        }
      },
      total: { $sum: '$count' }
    }
  },
  {
    $project: {
      data: 1,
      total: 1,
      Identity: '$_id',
      _id: 0
    }
  },
  {
    $merge: {
      into: 'RHGS_TJ02_11090134',
      on: 'Identity',
      whenMatched: 'merge',
    }
  }
])

db.getCollection('RHGS_TJ02_11090134').aggregate([
  {
    $match: {
      PartProj: {
        $in: ['上部构造预制和安装', '上部构造现场浇筑', '桥面系、附属工程及桥梁总体']
      }
    }
  },
  {
    $project: {
      a1: "$UnitProj", a2: { $substrCP: ['$Identity', 0, 13] },
      a3: '$UnitProjItem', a4: { $substrCP: ['$Identity', 0, 15] },
      a5: '$PartProj', a6: { $substrCP: ['$Identity', 0, 17] },
      a7: '$PartProjItem', a8: { $substrCP: ['$Identity', 0, 19] },
      a9: '$SubProj', a10: { $substrCP: ['$Identity', 0, 21] },
      a11: '$SubProjItem', a12: { $substrCP: ['$Identity', 0, 23] },
      a13: '$Identity',
      data: 1,
      _id: 0
    }
  },
  {
    $unwind: {
      path: '$data',
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $addFields: {
      a14: '', // 保留字段
      a15: '', // 保留字段
      a16: '$data.refGraphNo',
      a17: '$data.subItemIndex',
      a18: '$data.subItemName',
      a19: '$data.unit',

      a20: { $round: ['$data.designQuantity', 4] },
      a21: { $round: ['$data.quantity', 4] },
      a22: { $round: ['$data.price', 4] },
      a23: { $round: ['$data.Amount', 4] }
    }
  },

  {
    $project: {
      data: 0
    }
  },

  {
    $sort: { 'a13': 1, 'a17': 1 }
  },

  {
    $out: 'RHGS_TJ02_WBS_11090136'
  }
]);


db.getCollection('PartListNew').updateMany({
  "dataStore.info.content": '基础挖填'
},
  {
    $set: { 'dataStore.$[elem].data.$[].subItemIndex': '404-1' }
  },
  {
    arrayFilters: [{ 'elem.info.content': '基础挖填' }]
  }
)

db.getCollection('RHGS02_DB_202311031552').aggregate([
  {
    $match: {
      SubProj: '混凝土护栏'
    }
  },
  {
    $addFields: {
      dataStore: {
        $filter:
        {
          input: '$dataStore',
          as: dd,
          cond: { $ne: ['$$dd.info.part', '支座'] }
        }
      }
    }
  },
  {
    $out: 'hl'
  }
])

db.getCollection('RHGS02_DB_202311031552').aggregate([
  {
    $match: {
      SubProj: '混凝土护栏'
    }
  },
  {
    $addFields: {
      dataStore: {
        $filter:
        {
          input: '$dataStore',
          as: 'dd',
          cond: { $ne: ['$$dd.info.part', '支座'] }
        }
      }
    }
  },
  {
    $out: 'hl'
  }
])


db.getCollection('hl').aggregate([
  {
    $addFields: {
      dataStore: {
        $map:
        {
          input: '$dataStore',
          as: 'dd',
          in: {
            $setField: {
              field: 'data',
              input: '$$dd',
              value: {
                $function: {
                  body: function (doc) {
                    if (doc.info.content != "预应力钢束") {
                      return doc.data;
                    }
                    for (let p of doc.data){

                    }
                  },
                  args: ['$$dd'],
                  lang: 'js'
                }
              }
            }
          }
        }
      }
    }
  },

  {
    $unset: "dataStore.info.multiply"
  },
  {
    $out: 'hlxx'
  }
])


db.getCollection('hlxx').aggregate([
  {
    $addFields: {
      dataStore: {
        $map: {
          input: '$dataStore',
          as: 'dd',
          in: {
            $setField: {
              field: 'density',
              input: '$$dd',
              value: {
                $fun
              }
            }
          }
        }
      }
    }, { $out: 'hlxxx' }
]);

db.getCollection("positionRebar").aggregate([
  {
    $addFields: {
      "data.density": {
        $function: {
          body: function (name) {
            return 0.00888;
          },
          args: [1],
          lang: "js"
        }
      }
    }
  }, { $out: "outPreb2" }
])





db.getCollection("positionRebar").aggregate([{ $out: "outy" }])



db.getCollection('hlxxx').aggregate([
  {
    $project: {
      _id: 0
    }
  },
  {
    $merge: {
      into: 'RHGS_TJ02_11090134',
      on: 'Identity',
      whenMatched: 'replace',
    }
  }
])



db.getCollection("RHGS_TJ02_11090134").aggregate([{
  $match: {
    SubProj: "梁板预制"
  }
}, {
  $group: {
    _id: '$SubProj',
    totalNumber: {
      $sum: '$total'
    }
  }
}])



db.getCollection("RHGS_TJ02_11090134").aggregate([{
  $match: {
    PartProj: "桥面系、附属工程及桥梁总体"
  }
}, {
  $group: {
    _id: '$PartProj',
    totalNumber: {
      $sum: '$total'
    }
  }
}])


db.getCollection("TableList").aggregate([{
  $match: {
    order: { $lt: 9 }
  }
}])


db.TableList.aggregate([
  {
    $group: {
      _id: 'subItemName',
      data: { $push: { max: '$subItemIndex', id: '$order' } }
    }
  }])




// Run a find command to view items sold on April 4th, 2014.
const salesOnApril4th = db.getCollection('sales').find({
  date: { $gte: new Date('2014-04-04'), $lt: new Date('2014-04-05') }
}).count();

// Print a message to the output window.
console.log(`${salesOnApril4th} sales occurred in 2014.`);

// Here we run an aggregation and open a cursor to the results.
// Use '.toArray()' to exhaust the cursor to return the whole result set.
// You can use '.hasNext()/.next()' to iterate through the cursor page by page.
db.getCollection('sales').aggregate([
  // Find all of the sales that occurred in 2014.
  { $match: { date: { $gte: new Date('2014-01-01'), $lt: new Date('2015-01-01') } } },
  // Group the total sales for each product.
  { $group: { _id: '$item', totalSaleAmount: { $sum: { $multiply: ['$price', '$quantity'] } } } }
]);


db.getCollection('PartListNew').aggregate([
  {
    $match:
      { dataStore: { $exists: 1 }, PartProj: { $in: ['上部构造预制和安装', '上部构造现场浇筑', '桥面系、附属工程及桥梁总体'] } }
  },
  {
    $unwind: "$dataStore"
  },
  {
    $unwind: "$dataStore.data"
  },
  {
    $lookup: {
      from: 'TableList',
      localField: 'dataStore.data.subItemIndex',
      foreignField: 'subItemIndex',
      as: 'result'
    }
  },
  {
    $addFields: {
      arrObject: { $arrayElemAt: ['$result', 0] },
      total: { $multiply: ['$dataStore.multiply', '$dataStore.data.total'] },
    }
  },
  {
    $addFields: {
      price: '$arrObject.price',
      subItemName: '$arrObject.subItemName',
      unit: '$arrObject.unit'
    }
  },

  {
    $match: {
      total: { $gt: 0 }
    }
  }, { $limit: 1 }])


db.getCollection('PartListNew').aggregate([
  {
    $project: {
      a1: "$UnitProj",
      a2: '$UnitProjItem',
      a3: '$PartProj',
      a4: '$PartProjItem',
      a5: '$SubProj',
      a6: '$SubProjItem',
      a7: '$Identity'
    }
  }, { $sort: { 'Identity': 1 } }, { $out: '桥梁分部分项工程表' }
])






db.getCollection('PartListNew').aggregate([
  {
    $unwind: "$dataStore"
  },
  {
    $unwind: "$dataStore.data"
  },
  {
    $lookup: {
      from: 'TableList',
      localField: 'dataStore.data.subItemIndex',
      foreignField: 'subItemIndex',
      as: 'result'
    }
  },
  {
    $addFields: {
      arrObject: { $arrayElemAt: ['$result', 0] },
      total: { $multiply: ['$dataStore.multiply', '$dataStore.data.total'] },
    }
  },
  {
    $addFields: {
      totalCount: { $multiply: ['$arrObject.price', '$total'] }
    }
  },

  {
    $match: {
      total: { $gt: 0 }
    }
  },

  {
    $group: {
      _id: { subItemIndex: '$dataStore.data.subItemIndex', Identity: '$Identity' },
      UnitProj: { $first: '$UnitProj' },
      UnitProjItem: { $first: '$UnitProjItem' },
      PartProj: { $first: '$PartProj' },
      PartProjItem: { $first: '$PartProjItem' },
      SubProj: { $first: '$SubProj' },
      SubProjItem: { $first: '$SubProjItem' },
      price: { $first: '$price' },
      subItemName: { $first: '$subItemName' },
      unit: { $first: '$unit' },
      reference: { $first: '$dataStore.info.graphNo' },
      totalNumber: { $sum: '$total' },
    }
  },
  {
    $project: {
      a1: "$UnitProj", a2: { $substrCP: ['$_id.Identity', 0, 13] },
      a3: '$UnitProjItem', a4: { $substrCP: ['$_id.Identity', 0, 15] },
      a5: '$PartProj', a6: { $substrCP: ['$_id.Identity', 0, 17] },
      a7: '$PartProjItem', a8: { $substrCP: ['$_id.Identity', 0, 19] },
      a9: '$SubProj', a10: { $substrCP: ['$_id.Identity', 0, 21] },
      a11: '$SubProjItem', a12: { $substrCP: ['$_id.Identity', 0, 23] },
      a13: '$_id.Identity',
      a14: '$reference',
      a15: '$_id.subItemIndex',
      a16: '$subItemName',
      a17: '$unit',
      a18: { $round: ['$totalNumber', 4] },
      a19: { $round: ['$totalNumber', 4] },
      a20: '$price',
      a21: { $round: [{ $multiply: ['$price', '$totalNumber'] }, 4] },
      _id: 0
    }
  },
  {
    $sort: { 'a13': 1 }
  },
  {
    $out: 'RHGS_TJ02_WBS_11072312'
  }
]);


db.getCollection("RHGS_TJ02_11090134").aggregate([{
  $match: {
    dataStore: { $exists: 1 }
  }
}, { $unwind: 'dataStore' }, { $unwind: 'data' }, { $limit: 2 }
])


db.getCollection('RHGS_TJ02_11090134').aggregate([{
  $match: {
    'PartProj': {
      $in: ['上部构造预制和安装', '上部构造现场浇筑', '桥面系、附属工程及桥梁总体']
    }, dataStore: { $exists: true }
  }
}, { $unset: 'data' }, { $unset: 'total' }, { $out: 'RHGS_TJ02_TOP_1207' }])

db.getCollection('RHGS_TJ02_11090134').distinct('PartProj')



db.getCollection('RHGS_TJ02_TOP_1207').aggregate([
  {
    $unwind: "$dataStore"
  },
  {
    $unwind: "$dataStore.data"
  },

  {
    $match: {
      "dataStore.data.subItemIndex": {
        $in: ['403-3-1', '403-3-2', '403-3-3']
      }
    }
  },

  {
    $group: {
      _id: { subItemIndex: "$dataStore.data.subItemIndex", bridge: "$UnitProj", part: "$UnitProjItem" },
      total: { $sum: { $multiply: ["$dataStore.data.total", "$dataStore.multiply"] } }
    }
  },

  {
    $project: {
      a3: '$_id.subItemIndex', a1: '$_id.bridge', a2: '$_id.part', total: 1, _id: 0
    }

  },
  {
    $sort: {
      a1: 1, a2: 1, a3: 1
    }
  },
  {
    $out: 'top_some_count'
  }
])




db.getCollection('RHGS_TJ02_TOP_1207').aggregate([{
  $unwind: "$dataStore"
}, {
  $unwind: "$dataStore.data"
}, {
  $project : {
    _id: 0
  }
}, {$out: "full_top"}])