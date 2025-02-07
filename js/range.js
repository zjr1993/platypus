// 获得当前单元所在 局域使用区域(用线框界定) 的左上角单元
function navToLTCellInLUA(cell) {
    do {
        if (cell.MergeCells ||
            cell.Value2 || (cell.Borders.Item(WPS_Enum.xlEdgeTop).LineStyle > 0 && cell.Borders.Item(WPS_Enum.xlEdgeRight).LineStyle > 0)) {
            var rowCell = cell;
            cell = cell.Offset(-1, 0);
        }
        else {
            break;
        }
    } while (cell != null);

    if (rowCell == null) return null;

    do {
        if (rowCell.MergeCells || rowCell.Value2 || (rowCell.Borders.Item(WPS_Enum.xlEdgeLeft).LineStyle > 0 && cell.Borders.Item(WPS_Enum.xlEdgeBottom).LineStyle > 0)) {
            var colCell = rowCell;
            rowCell = rowCell.Offset(0, -1);
        }
        else {
            break;
        }
    } while (rowCell != null);
    return colCell;
}

// range setting
function setBorder(rng, ColorIndex = WPS_Enum.xlColorIndexAutomatic,
    Weight = WPS_Enum.xlThin, LineStyle = WPS_Enum.xlContinuous) {
    const hd = s => { s.Weight = Weight; s.LineStyle = LineStyle; s.ColorIndex = ColorIndex; };
    hd(rng.Borders.Item(WPS_Enum.xlEdgeTop));
    hd(rng.Borders.Item(WPS_Enum.xlEdgeBottom));
    hd(rng.Borders.Item(WPS_Enum.xlEdgeRight));
    hd(rng.Borders.Item(WPS_Enum.xlEdgeLeft));
    hd(rng.Borders.Item(WPS_Enum.xlInsideVertical));
    hd(rng.Borders.Item(WPS_Enum.xlInsideHorizontal));
}

function setAlgin(rng, vertical = WPS_Enum.xlVAlignCenter, horizontal = WPS_Enum.xlHAlignCenter) {
    rng.VerticalAlignment = vertical;
    rng.HorizontalAlignment = horizontal;
}

function setBackgroundColor(rng, color) {
    rng.Interior.Pattern = WPS_Enum.xlPatternSolid;
    rng.Interior.PatternColorIndex = -4105;
    rng.Interior.TintAndShade = 0;
    rng.Interior.Color = color;
}


function setFontStyle(rng, Bold = true, Italic = true, color_index = WPS_Enum.xlColorIndexAutomatic) {
    rng.Font.Bold = Bold;
    rng.Font.Italic = Italic;
    rng.Font.ColorIndex = color_index
}


function setStandardize(rng, ColorIndex = WPS_Enum.xlColorIndexAutomatic, Weight = WPS_Enum.xlThin, LineStyle = WPS_Enum.xlContinuous) {
    setAlgin(rng);
    setBorder(rng, ColorIndex, Weight, LineStyle);
}


function setCellCharFont(cell, family, Bold = false, Italic = false, start = 1, number = 1) {
    cell.Characters(start, number).Font.Name = family;
    cell.Characters(start, number).Font.Bold = Bold;
    cell.Characters(start, number).Font.Italic = Italic;
}

function setCellCharFontAll(){
    let strRange = wps.Selection.Address();
    let arrayRangeAddress = strRange.split(",");

    let cell;
    let n;
    for (let m of arrayRangeAddress) {
        cell = wps.Range(m);
        n = cell.Count;
        for (let i = 1; i <= n; i++) {
            if (/^[AC]\d{2}$/.test(cell.Item(i).Text)){
                setCellCharFont(cell.Item(i), 'SJQY');
            }
        }
    }
}

function setGridDialog(rng) {
    rng.Borders.Item(WPS_Enum.xlDiagonalDown).LineStyle = WPS_Enum.xlContinuous;
    rng.Borders.Item(WPS_Enum.xlDiagonalDown).ColorIndex = WPS_Enum.xlColorIndexAutomatic;
}

