const LocalHost = 'http://127.0.0.1:3989/';
const RemoteHost = 'http://www.cq19931129.top';
const defaultDataBase = 'CqDemo';

function refresh() {
    wps.ribbonUI.InvalidateControl("download");
    wps.ribbonUI.InvalidateControl("upload");
    wps.ribbonUI.InvalidateControl("config");
}

function setNormalHead(xhr, contentType = "text/plain") {
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("Accept", "*/*");
}

function getParam() {
    let content;
    let num = arguments.length;
    if (num < 2) {
        return '';
    }
    let str = '?';
    for (let i = 0; i < num; i++) {
        content = (arguments[i] == null) ? '' : arguments[i];
        if (i % 2) {
            str += content + '&';
        }
        else {
            str += content + '=';
        }
    }
    if (str[str.length - 1] == '&') {
        str = str.slice(0, str.length - 1)
    }
    return str;
}

async function Login(username, password) {
    let res = await fetch(LocalHost + 'login' +
        getParam("username", username, "password", password), {
        method: 'get',
        headers: {
            'Content-Type': 'text/plain'
        }
    });
    let resposeText = await res.text();
    let status = res.status;
    let ret = { "status": status, "data": resposeText };
    if (status == 200) {
        // 连接成功的公共操作放此处，可以减少代码重复
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        wps.PluginStorage.setItem("isLogin", true);
        refresh();
    }
    return ret;
}

async function Register(username, password, database) {
    let res = await fetch(LocalHost + 'register' +
        getParam("username", username, "password", password, "database", database), {
        method: 'get',
        headers: {
            'Content-Type': 'text/plain'
        }
    })
    let resposeText = await res.text();
    let status = res.status;
    let ret = { "status": status, "data": resposeText };
    if (status == 200) {
        // 连接成功的公共操作放此处，可以减少代码重复
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        localStorage.setItem("dft_database", database);
        wps.PluginStorage.setItem("isLogin", true);
        refresh();
    }
    return ret;
}

async function PushDoc(url, document) {
    let res = await fetch(LocalHost + url, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(document)
    })

    let resposeText = await res.text();
    let status = res.status;
    let ret = { "status": status, "data": resposeText };
    return ret;
}

async function sendManyDocuments(col, documents) {
    let res = await fetch(LocalHost + 'genpart' + `?collection=${col}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(documents)
    })

    let resposeData = await res.json();
    let status = res.status;
    let ret = { "status": status, "data": resposeData };
    return ret;
}

async function sendData(database, collection, docs) {
    let res = await fetch(LocalHost + 'insert' + `?database=${database}&collection=${collection}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(docs)
    });
    let resposeData = await res.json();

    let status = res.status;
    let ret = {};
    if (status == 200) {
        ret.isOk = true;
    }
    else {
        ret.isOk = false;
    }
    ret.data = resposeData;
    ret.status = status;
    return ret;
}

function dataUpLoad() {
    let docs = null;
    let _db = localStorage.getItem('_db');
    let _col = localStorage.getItem('_col');

    if (localStorage.getItem('iswhole') == 0) {
        docs = tableToDocument();
    }
    else {
        docs = qingdanGather();
    }
    if (_db && _col) {
        sendData(_db, _col, docs).then((respose) => {
            let status = respose.status;
            if (status == 200) {
                alert('上传数据成功!');
            }
            else if (status == 403) {
                alert('上传数据失败!');
            }
            else {
                alert('部分错误!');
            }
        });
    }
    else {
        alert("请先配置数据库");
    }
}

function mergeTogether(object_collection /** 目标工程量清单 */) {
    let database = localStorage.getItem('_db');
    let collection = localStorage.getItem('_col');
    let aggregate = [
        {
            $match: { number: { $gt: 0.01 } }
        },
        {
            $group: {
                _id: { "subItemIndex": "$subItemIndex" },
                checkNumber: {
                    $sum: "$number"
                },
                component: {
                    $push: { "bridge": "$bookName", "number": "$number", "project": "$sheetName" }
                }
            }
        },
        { $project: { _id: 0, checkNumber: 1, component: 1, subItemIndex: "$_id.subItemIndex" } },
        {
            $merge: {
                into: object_collection,
                on: 'subItemIndex',
                whenMatched: 'merge',
            }
        }
    ];

    fetch(LocalHost + 'aggregate' + `?database=${database}&collection=${collection}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(aggregate)
    }).then((res) => {
        if (res.status == 404) {
            alert('merge successfully!');
        }
    });
}


function createNewMergeTableList(name) {
    let aggregate_1 = [{ "$out": name }];
    let database = "CqDemo";
    let collection = "TableList";
    fetch(LocalHost + 'aggregate' + `?database=${database}&collection=${collection}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(aggregate_1)
    }).then((res) => {
        if (res.status == 404) {
            fetch(LocalHost + 'createIndex' + `?database=${database}&collection=${name}`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "keyMap": { "subItemIndex": 1 }, "options": { "unique": true } })
            }).then((v) => {
                if (v.status == 200) {
                    // create index successful
                    mergeTogether(name);
                    localStorage.setItem("ProjectCol", name);
                }
                else {
                    alert('not createIndex!');
                }
            });
        }
        else {
            alert("not create new list!");
        }
    });
}


