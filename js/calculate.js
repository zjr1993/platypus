function reforceSolid(text){
    if (text[0]=='C'){
        return "C" + text.slice(1,) + "混凝土";
    }
    return text;
}

function RebarDensity(d){
    let Den = null;
    switch (d) {
        case 6:
            Den = 0.222;
            break;
        case 8:
            Den = 0.395;
            break;
        case 10:
            Den = 0.617;
            break;
        case 12:
            Den = 0.888;
            break;
        case 14:
            Den = 1.21;
            break;
        case 16:
            Den = 1.58;
            break;
        case 18:
            Den =2;
            break;
        case 20:
            Den = 2.47;
            break;
        case 22:
            Den = 2.98;
            break;
        case 25:
            Den = 3.85;
            break;
        case 28:
            Den = 4.83;
            break;
        case 32:
            Den = 6.31;
            break;
        default:
            break;
    }
    return Den;
}


// 转换成钢筋符号
function ConvetToRebarSymbol(){
    let cell = wps.EtApplication().ActiveCell;
	while ( cell.Value2 ){
        let v = cell.Value2;
        if (Number(v)){
            let n = Number(v);
            if (n<=10){
                cell.Formula = `A${n}`;
                setCellCharFont(cell, "SJQY", false, true, 1, 1);
                // cell.Characters(1,1).Font.Size = 12;
            }
            else {
                cell.Formula = `C${n}`;
                setCellCharFont(cell, "SJQY", false, true, 1, 1);
                // cell.Characters(1,1).Font.Size = 12;
            }
            cell.Offset(0,1).Formula = RebarDensity(n);
        }
        else {
            cell.Formula = reforceSolid(cell.Text);
            // setCellCharFont(cell, '仿宋', true, false, 1, 3);
            break;
        }
        cell = cell.Offset(1,0);
    }
}

function InsertTable(){
    let cell = wps.ActiveCell;
    let num = Number(cell.Formula);
    if (num == 0){
        alert('请输入行数');
        return false;
    }
    ArrayXPut(cell, ['内容','编号','材料类型','密度(Kg/m)','长度(cm)','数量(根数)','复核数量(Kg)',
                        '设计数量(Kg)','复核-设计(Kg)','类型','图纸','参数1','参数2','参数3','参数4','参数5'])
    for (let cq=1;cq <= num;cq++){
        cell.Offset(cq,1).Formula = cq; // 编号
        cell.Offset(cq,6).FormulaR1C1Local=`=ROUND( R[0]C[-1]*R[0]C[-2]*R[0]C[-3]/100,2 )`;
        cell.Offset(cq,8).FormulaR1C1Local=`=R[0]C[-2]-R[0]C[-1]`;
    }
    cellMergedY(cell.Offset(1, 0), num);
    cellMergedY(cell.Offset(1, 9), num);
    cellMergedY(cell.Offset(1, 10), num);
    setStandardize(wps.Range(cell, cell.Item(num+1, 16)));
    return true;
}

function InsertTableEx(){
    let cell = wps.ActiveCell;
    let num = Number(cell.Formula);
    if (num == 0){
        alert('请输入行数');
        return false;
    }
    let cq=1;
    ArrayXPut(cell, ['内容','编号','材料类型','密度(Kg/m)','长度(cm)','数量(根数)','复核数量(Kg)',
                        '设计数量(Kg)','复核-设计(Kg)','说明','图号','参数1','参数2','参数3','参数4','参数5'])


    for (;cq <= num-1;cq++){
        cell.Offset(cq,1).Formula = cq; // 编号
        cell.Offset(cq,6).FormulaR1C1Local=`=ROUND( R[0]C[-1]*R[0]C[-2]*R[0]C[-3]/100,2 )`;
        cell.Offset(cq,8).FormulaR1C1Local=`=R[0]C[-2]-R[0]C[-1]`;
    }
    cell.Offset(cq, 1).Formula = '◼';
    cell.Offset(cq,6).FormulaR1C1Local=`=ROUND( R[0]C[-1]*R[0]C[-2]*R[0]C[-3],2 )`;
    cell.Offset(cq, 8).FormulaR1C1Local=`=R[0]C[-2]-R[0]C[-1]`;

    cellMergedY(cell.Offset(1, 0), num);
    cellMergedY(cell.Offset(1, 9), num);
    cellMergedY(cell.Offset(1, 10), num);
    setStandardize(wps.Range(cell, cell.Item(num+1, 16)));
    return true;
}