function insertBeneath(start_cell, nums) {
    let cell = start_cell.Offset(1, 0);
    let row = cell.Row;
    (s => {
        s.Insert(WPS_Enum.xlShiftDown, undefined);
    })(wps.Rows.Item(`${row}:${row + nums - 1}`));
    return true;
}

function cellToDocument(cell) {
    let document = {};
    let rng = cell.MergeArea;
    document['row'] = cell.Row;
    document['col'] = cell.Column;
    document['subMergence'] = false;
    if (cell.MergeCells) {
        if (cell.Address() == rng.Range("A1").Address()) {
            document['merge_row'] = rng.Rows.Count;
            document['merge_col'] = rng.Columns.Count;
        }
        else {
            document['subMergence'] = true;
            return document;
        }
    }

    if (cell.Value2 == null) {
        document['type'] = 0;
        document['content'] = null;
    }
    else if (cell.HasFormula) {
        document['type'] = 1;
        document['content'] = cell.FormulaR1C1Local;
    }
    else if (typeof (cell.Value2) == 'string') {
        document['type'] = 2;
        document['content'] = cell.Text;
        if (cell.Characters(1, 1).Font.Name == "SJQY") { // 特殊情况，钢筋符号
            document['sjqy'] = true;
        }
    }
    else if (typeof (cell.Value2) == 'number') {
        document['type'] = 3;
        document['content'] = cell.Formula;
    }
    else {
        document['type'] = 4;
        document['content'] = cell.Text;
    }
    // 内容对齐方式
    document['HorizontalAlignment'] = rng.HorizontalAlignment; // 水平对齐方式
    document['VerticalAlignment'] = rng.VerticalAlignment; // 垂直对齐方式

    // 边框颜色
    document['xlEdgeLeft'] = rng.Borders.Item(WPS_Enum.xlEdgeLeft).ColorIndex; // 左边框颜色
    document['xlEdgeRight'] = rng.Borders.Item(WPS_Enum.xlEdgeRight).ColorIndex; // 右边框颜色
    document['xlEdgeBottom'] = rng.Borders.Item(WPS_Enum.xlEdgeBottom).ColorIndex; // 底边框颜色
    document['xlEdgeTop'] = rng.Borders.Item(WPS_Enum.xlEdgeTop).ColorIndex; // 顶边框颜色

    // 边框线宽磅数
    document['xlEdgeRightLineWeight'] = rng.Borders.Item(WPS_Enum.xlEdgeRight).Weight;
    document['xlEdgeLeftLineWeight'] = rng.Borders.Item(WPS_Enum.xlEdgeLeft).Weight;
    document['xlEdgeBottomLineWeight'] = rng.Borders.Item(WPS_Enum.xlEdgeBottom).Weight;
    document['xlEdgeTopLineWeight'] = rng.Borders.Item(WPS_Enum.xlEdgeTop).Weight;

    // 字体格式
    document['fontBold'] = rng.Font.Bold; // false
    document['fontSize'] = rng.Font.Size; //14
    document['fontName'] = rng.Font.Name; // string
    document['fontItalic'] = rng.Font.Italic; // false
    document['fontColor'] = rng.Font.Color;   // 655533
    // 背景颜色
    document['background'] = rng.Interior.Color; // 652372
    return document;
}


// 选区转换成文档,返回一个记录单元格信息的文档数组
function RangeToDocument(range, abstractFn = cellToDocument) {
    let strRange = range.Address();
    let arrayRangeAddress = strRange.split(",");
    let array = new Array();

    let cell;
    let n;
    for (let m of arrayRangeAddress) {
        cell = wps.Range(m);
        n = cell.Count;
        for (let i = 1; i <= n; i++) {
            array.push(abstractFn(cell.Item(i)));
        }
    }
    return array;
}

function ArrayXPut(cell, array) {
    for (text of array) {
        cell.Formula = text;
        cell = cell.Offset(0, 1);
    }
    return cell;
}