// 定位钢筋
async function toDataBase() {
    let cell = wps.ActiveCell;
    let pcell = cell;
    let num = cell.MergeArea.Rows.Count;
    let docs = {};
    docs.info = {};
    docs.info.TypeOfBeam = cell.Offset(0, -2).Text;
    docs.info.part = cell.Offset(0, -11).Text;
    docs.info.content = 'T梁定位钢筋';
    docs.info.graphNo = cell.Offset(0, -1).Text;
    docs.data = new Array();
    for (let j = 1; j <= num; j++) {
        let doc = {};
        doc.index = cell.Offset(0, -10).Text;
        doc.material = "C12";
        doc.formulaLength = cell.Offset(0, -7).Value2;
        doc.hasFormula = 0;
        doc.number = cell.Offset(0, -6).Value2;
        doc.total = 0.888 * doc.formulaLength * doc.number / 100;
        doc.subItemIndex = "403-3-2";
        docs.data.push(doc);
        cell = cell.Item(2, 1);
    }

    let collection = "positionRebar";
    let res = await fetch(LocalHost + 'insertOne' + `?database=CqDemo&collection=${collection}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(docs)
    });

    if (res.status == 200) {
        res.text().then((v) => { pcell.Formula = v; });
    }
    else {
        alert("数据传输错误");
    }
}


function UpLoadConcrete(cell) {
    let arr = wps.ActiveSheet.Name.split('-');
    let docs = { 'UnitProj': arr[0], 'UnitProjItem': arr[1] };
    docs.SubProjItem = `${cell.Offset(0, -12).Text}-${cell.Offset(0, -11).Text}#T梁预制`;
    docs.data = new Array();

    let TypeOfBeam = cell.Offset(0, -10).MergeArea.Range("A1").Text;

    let docx = {};
    docx.multiply = 1;
    docx.info = {};
    docx.info.TypeOfBeam = TypeOfBeam;
    docx.info.content = 'C50|T梁预制混凝土';
    docx.info.part = "T梁";
    docx.info.graphNo = "";
    docx.data = new Array();
    docxItem = {};
    docxItem.index = '-';
    docxItem.material = "T梁(C50砼)";
    docxItem.hasFormula = 0;
    docxItem.formulaLength = 1;
    docxItem.number = Number(cell.Offset(0, -9).Value2);
    docxItem.subItemIndex = '411-8-3-3';
    docxItem.density = 1;
    docxItem.total = docxItem.number * docxItem.density * docxItem.formulaLength;
    docx.data.push(docxItem);
    docs.data.push(docx);

    let docx1 = {};
    docx1.multiply = 1;
    docx1.info = {};
    docx1.info.TypeOfBeam = TypeOfBeam;
    docx1.info.content = '预应力钢束';
    docx1.info.part = "T梁";
    docx1.info.graphNo = "";
    docx1.data = new Array();

    for (let j = 1; j <= 4; j++) {
        let xcell = cell.Offset(0, -9 + j);
        component1 = {};
        component1.index = `N${j}`;
        component1.material = "Φs15.2高强低松弛钢绞线";
        component1.hasFormula = 0;
        component1.formulaLength = Number(xcell.Value2);
        component1.number = Number(xcell.Offset(0, 4).Value2);
        component1.subItemIndex = '411-5-2';
        component1.density = 1.101;
        component1.total = component1.number * component1.density * component1.formulaLength / 100;
        docx1.data.push(component1);
    }
    docs.data.push(docx1);
    return docs;
}


function UpLoadConcrete_Sp(cell) {
    let arr = wps.ActiveSheet.Name.split('-');
    let docs = { 'UnitProj': arr[0], 'UnitProjItem': arr[1] };
    docs.SubProjItem = `${cell.Offset(0, -8).Text}-${cell.Offset(0, -7).Text}#矮T梁预制`;
    docs.data = new Array();

    let TypeOfBeam = cell.Offset(0, -6).MergeArea.Range("A1").Text;

    let docx = {};
    docx.multiply = 1;
    docx.info = {};
    docx.info.TypeOfBeam = TypeOfBeam;
    docx.info.content = 'C50|T梁预制混凝土';
    docx.info.part = "矮T梁";
    docx.info.graphNo = "";
    docx.data = new Array();
    docxItem = {};
    docxItem.index = '-';
    docxItem.material = "矮T梁(C50砼)";
    docxItem.hasFormula = 0;
    docxItem.formulaLength = 1;
    docxItem.number = Number(cell.Offset(0, -5).Value2);
    docxItem.subItemIndex = '411-8-4-3';
    docxItem.density = 1;
    docxItem.total = docxItem.number * docxItem.density * docxItem.formulaLength;
    docx.data.push(docxItem);
    docs.data.push(docx);

    let docx1 = {};
    docx1.multiply = 1;
    docx1.info = {};
    docx1.info.TypeOfBeam = TypeOfBeam;
    docx1.info.content = '预应力钢束';
    docx1.info.part = "矮T梁";
    docx1.info.graphNo = "";
    docx1.data = new Array();

    for (let j = 1; j <= 2; j++) {
        let xcell = cell.Offset(0, -5 + j);
        component1 = {};
        component1.index = `N${j}`;
        component1.material = "Φs15.2高强低松弛钢绞线";
        component1.hasFormula = 0;
        component1.formulaLength = Number(xcell.Value2);
        component1.number = Number(xcell.Offset(0, 2).Value2);
        component1.subItemIndex = '411-5-2';
        component1.density = 1.101;
        component1.total = component1.number * component1.density * component1.formulaLength / 100;
        docx1.data.push(component1);
    }
    docs.data.push(docx1);
    return docs;
}


async function pushData_sp(cell) {
    let data = UpLoadConcrete_Sp(cell);
    let res = await fetch(LocalHost + 'update' + `?database=CqDemo&collection=PartListNew`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (res.status == 200) {
        res.text().then((v) => {
            cell.Value2 = v;
        })
    }
    else {
        cell.Value2 = 'unknown';
    }
}



async function pushData(cell) {
    let data = UpLoadConcrete(cell);
    let res = await fetch(LocalHost + 'update' + `?database=CqDemo&collection=PartListNew`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (res.status == 200) {
        res.text().then((v) => {
            cell.Value2 = v;
        })
    }
    else {
        cell.Value2 = 'unknown';
    }
}

async function dopush() {
    let strRange = wps.Selection.Address();
    let arrayRangeAddress = strRange.split(",");
    let cell;
    let n;
    for (let m of arrayRangeAddress) {
        cell = wps.Range(m);
        n = cell.Count;
        for (let i = 1; i <= n; i++) {
            await pushData(cell.Item(i));
        }
    }
}


async function dopush_sp() {
    let strRange = wps.Selection.Address();
    let arrayRangeAddress = strRange.split(",");
    let cell;
    let n;
    for (let m of arrayRangeAddress) {
        cell = wps.Range(m);
        n = cell.Count;
        for (let i = 1; i <= n; i++) {
            await toxianjiao(cell.Item(i));
        }
    }
}


async function getDocx() {
    let docs = new Array();
    let rows = wps.Selection.Rows.Count;
    let sum = 0;
    let cell = wps.Selection.Range("A1");
    let arr = wps.ActiveSheet.Name.split('-');
    let UnitProj = arr[0]
    let UnitProjItem = arr[1];

    while (sum < rows) {
        let TypeOfBeam = cell.Text;
        let docx_1 = {};
        let docx_2 = {};
        let docx_3 = {};
        let sum_d = 0;

        let MergeNum = cell.MergeArea.Rows.Count
        let sum_1 = 0, sum_2 = 0, sum_3 = 0;
        for (let block_num = 1; block_num <= MergeNum; block_num++) {
            sum_1 += cell.Item(block_num, 2).Value2;
            sum_2 += cell.Item(block_num, 3).Value2;
            // sum_3 += cell.Item(block_num, 4).Value2;
        }
        // _________湿接缝_________
        docx_1.UnitProj = UnitProj;
        docx_1.UnitProjItem = UnitProjItem;
        docx_1.SubProj = '湿接缝';
        docx_1.SubProjItem = `第${cell.Offset(0, -1).Text}跨湿接缝`;
        docx_1.data = new Array();

        let box_1 = {};
        box_1.multiply = 1;
        box_1.info = {};
        box_1.info.TypeOfBeam = TypeOfBeam;
        box_1.info.content = '现浇C50微膨胀砼';
        box_1.info.part = "翼板湿接缝";
        box_1.info.graphNo = "";
        box_1.data = new Array();

        let component1 = {};
        component1.index = '-';
        component1.material = "湿接缝(C50微膨胀砼)";
        component1.hasFormula = 0;
        component1.formulaLength = 1;
        component1.number = sum_1;
        component1.subItemIndex = '410-3-3-3';
        component1.density = 1;
        component1.total = component1.number * component1.density * component1.formulaLength;
        box_1.data.push(component1);
        docx_1.data.push(box_1);
        // __________________________________


        // _____________________横隔板_____________________
        docx_2.UnitProj = UnitProj;
        docx_2.UnitProjItem = UnitProjItem;
        docx_2.SubProj = '横隔板';
        docx_2.SubProjItem = `第${cell.Offset(0, -1).Text}跨横隔板`;
        docx_2.data = new Array();

        let box_2 = {};
        box_2.multiply = 1;
        box_2.info = {};
        box_2.info.TypeOfBeam = TypeOfBeam;
        box_2.info.content = '现浇C50微膨胀砼';
        box_2.info.part = "横隔板";
        box_2.info.graphNo = "";
        box_2.data = new Array();

        let component2 = {};
        component2.index = '-';
        component2.material = "横隔板(C50微膨胀砼)";
        component2.hasFormula = 0;
        component2.formulaLength = 1;
        component2.number = sum_2;
        component2.subItemIndex = '410-3-3-3';
        component2.density = 1;
        component2.total = component2.number * component2.density * component2.formulaLength;
        box_2.data.push(component2);
        docx_2.data.push(box_2);
        //__________________________________________________________________________

        sum += MergeNum;


        // if ( sum == MergeNum ) {
        //     // begin or end
        //     sum_d = 2 * sum_3;
        // }
        // else if (sum < rows){
        //     sum_d = sum_3;
        // }
        // else {
        //     sum_d = 0;
        // }
        // if (sum_d) {
        //     //______________________墩顶现浇连续段___________________________________
        //     docx_3.UnitProj = UnitProj;
        //     docx_3.UnitProjItem = UnitProjItem;
        //     docx_3.SubProj = '墩顶现浇段'
        //     docx_3.SubProjItem = `第${cell.Offset(0, -1).Text}跨左幅墩顶现浇连续段`;
        //     docx_3.data = new Array();

        //     let box_3 = {}
        //     box_3.multiply = 1;
        //     box_3.info = {};
        //     box_3.info.TypeOfBeam = TypeOfBeam;
        //     box_3.info.content = '现浇C50砼';
        //     box_3.info.part = "墩顶现浇连续段";
        //     box_3.info.graphNo = "";
        //     box_3.data = new Array();

        //     let component3 = {};
        //     component3.index = '-';
        //     component3.material = "墩顶现浇(C50砼)";
        //     component3.hasFormula = 0;
        //     component3.formulaLength = 1;
        //     component3.number = sum_d;
        //     component3.subItemIndex = '410-5-5';
        //     component3.density = 1;
        //     component3.total = component3.number * component3.density * component3.formulaLength;
        //     box_3.data.push(component3);
        //     docx_3.data.push(box_3);

        //     let box_4 = {}
        //     box_4.multiply = 1;
        //     box_4.info = {};
        //     box_4.info.TypeOfBeam = TypeOfBeam;
        //     box_4.info.content = '预应力钢束';
        //     box_4.info.part = "墩顶负弯矩";
        //     box_4.info.graphNo = "";
        //     box_4.data = new Array();

        //     let component4 = {};
        //     component4.index = 'T1';
        //     component4.material = "Φs15.2高强低松弛钢绞线";
        //     component4.hasFormula = 0;
        //     component4.formulaLength = 1703.78;
        //     // component4.formulaLength = 2236.6;
        //     component4.number = 20 * MergeNum;
        //     component4.subItemIndex = '411-5-2';
        //     component4.density = 1.101;
        //     component4.total = component4.number * component4.density * component4.formulaLength/100;
        //     box_4.data.push(component4);

        //     // let component5 = {};
        //     // component5.index = 'T2';
        //     // component5.material = "Φs15.2高强低松弛钢绞线";
        //     // component5.hasFormula = 0;
        //     // component5.formulaLength = 1636.6;
        //     // component5.number = 10 * MergeNum;
        //     // component5.subItemIndex = '411-5-2';
        //     // component5.density = 1.101;
        //     // component5.total = component5.number * component5.density * component5.formulaLength/100;
        //     // box_4.data.push(component5);

        //     // let component6 = {};
        //     // component6.index = 'T3';
        //     // component6.material = "Φs15.2高强低松弛钢绞线";
        //     // component6.hasFormula = 0;
        //     // component6.formulaLength = 1036.6;
        //     // component6.number = 10 * MergeNum;
        //     // component6.subItemIndex = '411-5-2';
        //     // component6.density = 1.101;
        //     // component6.total = component6.number * component6.density * component6.formulaLength/100;
        //     // box_4.data.push(component6);


        //     docx_3.data.push(box_4);


        //     let res3 = await fetch(LocalHost + 'update' + `?database=CqDemo&collection=PartListNew`, {
        //         method: 'post',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify(docx_3)
        //     });

        //     cell.Offset(0, 6).Value2 = await res3.text();

        // }

        let res1 = await fetch(LocalHost + 'update' + `?database=CqDemo&collection=PartListNew`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(docx_1)
        });

        let res2 = await fetch(LocalHost + 'update' + `?database=CqDemo&collection=PartListNew`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(docx_2)
        });

        cell.Offset(0, 4).Value2 = await res1.text();
        cell.Offset(0, 5).Value2 = await res2.text();

        cell = cell.Item(MergeNum + 1, 1);
    }
}


async function toxianjiao() {
    let cell = wps.ActiveCell;
    let docx_1 = {};
    docx_1.UnitProj = cell.Offset(0, -6).Text;
    docx_1.UnitProjItem = cell.Offset(0, -5).Text;

    docx_1.SubProj = cell.Offset(0, -2).Text;
    docx_1.SubProjItem = cell.Offset(0, -1).Text;
    docx_1.data = new Array();


    let box_1 = {};
    box_1.multiply = 1;
    box_1.info = {};
    box_1.info.TypeOfBeam = cell.Offset(0, 1).Text;
    box_1.info.content = '现浇C50微膨胀砼';
    box_1.info.part = "叠合T梁桥面板";
    box_1.info.graphNo = "";
    box_1.data = new Array();

    let component1 = {};
    component1.index = '-';
    component1.material = "桥面板(C50微膨胀砼)";
    component1.hasFormula = 0;
    component1.formulaLength = 1;
    component1.number = cell.Value2;
    component1.subItemIndex = '410-3-3-3';
    component1.density = 1;
    component1.total = component1.number * component1.density * component1.formulaLength;
    box_1.data.push(component1);
    docx_1.data.push(box_1);


    let res1 = await fetch(LocalHost + 'update' + `?database=CqDemo&collection=PartListNew`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(docx_1)
    });
    cell.Offset(0, 4).Value2 = await res1.text();
}