// 对于用 InsertTable 和 InsertTableEx 创建的表进行自动汇总
function GatherTable(){
    function isRebar(t){
        let reg = new RegExp("^(A(\\d|10)|C\\d{2})$");
        if (reg.test(t)){
            return true;
        }
        return false;
    }
    let xcell = navToLTCellInLUA(wps.ActiveCell);
    if (xcell==null){
        alert("错误❌：未选中要汇总的表格");
        return false;
    }
    xcell = xcell.Offset(1, 0);

    let content = xcell.Text;// 内容
    // let formula = xcell.Offset(0, 9).Formula;// 公式
    let graphIndex = xcell.Offset(0, 10).Text;// 图号
    let note = xcell.Offset(0, 9).Text; // 说明

    let cell = xcell.Offset(0, 2); // 材料

    let numItems = xcell.MergeArea.Rows.Count;
    let j = 0;

    if (numItems <= 1) {
        alert('汇总项目过少，请检查!');
        return false;
    }
    // 申明一个新的字典来存储不同类型的量
    let dict = new Map();

    while (++j <= numItems){
        let key = cell.Text;
        let pcell = cell.Offset(0,4);
        if (dict.has(key)){
            let nowValue = dict.get(key);
            // "B2,D1" + "," + "E12"
            nowValue = nowValue + "," + pcell.Address(false, false, 1 /* xlA1 */,false);
            dict.set(key,nowValue);
        }
        else {
            dict.set(key,pcell.Address(false, false, 1 /* xlA1 */,false));
        }
        cell = cell.Offset(1,0);
    }
    // 需要插入新行
    numItems=0;
    for (t of dict){
        numItems++;
    }
    insertBeneath(cell, numItems+1);
    xcell = cell.Offset(1, -2);
    cell = cell.Offset(2, 0);

    createIDTbale(xcell, numItems);

    xcell.Item(2, 8).Formula = graphIndex;
    if ( note ) { xcell.Item(2, 7).Formula = content + '(' + note + ')'; }
    else { xcell.Item(2, 7).Formula = content; }
    xcell.Item(2, 7).WrapText = true;
    
    for (t of dict){
        cell.Formula = t[0];
        if (isRebar(t[0])){
            cell.Characters(1,1).Font.Name = "SJQY";
            cell.Characters(1,1).Font.Size = 12;
            cell.Characters(1,1).Font.Italic = true;
            cell.Characters(1,1).Font.Bold = true;
            cell.Characters(1,1).Font.Color = DeepSkyBlue;
        }
        else {
            cell.Font.Size = 12;
            // cell.Font.Italic = true;
            cell.Font.Bold = true;
            cell.Font.Color = DeepPink;
        }
        // let total = cell.Offset(0,2).Address(false, false, 1 /* xlA1 */,false);
        let formula = `=SUM(${t[1]})`;
        cell.Offset(0, 1).Formula = formula;
        cell.Offset(0, 2).Formula = formula.replaceAll('G', 'I');

        cell = cell.Offset(1,0);
    }
    return true;
}

// 创建一个汇总表
function createIDTbale(cell, num) {
    var setBIColor = (font, color) => {
        font.Font.Bold = true;
        font.Font.Italic = true;
        font.Font.Color = color;
    }
    ArrayXPut(cell, ["_ID", "子目号", "材料类型", "复核合计", "复核-设计", "重复数", "内容", "图号", "单元数目", "WBS"]);

    cellMergedY(cell.Offset(1, 0), num);
    cellMergedY(cell.Offset(1, 6), num);
    cellMergedY(cell.Offset(1, 7), num);
    cellMergedY(cell.Offset(1, 8), num);
    cellMergedY(cell.Offset(1, 9), num);

    for (let k = 1; k <= num; k++) {
        // 重复数预设为1
        cell.Item(k + 1, 6).Formula = 1;
    }

    setStandardize(wps.Range(cell, cell.Item(num+1, 10)));
    setBackgroundColor(wps.Range(cell, cell.Offset(0, 9)), PeachPuff);

    setBIColor(cell, Magenta);
    cell.Item(1, 9).Font.Color = DarkSlateGray;

    let area = wps.Range(cell.Item(2, 2), cell.Item(num + 1, 2));

    setBIColor(area, DarkOrange);

    return true;
}