function ArrayYPut(cell, array) {
    for (text of array) {
        cell.Formula = text;
        cell = cell.Offset(1, 0);
    }
    return cell;
}


function cellMergedY(cell, MergeNum) {
    let select = wps.Range(cell, cell.Offset(MergeNum - 1, 0));
    select.Merge();
    select.WrapText = true;
}


function cellMergedX(cell, MergeNum) {
    let select = wps.Range(cell, cell.Offset(0, MergeNum - 1));
    select.Merge();
    select.WrapText = true;
}


function DocumentToRange(anchor_cell, array) {
    let row = array[0]['row'];
    let col = array[0]['col'];

    let anchor_row = anchor_cell.Row;
    let anchor_col = anchor_cell.Column;

    for (let item of array) {
        if (item['subMergence']) {
            continue;
        }
        let cell = anchor_cell.Item(item['row'] - row + 1, item['col'] - col + 1);
        let rng = cell;

        if (item['merge_row']) {
            wps.Range(cell, cell.Item(item['merge_row'], item['merge_col'])).Merge();
            rng = cell.MergeArea;
        }
        switch (item['type']) {
            case 1:
                // formula
                let formula = item['content'].replaceAll(/(?<=R)\d+(?=C(\[-?\d+\]|\d+))/g,
                    (x) => { let a = Number(x) + anchor_row - row; return `${a}` }
                )
                formula = formula.replaceAll(/(?<=R(\[-?\d+\]|\d+)C)\d+/g,
                    (x) => { let a = Number(x) + anchor_col - col; return `${a}` }
                )
                rng.FormulaR1C1Local = formula;
                break;
            case 2:
                // string
                rng.Formula = item['content'];
            case 3:
            case 4:
                // number and others
                rng.Formula = item['content'];
                break;
            default:
                break;
        }

        // 设置格式
        rng.HorizontalAlignment = item['HorizontalAlignment']; // -4131
        rng.VerticalAlignment = item['VerticalAlignment']; // -4108


        rng.Borders.Item(WPS_Enum.xlEdgeLeft).ColorIndex = item['xlEdgeLeft']; // -4105
        rng.Borders.Item(WPS_Enum.xlEdgeRight).ColorIndex = item['xlEdgeRight']; // -4105
        rng.Borders.Item(WPS_Enum.xlEdgeBottom).ColorIndex = item['xlEdgeBottom'];
        rng.Borders.Item(WPS_Enum.xlEdgeTop).ColorIndex = item['xlEdgeTop'];

        rng.Borders.Item(WPS_Enum.xlEdgeRight).Weight = item['xlEdgeRightLineWeight']; // 2
        rng.Borders.Item(WPS_Enum.xlEdgeLeft).Weight = item['xlEdgeLeftLineWeight'];
        rng.Borders.Item(WPS_Enum.xlEdgeBottom).Weight = item['xlEdgeBottomLineWeight'];
        rng.Borders.Item(WPS_Enum.xlEdgeTop).Weight = item['xlEdgeTopLineWeight'];

        rng.Font.Bold = item['fontBold'];
        rng.Font.Size = item['fontSize'];
        rng.Font.Name = item['fontName'];
        rng.Font.Italic = item['fontItalic'];
        rng.Font.Color = item['fontColor'];

        rng.Interior.Color = item['background'];
        // rng.WrapText            = item['wraptext'];

        if (item['sjqy']) {
            rng.Characters(1, 1).Font.Name = "SJQY";
        }
    }
}

// test function
function documentToLocalStorage() {
    wps.PluginStorage.setItem("documentTemp", RangeToDocument(wps.Selection));
}