// index	formulaLength	number				subItemIndex=415-1
// 跨	桥长	桥宽				
// 1	30	15.25	1			
// 2	30	15.25	1			
// 3	30	15.25	1			
// 4	31	15.29   1		
// 
// part
// "横隔梁"
// content
// "伸缩缝端-边梁"
// graphNo
// "TY-T-3-12"

async function DataGo() {
    let rows = wps.Selection.Rows.Count;
    let sum = 0;
    let cell = wps.Selection.Range("A1");
    let part = wps.ActiveSheet.Name.split('-');
    let UnitProj = part[0];
    let UnitProjItem = part[1];
    let SubProj = "桥面铺装";

    while (sum < rows) {
        let MergeNum = cell.MergeArea.Rows.Count;
        let SubProjItem = `第${cell.Text}联右幅混凝土桥面铺装`;
        let doc = {};
        doc.UnitProj = UnitProj;
        doc.UnitProjItem = UnitProjItem;
        doc.SubProj = SubProj;
        doc.SubProjItem = SubProjItem;
        doc.data = new Array();
        let box = {};
        box.multiply = 1;
        box.info = {};
        box.info.TypeOfBeam = "调平层";
        box.info.content = '现浇C50砼';
        box.info.part = "混凝土铺装";
        box.info.graphNo = "";
        box.data = new Array();
        for (let i = 1; i <= MergeNum; i++) {
            let component = {};
            component.index = cell.Item(i, -2).Text;
            component.material = "调平层(C50砼)";
            component.hasFormula = 0;
            component.formulaLength = Number(cell.Item(i, -1).Value2);
            component.number = Number(cell.Item(i, 0).Value2);
            component.subItemIndex = '415-1';
            component.density = 0.1;
            component.total = component.number * component.density * component.formulaLength;
            box.data.push(component);
        }
        doc.data.push(box);

        let res = await fetch(LocalHost + 'update' + `?database=CqDemo&collection=PartListNew`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doc)
        });
        cell.Offset(0, 2).Value2 = await res.text();
        sum += MergeNum;
        cell = cell.Item(MergeNum + 1, 1);
    }
}