class SubFormula {
    constructor (sub, filter){
        this.sub = sub;
        this.filter = filter;
        this.namespace = {};
    }
    Convert(formula){
        for (var key in this.sub){
            formula = formula.replaceAll(key, this.sub[key]);
        }
        formula = formula.replaceAll(/[A-Z]+\d+/g, (match)=>{
            let name = wps.Range(match).Offset(-1, 0).Text;
            if (this.filter[name]){
                return wps.Range(match).Value2;
            }
            else {
                this.namespace[name] = wps.Range(match).Value2;
                return name;
            }
        })
        return formula;
    }
}

function UpLoadTemTable(){
    let cell = navToLTCellInLUA(wps.ActiveCell);

    let num = cell.Offset(1, 0).MergeArea.Rows.Count;

    let TypeOfBeam = wps.ActiveSheet.Name;
    let part = cell.Offset(1,0).Text;
    let content = cell.Item(2, 10).Text;
    let graphNo = cell.Item(2, 11).Text;
    let stract = new SubFormula({
        '$': '',
        '=': '',
        '^': '**'},{
        'k1': 1,
        'k2': 1,
        '△L1': 1,
        '△L2': 1,
        '△': 1
    });

    let i=2;
    let arr = new Array();
    for (;i<=num+1;i++){
        let obj = {};
        obj['index']=cell.Item(i,2).Text;
        obj['material'] = cell.Item(i, 3).Text;
        obj['hasFormula'] = 0;
        let formulaLength = cell.Item(i, 5).Formula;
        let number = cell.Item(i, 6).Formula;

        if (cell.Item(i, 5).HasFormula){
            obj['hasFormula'] = 1;
            formulaLength = stract.Convert(formulaLength);
        }
        else {
            formulaLength = cell.Item(i, 5).Value2;
        }

        if (cell.Item(i, 6).HasFormula){
            obj['hasFormula'] = 1;
            number = stract.Convert(number);
        }
        else {
            number = cell.Item(i, 6).Value2;
        }
        obj['formulaLength'] = formulaLength;
        obj['number'] =number;
        arr.push(obj);
    }
    var body={};
    body['info']={};
    body['info']['TypeOfBeam'] = TypeOfBeam;
    body['info']['part']       = part;
    body['info']['content']    = content;
    body['info']['graphNo']    = graphNo;
    body['data'] = arr;
    body['param']=stract.namespace;

    return body;
}

function upStardTable(){
    let cell = navToLTCellInLUA(wps.ActiveCell);
    let num = cell.Offset(1, 0).MergeArea.Rows.Count;
    let part = cell.Offset(1, 0).Text;
    let content = cell.Item(2, 10).Text;
    let graphNo = cell.Item(2, 11).Text;
    let i =2;
    let arr = new Array();
    for (;i<=num+1;i++){
        let component = {};
        component.index = cell.Item(i, 2).Text;
        component.material = cell.Item(i, 3).Text;
        component.hasFormula = 0;
        component.formulaLength = cell.Item(i, 5).Value2;
        component.number = cell.Item(i, 6).Value2;
        component.subItemIndex = cell.Item(i, 12).Text;
        component.density = cell.Item(i, 4).Value2/100;
        component.total = component.number * component.density * component.formulaLength;
        arr.push(component);
    }
    var body={};
    body['info']={};
    body['info']['TypeOfBeam'] = "钢混叠合梁";
    body['info']['part']       = part;
    body['info']['content']    = content;
    body['info']['graphNo']    = graphNo;
    body['data'] = arr
    return body;
}




function upPartDivide(){
    let sheets = wps.EtApplication().ActiveWorkbook.Worksheets;
    for (let i=1;i<=sheets.Count;i++){
        let sheet = sheets.Item(i);
        let cell = sheet.Cells.Find("Identity",sheet.Cells.Item(1,1),WPS_Enum.xlValues,WPS_Enum.xlWhole,WPS_Enum.xlByRows,WPS_Enum.xlNext,false,false,false);
        if (cell){
            let bcell = cell.Offset(1, 0);
            do {
                bcell = UnitPartProjGen(bcell, 500);
            }while(bcell.Value2);
        }
    }
}