// note the type of value
function TableToDataBase() {
    function strClean(str) {
        let newStr = str.trim();
        newStr = newStr.replaceAll(/[.\n]/g, '');
        return newStr;
    }
    let cell = wps.Selection.Range("A1");
    let cols = wps.Selection.Columns.Count;
    let bookName = getPureName(wps.ActiveWorkbook.Name);
    let sheetname = wps.ActiveSheet.Name;
    let labels = new Array();
    let documents = new Array();
    let xcell = cell.Item(2, 1);
    for (let j = 1; j <= cols; j++) {
        labels.push(strClean(cell.Item(1, j).Text));
    }
    let k = 2;
    do {
        let document = { 'sheetName': sheetname, 'bookName': bookName };
        for (let i = 1; i <= cols; i++) {
            let v = xcell.Item(1, i).MergeArea.Range("A1").Value2;
            if (typeof (v) == 'string') {
                document[labels[i - 1]] = v.trim().replaceAll('\n', '');
            }
            else {
                document[labels[i - 1]] = v;
            }
        }
        xcell = cell.Item(++k, 1);
        // 当表格有合并的情况需要删除空白字符键
        delete document[""];
        documents.push(document);
    } while (xcell.MergeArea.Range("A1").Value2);
    return documents;
}

function allTableToDataBase() {
    function strClean(str) {
        // drop whitespace
        let newStr = str.trim();
        newStr = newStr.replaceAll(/[.\n]/g, '');
        return newStr;
    }
    let titleCell = wps.Selection.Range("A1");
    let bookName = getPureName(wps.ActiveWorkbook.Name);
    let cols = wps.Selection.Columns.Count;
    let labels = new Array();
    let documents = new Array();

    for (let x = 1; x <= cols; x++) {
        labels.push(strClean(titleCell.Item(1, x).Text));
    }

    let sheets = wps.EtApplication().ActiveWorkbook.Worksheets;
    for (let i = 1; i <= sheets.Count; i++) {
        let sheet = sheets.Item(i);
        let sheetname = sheet.Name;
        let cell = sheet.Cells.Find(labels[0], sheet.Cells.Item(1, 1), WPS_Enum.xlValues, WPS_Enum.xlWhole, WPS_Enum.xlByRows, WPS_Enum.xlNext, false, false, false);
        if (cell == null) {
            continue;
        }
        let xcell = cell.Item(2, 1);
        let k = 2;
        do {
            let document = { 'sheetName': sheetname, 'bookName': bookName };
            for (let i = 1; i <= cols; i++) {
                let v = xcell.Item(1, i).MergeArea.Range("A1").Value2;
                if (typeof (v) == 'string') {
                    document[labels[i - 1]] = v.trim().replaceAll('\n', '');
                }
                else {
                    document[labels[i - 1]] = v;
                }
            }
            xcell = cell.Item(++k, 1);
            // 当表格有合并的情况需要删除空白字符键
            delete document[""];
            documents.push(document);
        } while (xcell.MergeArea.Range("A1").Value2);
    }
    return documents;
}

function getPureName(bookName) {
    let dotIndex = bookName.lastIndexOf('.');
    return bookName.slice(0, dotIndex);
}

function tableToDocument() {
    let titleCell = wps.Selection.Range("A1");
    let cols = wps.Selection.Columns.Count;
    let sum = 0;
    let j = 0;
    let xcell = titleCell;
    let labelCell = titleCell;
    while (sum < cols) {
        sum += xcell.MergeArea.Columns.Count;
        xcell = xcell.Offset(0, 1);
        j++;
    }
    function strClean(str) {
        // drop whitespace
        let newStr = str.trim();
        newStr = newStr.replaceAll(/[.\n]/g, '');
        return newStr;
    }
    let bookName = getPureName(wps.ActiveWorkbook.Name);
    let labels = new Array();
    let documents = new Array();

    for (let x = 1; x <= j; x++) {
        labels.push(strClean(labelCell.Text));
        labelCell = labelCell.Offset(0, 1);
    }

    xcell = titleCell.Item(2, 1);

    let sheet = wps.EtApplication().ActiveSheet;
    let sheetname = sheet.Name;
    let k = 2;
    do {
        let document = { 'sheetName': sheetname, 'bookName': bookName };
        for (let i = 1; i <= j; i++) {
            let v = xcell.Value2;
            xcell = xcell.Offset(0, 1);
            if (typeof (v) == 'string') {
                document[labels[i - 1]] = v.trim().replaceAll('\n', '');
            }
            else {
                document[labels[i - 1]] = v;
            }
        }
        xcell = titleCell.Item(++k, 1);
        documents.push(document);
    } while (xcell.Value2);
    return documents;
}