async function toDataOfGuardrail() {
    const component_composite_abutment = {
        "info": {
            "TypeOfBeam": "桥梁附属",
            "part": "混凝土护栏",
            "content": "叠合梁SA桥台段",
            "graphNo": "TY-G-1-2"
        },
        "data": [
            {
                "index": "1",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 176,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"

            },
            {
                "index": "1a",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 60,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "2",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 242.7,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "3",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 33.9,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "4",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 86,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "5",
                "material": "C12",
                "hasFormula": 0,
                "formulaLength": 42,
                "number": 15,
                "density": 0.00888,
                subItemIndex: "403-4-2"

            },
            {
                "index": "6",
                "material": "C12",
                "hasFormula": 0,
                "formulaLength": 100,
                "number": 21,
                "density": 0.00888,
                subItemIndex: "403-4-2"


            },
            {
                "index": "◼",
                "material": "C30混凝土",
                "hasFormula": 0,
                "formulaLength": 0.361,
                "number": 1,
                "density": 1,
                subItemIndex: "410-6-4"

            }
        ]
    };
    const component_composite_span = {
        "info": {
            "TypeOfBeam": "桥梁附属",
            "part": "混凝土护栏",
            "content": "叠合梁SA桥跨段",
            "graphNo": "TY-G-1-2"
        },
        "data": [
            {
                "index": "1",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 129,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "2",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 268.7,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "3",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 33.9,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "4",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 86,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "5",
                "material": "C12",
                "hasFormula": 0,
                "formulaLength": 42,
                "number": 15,
                "density": 0.00888,
                subItemIndex: "403-4-2"


            },
            {
                "index": "6",
                "material": "C12",
                "hasFormula": 0,
                "formulaLength": 100,
                "number": 19,
                "density": 0.00888,
                subItemIndex: "403-4-2"


            },
            {
                "index": "◼",
                "material": "C30混凝土",
                "hasFormula": 0,
                "formulaLength": 0.388,
                "number": 1,
                "density": 1,
                subItemIndex: "410-6-4"

            }
        ]
    };
    const component_normal_abutment = {
        "info": {
            "TypeOfBeam": "桥梁附属",
            "part": "混凝土护栏",
            "content": "SA桥台段",
            "graphNo": "TY-G-1-2"
        },
        "data": [
            {
                "index": "1",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 170,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "1a",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 60,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "2",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 262.7,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "3",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 33.9,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "4",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 96,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "5",
                "material": "C12",
                "hasFormula": 0,
                "formulaLength": 42,
                "number": 15,
                "density": 0.00888,
                subItemIndex: "403-4-2"


            },
            {
                "index": "6",
                "material": "C12",
                "hasFormula": 0,
                "formulaLength": 100,
                "number": 21,
                "density": 0.00888,
                subItemIndex: "403-4-2"


            },
            {
                "index": "◼",
                "material": "C30混凝土",
                "hasFormula": 0,
                "formulaLength": 0.411,
                "number": 1,
                "density": 1,
                subItemIndex: "410-6-4"

            }
        ]
    };
    const component_normal_span = {
        "info": {
            "TypeOfBeam": "桥梁附属",
            "part": "混凝土护栏",
            "content": "SA桥跨段",
            "graphNo": "TY-G-1-2"
        },
        "data": [
            {
                "index": "1",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 123,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "2",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 288.7,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "3",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 33.9,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "4",
                "material": "C16",
                "hasFormula": 0,
                "formulaLength": 96,
                "number": 10,
                "density": 0.0158,
                subItemIndex: "403-4-2"


            },
            {
                "index": "5",
                "material": "C12",
                "hasFormula": 0,
                "formulaLength": 42,
                "number": 15,
                "density": 0.00888,
                subItemIndex: "403-4-2"


            },
            {
                "index": "6",
                "material": "C12",
                "hasFormula": 0,
                "formulaLength": 100,
                "number": 19,
                "density": 0.00888,
                subItemIndex: "403-4-2"

            },
            {
                "index": "◼",
                "material": "C30混凝土",
                "hasFormula": 0,
                "formulaLength": 0.438,
                "number": 1,
                "density": 1,
                subItemIndex: "410-6-4"
            }
        ]
    }
    let rows = wps.Selection.Rows.Count;
    let sum = 0;
    let cell = wps.Selection.Range("A1");
    while (sum < rows) {
        let MergeNum = 1;
        let docx = {};
        docx.data = new Array();
        docx._id = cell.Item(1, -4).Text;
        let box1 = component_normal_span;
        let box2 = component_normal_abutment;
        let multi1 = cell.Value2;
        let multi2 = cell.Offset(0, 1).Value2;
        if (cell.Offset(0, 2).Value2) {
            // composite
            box1 = component_composite_span;
            box2 = component_composite_abutment;
        }
        if (multi2) {
            box1.info.multiply = multi1;
            box2.info.multiply = multi2;
            docx.data.push(box1);
            docx.data.push(box2);
        }
        else {
            box1.info.multiply = multi1;
            docx.data.push(box1);
        }
        let res = await fetch(LocalHost + 'update' + `?database=CqDemo&collection=PartListNew`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(docx)
        });
        cell.Offset(0, 4).Value2 = await res.text();
        sum += MergeNum;
        cell = cell.Item(MergeNum + 1, 1);
    }
}