// 分部分项
function UnitPartProjGen(scell, limit=500){
    var count = 0;
    let documents = new Array();
    var cell = scell;
    var cell2 = scell;
    do {
        let doc = {};
        let a1 = cell.Offset(0,-11).MergeArea.Range("A1").Text.trim();
        let a2 = cell.Offset(0,-9).MergeArea.Range("A1").Text.trim();
        let a3 = cell.Offset(0,-7).MergeArea.Range("A1").Text.trim();
        let a4 = cell.Offset(0,-5).MergeArea.Range("A1").Text.trim();
        let a5 = cell.Offset(0,-3).MergeArea.Range("A1").Text.trim();
        let a6 = cell.Offset(0,-1).MergeArea.Range("A1").Text.trim();

        a1 = a1.length == 1 ? '0' + a1 : a1
        a2 = a2.length == 1 ? '0' + a2 : a2
        a3 = a3.length == 1 ? '0' + a3 : a3
        a4 = a4.length == 1 ? '0' + a4 : a4
        a5 = a5.length == 1 ? '0' + a5 : a5
        a6 = a6.length == 1 ? '0' + a6 : a6

        let checkIdentity = `RHGS-TJ02-${a1}${a2}${a3}${a4}${a5}${a6}`;

        if ( checkIdentity != cell.Text.trim() ){
            cell.Offset(0, 1).Value2 = checkIdentity;
            setBackgroundColor(cell.Offset(0, 1), OldLace);
        }
        else {
            doc['Identity'] = checkIdentity;
            doc['UnitProj'] = cell.Offset(0,-12).MergeArea.Range("A1").Text.trim();
            doc['UnitProjItem'] = cell.Offset(0,-10).MergeArea.Range("A1").Text.trim();
            doc['PartProj'] = cell.Offset(0,-8).MergeArea.Range("A1").Text.trim();
            doc['PartProjItem'] = cell.Offset(0,-6).MergeArea.Range("A1").Text.trim();
            doc['SubProj'] = cell.Offset(0,-4).MergeArea.Range("A1").Text.trim();
            doc['SubProjItem'] = cell.Offset(0,-2).MergeArea.Range("A1").Text.trim();
            documents.push(doc);
        }
        cell = cell.Offset(1, 0);
        count ++;
    } while(cell.Value2 && count < limit);

    sendManyDocuments('PartList', documents).then((value)=>{
        if (value.status == 200 || value.status == 303){
            let j= 0;
            for (let i=0;i<count;i++){
                if (cell2.Offset(0, 1).Text.includes('RH')){
                    cell2 = cell2.Offset(1, 0);
                    continue;
                }
                cell2.Offset(0, 1).Formula = value.data[j++];
                if (value.status == 303){
                    setBackgroundColor(cell2, DodgerBlue);
                }
                cell2 = cell2.Offset(1, 0);
            }
        }
        else {
            alert("some error happen!");
        }
    });
    return cell;
}

function UnitPartProjGenTest(limit=500){
    var count = 0;
    let documents = new Array();
    var cell = wps.ActiveCell;
    do {
        let doc = {};
        let a1 = cell.Offset(0,-11).MergeArea.Range("A1").Text.trim();
        let a2 = cell.Offset(0,-9).MergeArea.Range("A1").Text.trim();
        let a3 = cell.Offset(0,-7).MergeArea.Range("A1").Text.trim();
        let a4 = cell.Offset(0,-5).MergeArea.Range("A1").Text.trim();
        let a5 = cell.Offset(0,-3).MergeArea.Range("A1").Text.trim();
        let a6 = cell.Offset(0,-1).MergeArea.Range("A1").Text.trim();

        a1 = a1.length == 1 ? '0' + a1 : a1
        a2 = a2.length == 1 ? '0' + a2 : a2
        a3 = a3.length == 1 ? '0' + a3 : a3
        a4 = a4.length == 1 ? '0' + a4 : a4
        a5 = a5.length == 1 ? '0' + a5 : a5
        a6 = a6.length == 1 ? '0' + a6 : a6

        let checkIdentity = `RHGS-TJ02-${a1}${a2}${a3}${a4}${a5}${a6}`;

        if ( checkIdentity != cell.Text.trim() ){
            cell.Offset(0, 1).Value2 = checkIdentity;
            setBackgroundColor(cell.Offset(0, 1), OldLace);
        }
        else {
            doc['Identity'] = checkIdentity;
            doc['UnitProj'] = cell.Offset(0,-12).MergeArea.Range("A1").Text.trim();
            doc['UnitProjItem'] = cell.Offset(0,-10).MergeArea.Range("A1").Text.trim();
            doc['PartProj'] = cell.Offset(0,-8).MergeArea.Range("A1").Text.trim();
            doc['PartProjItem'] = cell.Offset(0,-6).MergeArea.Range("A1").Text.trim();
            doc['SubProj'] = cell.Offset(0,-4).MergeArea.Range("A1").Text.trim();
            doc['SubProjItem'] = cell.Offset(0,-2).MergeArea.Range("A1").Text.trim();
            documents.push(doc);
        }
        cell = cell.Offset(1, 0);
        count ++;
    } while(cell.Value2 && count < limit);
    return cell;
}