function qingdanGather() {
    let total = 3;
    let labels = ['subItemIndex', 'content', 'number'];
    let documents = new Array();

    for (let i = 1; i <= wps.Workbooks.Count; i++) {
        let workbook = wps.Workbooks.Item(i);
        let bookName = getPureName(workbook.Name);
        for (let j = 1; j <= workbook.Worksheets.Count; j++) {
            let sheet = workbook.Worksheets.Item(j);
            let sheetName = sheet.Name;
            let cell = sheet.Cells.Find('子目号', sheet.Cells.Item(1, 1), WPS_Enum.xlValues, WPS_Enum.xlWhole, WPS_Enum.xlByRows, WPS_Enum.xlNext, false, false, false);
            if (cell == null) {
                continue;
            }
            let xcell = cell.Item(2, 1);
            let k = 2;
            do {
                let document = { 'sheetName': sheetName, 'bookName': bookName };
                for (let cq = 1; cq <= total; cq++) {
                    let v = xcell.Value2;
                    xcell = xcell.Offset(0, 1);
                    if (typeof (v) == 'string') {
                        document[labels[cq - 1]] = v.trim().replaceAll('\n', '');
                    }
                    else {
                        if (v<0.01){
                            document[labels[cq - 1]] = 0;
                        }
                        document[labels[cq - 1]] = v;
                    }
                }
                xcell = cell.Item(++k, 1);
                documents.push(document);
            } while (xcell.Value2);
        }
    }
    return documents;
}


function tableToDocuments() {
    let titleCell = wps.Selection.Range("A1");
    let cols = wps.Selection.Columns.Count;
    let sum = 0;
    let j = 0;
    let xcell = titleCell;
    let labelCell = titleCell;
    while (sum < cols) {
        sum += xcell.MergeArea.Columns.Count;
        xcell = xcell.Offset(0, 1);
        j++;
    }
    function strClean(str) {
        // drop whitespace
        let newStr = str.trim();
        newStr = newStr.replaceAll(/[.\n]/g, '');
        return newStr;
    }
    let bookName = getPureName(wps.ActiveWorkbook.Name);
    let labels = new Array();
    let documents = new Array();

    for (let x = 1; x <= j; x++) {
        labels.push(strClean(labelCell.Text));
        labelCell = labelCell.Offset(0, 1);
    }


    let sheets = wps.ActiveWorkbook.Worksheets;
    for (let i = 1; i <= sheets.Count; i++) {
        let sheet = sheets.Item(i);
        let sheetname = sheet.Name;
        let cell = sheet.Cells.Find(labels[0], sheet.Cells.Item(1, 1), WPS_Enum.xlValues, WPS_Enum.xlWhole, WPS_Enum.xlByRows, WPS_Enum.xlNext, false, false, false);
        if (cell == null) {
            continue;
        }
        let xcell = cell.Item(2, 1);
        let k = 2;
        do {
            let document = { 'sheetName': sheetname, 'bookName': bookName };
            for (let i = 1; i <= j; i++) {
                let v = xcell.Value2;
                xcell = xcell.Offset(0, 1);
                if (typeof (v) == 'string') {
                    document[labels[i - 1]] = v.trim().replaceAll('\n', '');
                }
                else {
                    document[labels[i - 1]] = v;
                }
            }
            xcell = cell.Item(++k, 1);
            documents.push(document);
        } while (xcell.Value2);
    }
    return documents;
}


function oneTotwo(text) {
    if (text.length == 1) {
        return '0' + text;
    }
    return text;
}