async function toDataSF() {
    let rows = wps.Selection.Rows.Count;
    let sum = 0;
    let cell = wps.Selection.Range("A1");
    while (sum < rows) {
        let MergeNum = 1;
        let docx = {};
        docx.data = new Array();
        docx._id = cell.Item(1, -3).Text;
        let box1 = {};
        box1.info = {};
        box1.data = new Array();

        box1.info.part = '伸缩缝';
        box1.info.TypeOfBeam = '';
        box1.multiply = 1;
        box1.info.content = '伸缩装置';
        box1.info.graphNo = 'TY-G-10-1';

        if (cell.Offset(0, -1).Text.includes('40')) {
            box1.info.content = '异型钢伸缩装置';
            box1.info.graphNo = 'TY-G-10-1';
            let component = {};
            component.index = '$';
            component.material = "40型伸缩缝";
            component.hasFormula = 0;
            component.formulaLength = Number(cell.Value2);
            component.number = 1;
            component.subItemIndex = '417-5-1';
            component.density = 1;
            component.total = component.number * component.density * component.formulaLength;
            box1.data.push(component);
        }
        else if (cell.Offset(0, -1).Text.includes('160')) {
            let component = {};
            component.index = '$';
            component.material = "160型伸缩缝";
            component.hasFormula = 0;
            component.formulaLength = Number(cell.Value2);
            component.number = 1;
            component.subItemIndex = '417-2-3';
            component.density = 1;
            component.total = component.number * component.density * component.formulaLength;
            box1.data.push(component);
        }
        else {
            let component = {};
            component.index = '$';
            component.material = "80型伸缩缝";
            component.hasFormula = 0;
            component.formulaLength = Number(cell.Value2);
            component.number = 1;
            component.subItemIndex = '417-2-1';
            component.density = 1;
            component.total = component.number * component.density * component.formulaLength;
            box1.data.push(component);
        }
        docx.data.push(box1);
        let res = await fetch(LocalHost + 'update' + `?database=CqDemo&collection=PartListNew`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(docx)
        });
        cell.Offset(0, 4).Value2 = await res.text();
        sum += MergeNum;
        cell = cell.Item(MergeNum + 1, 1);
    }
}