// 工程量清单
function BigTableGen(limit=500){
    var count = 0;
    let documents = new Array();
    var cell = wps.ActiveCell;
    var cell2 = wps.ActiveCell;

    do {
        let doc = {};
        doc['order'] = count+1;
        doc['subItemIndex'] = cell.Text.trim();
        doc['subItemName'] = cell.Offset(0, 1).Text.trim();
        if (cell.Offset(0, 2).Value2){
            doc['unit'] = cell.Offset(0,2).Text.trim();
            doc['quality'] = Number(cell.Offset(0,3).Formula);
            doc['price'] = Number(cell.Offset(0,4).Formula);
            doc['total'] = Number(cell.Offset(0,5).Formula);
        }
        cell = cell.Offset(1, 0);
        documents.push(doc);
        count++;
    } while(cell.Value2 && count < limit);
    sendManyDocuments('insert', documents).then((value)=>{
        if (value.status == 200 || value.status == 303){
            for (var objID of value.data){
                cell2.Offset(0, 6).Formula = objID;
                cell2 = cell2.Offset(1, 0);
                if (value.status == 303){
                    setBackgroundColor(cell, DodgerBlue);
                }
            }
        }
        else {
            alert("some error happen!");
        }
    })
}

function gatherthisBridge(){
    let sheets = wps.EtApplication().ActiveWorkbook.Worksheets;
    let bookname = wps.EtApplication().ActiveWorkbook.Name;
    let gatherSheet = getWorkBook("gather.xlsx").Worksheets.Item(1);

    for (let i=1;i<=sheets.Count;i++){

        let sheet = sheets.Item(i);
        let cell = sheet.Cells.Find("子目号",sheet.Cells.Item(1,1),WPS_Enum.xlValues,WPS_Enum.xlWhole,WPS_Enum.xlByRows,WPS_Enum.xlNext,false,false,false);
        let beginCell = gatherSheet.Range("A50000").End(WPS_Enum.xlUp).Offset(1,0);
        if (cell){
            cell = cell.Offset(1, 0);
            do {
                let xcell = cell.Item(1, cell.MergeArea.Columns.Count+1);
                let xcell2 = xcell.Item(1, xcell.MergeArea.Columns.Count+1);
                if (Number(xcell2.Value2)>0.001){
                    beginCell.Value2 = cell.Text;
                    beginCell.Offset(0, 1).Value2 = xcell.Text;
                    beginCell.Offset(0, 2).Value2 = Number(xcell2.Value2);
                    beginCell.Offset(0, 3).Value2 = sheet.Name;
                    beginCell.Offset(0, 4).Value2 = bookname;
                    beginCell = beginCell.Offset(1, 0);
                }
                cell = cell.Offset(1, 0);
            }while(cell.Value2);
        }
    }
}