function convertIndex() {
    let cell = wps.Range("A6");
    while (cell.Value2) {
        cell.Formula = "RHGS-TJ02";
        cell = cell.Offset(1, 0);
    }

    cell = wps.Range("C6");
    while (cell.Value2) {
        cell.Formula = "RHGS-TJ02" + "-" + cell.Text;
        cell = cell.Offset(1, 0);
    }

    cell = wps.Range("E6");
    while (cell.Value2) {
        cell.Formula = cell.Offset(0, -2).MergeArea.Range("A1").Text + oneTotwo(cell.Text);
        cell = cell.Offset(1, 0);
    }

    cell = wps.Range("G6");
    while (cell.Value2) {
        cell.Formula = cell.Offset(0, -2).MergeArea.Range("A1").Text + oneTotwo(cell.Text);
        cell = cell.Offset(1, 0);
    }

    cell = wps.Range("I6");
    while (cell.Value2) {
        cell.Formula = cell.Offset(0, -2).MergeArea.Range("A1").Text + oneTotwo(cell.Text);
        cell = cell.Offset(1, 0);
    }

    cell = wps.Range("K6");
    while (cell.Value2) {
        cell.Formula = cell.Offset(0, -2).MergeArea.Range("A1").Text + oneTotwo(cell.Text);
        cell = cell.Offset(1, 0);
    }

    cell = wps.Range("M6");
    while (cell.Value2) {
        cell.Formula = cell.Offset(0, -2).MergeArea.Range("A1").Text + oneTotwo(cell.Text);
        cell = cell.Offset(1, 0);
    }
}


function convIndex() {
    let sheets = wps.EtApplication().ActiveWorkbook.Worksheets;
    for (let i = 1; i <= sheets.Count; i++) {
        let sheet = sheets.Item(i);
        sheet.Activate();
        convertIndex();
    }
}

function genMapItem() {
    let findValue = '子目号';
    let sheet = wps.ActiveSheet;
    let map = {};
    let cell = sheet.Cells.Find(findValue, sheet.Cells.Item(1, 1), WPS_Enum.xlValues, WPS_Enum.xlWhole, WPS_Enum.xlByRows, WPS_Enum.xlNext, false, false, false);
    if (cell == null) {
        alert('请选择计算表');
        return false;
    }
    let xcell = cell.Offset(1, 0);
    do {
        if (xcell.Offset(0, 1).Offset(0, 1).Value2) {
            let text = xcell.Offset(0, 1).Offset(0, 1).Formula;
            let matchIterator = text.matchAll(/".*?"/g);
            while (1) {
                let ret = matchIterator.next();
                if (ret.done) {
                    break;
                }
                else {
                    map[ret.value[0].replaceAll(/"/g, "")] = xcell.Text;
                }
            }
        }
        xcell = xcell.Offset(1, 0);
    } while (xcell.Value2);
    return map;
}


// 定位钢筋
function dogather() {
    let table = {
        "652bd16f70886553931365d2": 89.21,
        "652bd17270886553931365d3": 92.33,
        "652bd17570886553931365d4": 111.66,
        "652bd17870886553931365d5": 184.13,
        "652bd17b70886553931365d6": 188.53,
        "652bd17e70886553931365d7": 94.7,
        "652bd18170886553931365d8": 132.65,
        "652bd18470886553931365d9": 141.23,
        "652bd18770886553931365da": 141.37,
        "652bd18970886553931365db": 140.64,
        "652bd18c70886553931365dc": 150.88,
        "652bd18e70886553931365dd": 145.28,
        "652bd19270886553931365de": 160.29,
        "652bd19470886553931365df": 586.05,
        "652bd19970886553931365e0": 141.75,
        "652bd19d70886553931365e1": 457.39,
        "652bd1a170886553931365e2": 456.45,
        "652bd1a570886553931365e3": 36.37,
        "652bd1aa70886553931365e4": 70.54
    }
    let cell = wps.ActiveCell;
    let sum = 0;
    do {
        sum += table[cell.Text];
        cell = cell.Offset(1, 0);
    } while (cell.Value2);
    cell.Value2 = sum;
}