function zztoLength(x) {
    let arr = x.replaceAll(/[GBZJHxX*]/g, " ").trim().split(" ");
    let multiply = 1;
    for (let i of arr) {
        multiply = multiply * Number(i);
    }
    return multiply / 1000000;
}



async function toDataZZ() {
    let rows = wps.Selection.Rows.Count;
    let sum = 0;
    let cell = wps.Selection.Range("A1");
    while (sum < rows) {
        let MergeNum = 1;
        let docx = {};
        docx.data = new Array();
        docx._id = cell.Item(1, -4).Text;

        for (let j = 0; j < 3; j++) {
            let material = cell.Offset(0, 3 * j).Text;
            if (!material) {
                break;
            }
            let box = {};
            box.data = new Array();
            box.info = {};
            box.info.graphNo = 'TY-G-2-1';
            box.info.part = '支座';
            box.multiply = 1;
            if (material.includes('GBZJH')) {
                box.info.TypeOfBeam = 'T梁非连续墩';
                box.info.content = '四氟板式橡胶支座';
                let component = {};
                component.index = '#';
                component.material = material.replaceAll('*', 'x');
                component.hasFormula = 0;
                component.formulaLength = zztoLength(material);
                component.number = Number(cell.Offset(0, 3 * j + 1).Value2);
                component.subItemIndex = '416-1-2';
                component.density = 1;
                component.total = component.number * component.density * component.formulaLength;
                box.data.push(component);
            }
            else if (material.includes('GBZJ')) {
                box.info.TypeOfBeam = 'T梁连续墩';
                box.info.content = '板式橡胶支座';
                let component = {};
                component.index = '#';
                component.material = material.replaceAll('*', 'x');
                component.hasFormula = 0;
                component.formulaLength = zztoLength(material);
                component.number = Number(cell.Offset(0, 3 * j + 1).Value2);
                component.subItemIndex = '416-1-1';
                component.density = 1;
                component.total = component.number * component.density * component.formulaLength;
                box.data.push(component);
            }
            else {
                box.info.TypeOfBeam = '叠合梁';
                box.info.content = '球型支座';
                let component = {};
                component.index = '#';
                component.material = material.trim();
                component.hasFormula = 0;
                component.formulaLength = 1;
                component.number = Number(cell.Offset(0, 3 * j + 1).Value2);
                component.subItemIndex = cell.Offset(0, 3 * j + 2).Text;
                component.density = 1;
                component.total = component.number * component.density * component.formulaLength;
                box.data.push(component);
            }
            docx.data.push(box);
        }
        let res = await fetch(LocalHost + 'update' + `?database=CqDemo&collection=PartListNew`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(docx)
        });
        cell.Offset(0, 10).Value2 = await res.text();
        sum += MergeNum;
        cell = cell.Item(MergeNum + 1, 1);
    }
}