function standardTable(){
    let sheets = wps.EtApplication().ActiveWorkbook.Worksheets;
    for (let i = 1; i <= sheets.Count; i++) {
        let sheet = sheets.Item(i);
        for (let j=1;j<=sheet.HPageBreaks.Count;j++){
            let cell = sheet.HPageBreaks.Item(j); // first breakline
            let addr = cell.Location.Address();
            let range = sheet.Cells.Range(addr);
            let xcell = range;
            for (let k=1;k<30;k++){
                xcell = range.Item(1, k);
                let scell = xcell.MergeArea.Range("A1");
                if (scell.Address().split("$").pop() != xcell.Address().split("$").pop()){
                    // 存在合并的情况
                    let rows = xcell.MergeArea.Rows.Count;
                    let cols = xcell.MergeArea.Columns.Count;
                    let v = scell.Value2;
                    scell.UnMerge();
                    sheet.Range(scell, scell.Item(xcell.Row - scell.Row, cols)).Merge();
                    sheet.Range(scell.Item(xcell.Row - scell.Row+1,1), scell.Item(rows,  cols)).Merge();
                    scell.Item(xcell.Row - scell.Row+1,1).Value2 = `'${v}`;
                }
            }
        }
    }
}


// function standardTablePrint(){
//     let num = Number(wps.ActiveCell.Value2);
//     let sheets = wps.EtApplication().ActiveWorkbook.Worksheets;
//     for (let i = 1; i <= sheets.Count; i++) {
//         let sheet = sheets.Item(i);
//         (obj=>{
//             obj.PrintTitleRows = `$1:$${num}`;
//             obj.FitToPagesWide = 1;
//             obj.FitToPagesTall = 0;
//             obj.Orientation = xlLandscape;
//             obj.CenterHorizontally = true;
//             obj.CenterVertically = false;
//         })(sheet.PageSetup);
//         sheet.Range("A1:Z8000").Interior.Pattern = xlPatternNone;
//     }
// }

function setConditionNotBetween(range, threshold){
    range.FormatConditions.Add(1, 2, `=-${threshold}`, `=${threshold}`, undefined, undefined, undefined, undefined);
    range.FormatConditions.Item(range.FormatConditions.Count).SetFirstPriority();
    range.FormatConditions.Item(1).Font.Bold = 1;
	range.FormatConditions.Item(1).Font.Italic = 1;
	range.FormatConditions.Item(1).Font.ThemeColor = 10;
	range.FormatConditions.Item(1).Font.TintAndShade = 0;
	range.FormatConditions.Item(1).StopIfTrue = false;
}

function writeDocTowps(documents, threshold){
    let cell = wps.ActiveSheet.Cells.Item(1, 1);
    ArrayXPut(cell, ["子目号","子目名称","单位", "数量", "单价", "合价",
    "复核量", "复核合价", "数量差", "合价差"]);
    let xcell = cell.Offset(1, 0);
    for (let doc of documents){
        xcell.Formula = doc.subItemIndex;
        xcell.Offset(0,1).Formula = doc.subItemName;
        xcell.Offset(0,2).Formula = doc.unit;
        xcell.Offset(0,3).Formula = doc.quality;
        xcell.Offset(0,4).Formula = doc.price;
        xcell.Offset(0,5).Formula = doc.total;
        xcell.Offset(0,6).Formula = doc.checkNumber;
        if (doc.unit){
            xcell.Offset(0,7).FormulaR1C1Local = `=ROUND(R[0]C[-3]*R[0]C[-1],0)`;
            xcell.Offset(0,8).FormulaR1C1Local = `=ROUND(R[0]C[-2]-R[0]C[-5],2)`;
            xcell.Offset(0,9).FormulaR1C1Local = `=ROUND(R[0]C[-2]-R[0]C[-4],0)`;
        }
        xcell = xcell.Offset(1, 0);
    }
    setStandardize(wps.Range(cell, xcell.Offset(-1, 0).Offset(0, 9)));
    setConditionNotBetween(wps.Range(cell.Offset(1, 0).Offset(0, 9), xcell.Offset(-1, 0).Offset(0, 9)),threshold);
}

function getTableTowps(threshold){
    let _collection = localStorage.getItem("ProjectCol");
    let filters = {};
    let options = {
        sort: { order:1 },
        projection: {
            _id:0,
            subItemIndex:1,
            subItemName: 1,
            unit:1,
            quality:1,
            price: 1,
            total:1,
            checkNumber: 1
        }
    };
    fetch(LocalHost + 'filters'+`?database=CqDemo&collection=${_collection}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({filters: filters, options: options})
    }).then((res)=>{
        let status = res.status;
        if (status!=200){
            alert("some error happen!");
            return Promise.reject();
        }
        else {
            return res.json();
        }
    }).then((v)=>{
        writeDocTowps(v, threshold);
    });
}