async function toDataFS() {
    let rows = wps.Selection.Rows.Count;
    let sum = 0;
    let cell = wps.Selection.Range("A1");
    while (sum < rows) {
        let MergeNum = 1;
        let docx = {};
        docx.data = new Array();
        docx._id = cell.Text;
        let box = {};
        box.data = new Array();
        box.info = {};
        box.info.graphNo = cell.Offset(0, 1).Text;
        box.info.part = '桥梁基础';
        box.multiply = 1;
        box.info.TypeOfBeam = '全桥';
        box.info.content = (cell.Offset(0, -2).Text.includes('回填') ? '基础挖填' : '锥坡防护');
        let component = {};
        component.index = '&';
        component.material = cell.Offset(0, -2).Text;
        component.hasFormula = 0;
        component.formulaLength = 1;
        component.number = Number(cell.Offset(0, -1).Value2);
        component.subItemIndex = cell.Offset(0, -3).Text;
        component.density = 1;
        component.total = component.number * component.density * component.formulaLength;
        box.data.push(component);
        docx.data.push(box);

        let res = await fetch(LocalHost + 'update' + `?database=CqDemo&collection=PartListNew`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(docx)
        });
        cell.Offset(0, 4).Value2 = await res.text();
        sum += MergeNum;
        cell = cell.Item(MergeNum + 1, 1);
    }
}

async function positionRebarPush(cell) {
    let str = getParam(
        'database', 'CqDemo',
        'collection', 'RHGS_TJ02_11090134',
        'pid', cell.Text,
        'tid', cell.Offset(0, 1).Text);
    let res = await fetch(LocalHost + 'pre' + str, {
        method: 'get',
        headers: {
            'Content-Type': 'text/plain'
        }
    });
    cell.Offset(0, 2).Value2 = await res.text();
}


async function positionRebarPushAll() {
    let startCell = wps.ActiveCell;
    do {
        await positionRebarPush(startCell);
        startCell = startCell.Offset(1, 0);
    } while (startCell.Value2);
}


let negativeMomentType = {
    '160伸缩缝边跨(H=2.0)': 1,
    '160伸缩缝边跨(H=2.5)': 2,
    '20m160伸缩缝边跨(H=2)': 1,
    '20m160伸缩缝边跨(H=2m)': 1,
    '20m80伸缩缝边跨(H=1.7)': 3,
    '20m80伸缩缝边跨(H=2)': 1,
    '25m中跨(H=1.7)': 3,
    '28m160伸缩缝边跨(H=2m)': 1,
    '30m160伸缩缝边跨(H=2)': 1,
    '30m160伸缩缝边跨(H=2.5)': 2,
    '30m160伸缩缝边跨(H=2.5m)': 2,
    '30m160伸缩缝边跨(H=2m)': 1,
    '30m80伸缩缝边跨(H=2)': 1,
    '30m80伸缩缝边跨(H=2m)': 1,
    '30m中跨': 1,
    '30m中跨(H=2)': 1,
    '30m中跨(H=2.0)': 1,
    '30m中跨(H=2m)': 1,
    '30m边跨(160型伸缩缝)': 1,
    '30m边跨(80型伸缩缝)': 1,
    '30m连续中跨(H=2)': 1,
    '40m中跨(H=2.5)': 2,
    '41m中跨(H=2.5m)': 2,
    '80伸缩缝边跨(H=2.0)': 1,
    'H1.7连续梁': 3,
    'H2.0连续梁': 1,
    'H2.5连续T梁': 2,
    '中跨中梁(H=2.0)': 1,
    '中跨中梁(H=2.5)': 2,
    '矮T梁LY': 0,
    '矮T梁Lz': 0,
    '连续矮T梁': 0
}