//Object.prototype.namespace_ = function (name, fn) {
//    let listname = name.split('.');
//    let context = this;
//    let len = listname.length;

//    for (let s = 0; s < len - 1; s++) {
//        if (!context[listname[s]]) {
//            context[listname[s]] = {};
//        }
//        context = context[listname[s]];
//    }
//    context[listname[len - 1]] = fn;
//}

//const calc = {};
//const wxhcq = {};

// 一些高频出现的wps常量
var WPS_Enum = {
    msoCTPDockPositionLeft: 0,
    msoCTPDockPositionRight: 2,

    // 文字对齐方式
    xlVAlignCenter: wps.NewEnum.XlVAlign.xlVAlignCenter,
    xlHAlignCenter: wps.NewEnum.XlHAlign.xlHAlignCenter,
    // xlVAlignBottom: -4107
    // xlVAlignCenter: -4108
    // xlVAlignDistributed: -4117
    // xlVAlignJustify: -4130
    // xlVAlignTop: -4160

    // 边框样式
    xlThin: wps.NewEnum.XlBorderWeight.xlThin,
    // xlHairline: 1
    // xlMedium: -4138
    // xlThick: 4
    // xlThin: 2

    xlContinuous: wps.NewEnum.XlLineStyle.xlContinuous,
    //  xlContinuous: 1
    //  xlDash: -4115
    //  xlDashDot: 4
    //  xlDashDotDot: 5
    //  xlDot: -4118
    //  xlDouble: -4119
    //  xlLineStyleNone: -4142
    //  xlSlantDashDot: 13

    xlEdgeLeft: wps.NewEnum.XlBordersIndex.xlEdgeLeft,
    xlEdgeTop: wps.NewEnum.XlBordersIndex.xlEdgeTop,
    xlEdgeBottom: wps.NewEnum.XlBordersIndex.xlEdgeBottom,
    xlEdgeRight: wps.NewEnum.XlBordersIndex.xlEdgeRight,
    xlInsideVertical: wps.NewEnum.XlBordersIndex.xlInsideVertical,
    xlInsideHorizontal: wps.NewEnum.XlBordersIndex.xlInsideHorizontal,
    //  xlEdgeBottom: 9
    //  xlEdgeLeft: 7
    //  xlEdgeRight: 10
    //  xlEdgeTop: 8
    //  xlInsideHorizontal: 12
    //  xlInsideVertical: 11

    xlPatternSolid: wps.NewEnum.XlPattern.xlPatternSolid,

    // 边框颜色
    xlColorIndexAutomatic: wps.NewEnum.XlColorIndex.xlColorIndexAutomatic,
    // xlColorIndexAutomatic: -4105
    // xlColorIndexNone: -4142 xlColorIndexAutomatic

    // 填充模式和颜色
    xlPatternSolid: wps.NewEnum.XlPattern.xlPatternSolid,

    // 搜索相关
    xlValues: wps.NewEnum.XlFindLookIn.xlValues,
    xlWhole: wps.NewEnum.XlLookAt.xlWhole,
    xlPart: wps.NewEnum.XlLookAt.xlPart,
    xlByRows: wps.NewEnum.XlSearchOrder.xlByRows,
    xlByColumns: wps.NewEnum.XlSearchOrder.xlByColumns,
    xlNext: wps.NewEnum.XlSearchDirection.xlNext,

    // 移动方向
    xlUp: wps.NewEnum.XlDirection.xlUp,

    // 复制黏贴选项
    xlShiftDown: wps.NewEnum.XlInsertShiftDirection.xlShiftDown,
    xlFormatFromLeftOrAbove: wps.NewEnum.XlInsertFormatOrigin.xlFormatFromLeftOrAbove,
    xlFormatFromRightOrBelow: wps.NewEnum.XlInsertFormatOrigin.xlFormatFromRightOrBelow,
    xlPasteAllMergingConditionalFormats: wps.NewEnum.XlPasteType.xlPasteAllMergingConditionalFormats,
    xlPasteSpecialOperationNone: wps.NewEnum.XlPasteSpecialOperation.xlPasteSpecialOperationNo,

    // 过滤条件
    xlFilterValues: wps.NewEnum.XlAutoFilterOperator.xlFilterValues,
    xlAnd: wps.NewEnum.XlAutoFilterOperator.xlAnd,
    xlCellTypeVisible: wps.NewEnum.XlCellType.xlCellTypeVisible,

    // 特殊单元格常数
    xlCellTypeConstants: wps.NewEnum.XlCellType.xlCellTypeConstants,

    // 表格类型
    xlWorksheet: wps.NewEnum.XlSheetType.xlWorksheet,

    // 插入单元格
    xlShiftUp: -4121,
    xlShiftDown: -4162,
    xlShiftToRight: -4161,

    // 单元格斜线类型
    xlDiagonalDown: wps.NewEnum.XlBordersIndex.xlDiagonalDown,
    xlDiagonalUp: wps.NewEnum.XlBordersIndex.xlDiagonalUp
    //  xlDiagonalDown: 5
    //  xlDiagonalUp: 6
}

/* 颜色代码 */
const LightPink = 0xC1B6FF // 浅粉红
const Pink = 0xCBC0FF // 粉红
const Crimson = 0x3C14DC // 深红(猩红)
const LavenderBlush = 0xF5F0FF // 淡紫红
const PaleVioletRed = 0x9370DB // 弱紫罗兰红
const HotPink = 0xB469FF // 热情的粉红
const DeepPink = 0x9314FF // 深粉红
const MediumVioletRed = 0x8515C7 // 中紫罗兰红
const Orchid = 0xD670DA // 暗紫色(兰花紫)
const Thistle = 0xD8BFD8 // 蓟色
const Plum = 0xDDA0DD // 洋李色(李子紫)
const Violet = 0xEE82EE // 紫罗兰
const Magenta = 0xFF00FF // 洋红(玫瑰红)
const Fuchsia = 0xFF00FF // 紫红(灯笼海棠)
const DarkMagenta = 0x8B008B // 深洋红
const Purple = 0x800080 // 紫色
const MediumOrchid = 0xD355BA // 中兰花紫
const DarkViolet = 0xD30094 // 暗紫罗兰
const DarkOrchid = 0xCC3299 // 暗兰花紫
const Indigo = 0x82004B // 靛青/紫兰色
const BlueViolet = 0xE22B8A // 蓝紫罗兰
const MediumPurple = 0xDB7093 // 中紫色
const MediumSlateBlue = 0xEE687B // 中暗蓝色(中板岩蓝)
const SlateBlue = 0xCD5A6A // 石蓝色(板岩蓝)
const DarkSlateBlue = 0x8B3D48 // 暗灰蓝色(暗板岩蓝)
const Lavender = 0xFAE6E6 // 淡紫色(熏衣草淡紫)
const GhostWhite = 0xFFF8F8 // 幽灵白
const Blue = 0xFF0000 // 纯蓝
const MediumBlue = 0xCD0000 // 中蓝色
const MidnightBlue = 0x701919 // 午夜蓝
const DarkBlue = 0x8B0000 // 暗蓝色
const Navy = 0x800000 // 海军蓝
const RoyalBlue = 0xE16941 // 皇家蓝/宝蓝
const CornflowerBlue = 0xED9564 // 矢车菊蓝
const LightSteelBlue = 0xDEC4B0 // 亮钢蓝
const LightSlateGray = 0x998877 // 亮蓝灰(亮石板灰)
const SlateGray = 0x908070 // 灰石色(石板灰)
const DodgerBlue = 0xFF901E // 闪兰色(道奇蓝)
const AliceBlue = 0xFFF8F0 // 爱丽丝蓝
const SteelBlue = 0xB48246 // 钢蓝/铁青
const LightSkyBlue = 0xFACE87 // 亮天蓝色
const SkyBlue = 0xEBCE87 // 天蓝色
const DeepSkyBlue = 0xFFBF00 // 深天蓝
const LightBlue = 0xE6D8AD // 亮蓝
const PowderBlue = 0xE6E0B0 // 粉蓝色(火药青)
const CadetBlue = 0xA09E5F // 军兰色(军服蓝)
const Azure = 0xFFFFF0 // 蔚蓝色
const LightCyan = 0xFFFFE0 // 淡青色
const PaleTurquoise = 0xEEEEAF // 弱绿宝石
const Cyan = 0xFFFF00 // 青色
const Aqua = 0xFFFF00 // 浅绿色(水色)
const DarkTurquoise = 0xD1CE00 // 暗绿宝石
const DarkSlateGray = 0x4F4F2F // 暗瓦灰色(暗石板灰)
const DarkCyan = 0x8B8B00 // 暗青色
const Teal = 0x808000 // 水鸭色
const MediumTurquoise = 0xCCD148 // 中绿宝石
const LightSeaGreen = 0xAAB220 // 浅海洋绿
const Turquoise = 0xD0E040 // 绿宝石
const Aquamarine = 0xD4FF7F // 宝石碧绿
const MediumAquamarine = 0xAACD66 // 中宝石碧绿
const MediumSpringGreen = 0x9AFA00 // 中春绿色
const MintCream = 0xFAFFF5 // 薄荷奶油
const SpringGreen = 0x7FFF00 // 春绿色
const MediumSeaGreen = 0x71B33C // 中海洋绿
const SeaGreen = 0x578B2E // 海洋绿
const Honeydew = 0xF0FFF0 // 蜜色(蜜瓜色)
const LightGreen = 0x90EE90 // 淡绿色
const PaleGreen = 0x98FB98 // 弱绿色
const DarkSeaGreen = 0x8FBC8F // 暗海洋绿
const LimeGreen = 0x32CD32 // 闪光深绿
const Lime = 0x00FF00 // 闪光绿
const ForestGreen = 0x228B22 // 森林绿
const Green = 0x008000 // 纯绿
const DarkGreen = 0x006400 // 暗绿色
const Chartreuse = 0x00FF7F // 黄绿色(查特酒绿)
const LawnGreen = 0x00FC7C // 草绿色(草坪绿_
const GreenYellow = 0x2FFFAD // 绿黄色
const DarkOliveGreen = 0x2F6B55 // 暗橄榄绿
const YellowGreen = 0x32CD9A // 黄绿色
const OliveDrab = 0x238E6B // 橄榄褐色
const Beige = 0xDCF5F5 // 米色/灰棕色
const LightGoldenrodYellow = 0xD2FAFA // 亮菊黄
const Ivory = 0xF0FFFF // 象牙色
const LightYellow = 0xE0FFFF // 浅黄色
const Yellow = 0x00FFFF // 纯黄
const Olive = 0x008080 // 橄榄
const DarkKhaki = 0x6BB7BD // 暗黄褐色(深卡叽布)
const LemonChiffon = 0xCDFAFF // 柠檬绸
const PaleGoldenrod = 0xAAE8EE // 灰菊黄(苍麒麟色)
const Khaki = 0x8CE6F0 // 黄褐色(卡叽布)
const Gold = 0x00D7FF // 金色
const Cornsilk = 0xDCF8FF // 玉米丝色
const Goldenrod = 0x20A5DA // 金菊黄
const DarkGoldenrod = 0x0B86B8 // 暗金菊黄
const FloralWhite = 0xF0FAFF // 花的白色
const OldLace = 0xE6F5FD // 老花色(旧蕾丝)
const Wheat = 0xB3DEF5 // 浅黄色(小麦色)
const Moccasin = 0xB5E4FF // 鹿皮色(鹿皮靴)
const Orange = 0x00A5FF // 橙色
const PapayaWhip = 0xD5EFFF // 番木色(番木瓜)
const BlanchedAlmond = 0xCDEBFF // 白杏色
const NavajoWhite = 0xADDEFF // 纳瓦白(土著白)
const AntiqueWhite = 0xD7EBFA // 古董白
const Tan = 0x8CB4D2 // 茶色
const BurlyWood = 0x87B8DE // 硬木色
const Bisque = 0xC4E4FF // 陶坯黄
const DarkOrange = 0x008CFF // 深橙色
const Linen = 0xE6F0FA // 亚麻布
const Peru = 0x3F85CD // 秘鲁色
const PeachPuff = 0xB9DAFF // 桃肉色
const SandyBrown = 0x60A4F4 // 沙棕色
const Chocolate = 0x1E69D2 // 巧克力色
const SaddleBrown = 0x13458B // 重褐色(马鞍棕色)
const Seashell = 0xEEF5FF // 海贝壳
const Sienna = 0x2D52A0 // 黄土赭色
const LightSalmon = 0x7AA0FF // 浅鲑鱼肉色
const Coral = 0x507FFF // 珊瑚
const OrangeRed = 0x0045FF // 橙红色
const DarkSalmon = 0x7A96E9 // 深鲜肉/鲑鱼色
const Tomato = 0x4763FF // 番茄红
const MistyRose = 0xE1E4FF // 浅玫瑰色(薄雾玫瑰)
const Salmon = 0x7280FA // 鲜肉/鲑鱼色
const Snow = 0xFAFAFF // 雪白色
const LightCoral = 0x8080F0 // 淡珊瑚色
const RosyBrown = 0x8F8FBC // 玫瑰棕色
const IndianRed = 0x5C5CCD // 印度红
const Red = 0x0000FF // 纯红
const Brown = 0x2A2AA5 // 棕色
const FireBrick = 0x2222B2 // 火砖色(耐火砖)
const DarkRed = 0x00008B // 深红色
const Maroon = 0x000080 // 栗色
const White = 0xFFFFFF // 纯白
const WhiteSmoke = 0xF5F5F5 // 白烟
const Gainsboro = 0xDCDCDC // 淡灰色(庚斯博罗灰)
const LightGrey = 0xD3D3D3 // 浅灰色
const Silver = 0xC0C0C0 // 银灰色
const DarkGray = 0xA9A9A9 // 深灰色
const Gray = 0x808080 // 灰色
const DimGray = 0x696969 // 暗淡的灰色
const Black = 0x000000 // 纯黑

// ColorIndex
const CI_black = 1;
const CI_brown = 53;
const CI_olivaceous = 52;
const CI_darkgreen = 51;
const CI_darkcyan = 49;
const CI_darkblue = 11;
const CI_indigotin = 55;
const CI_gray = 56;
const CI_darkred = 9;
const CI_orange = 46;
const CI_darkyellow = 12;
const CI_green = 10;
const CI_cyan = 14;
const CI_blue = 5;
const CI_bluegrey = 47;
const CI_red = 3;
const CI_seagreen = 50;
const CI_rosy = 38;
const CI_azure = 33;
const CI_pink = 7;
const CI_gold = 44;
const CI_violet = 13;

function GetUrlPath() {
    let e = document.location.toString();
    return -1 != (e = decodeURI(e)).indexOf("/") && (e = e.substring(0, e.lastIndexOf("/"))), e
}

function shellExecuteByOAAssist(param) {
    if (wps != null) {
        wps.OAAssist.ShellExecute(param)
    }
}


function OpenTaskPane(identifier) {
    let tsd = wps.PluginStorage.getItem(identifier);
    if (!tsd) {
        let taskpane = wps.CreateTaskPane(GetUrlPath() + `/ui/${identifier}/index.html`);
        wps.PluginStorage.setItem(identifier, taskpane.ID);
        taskpane.Visible = true;
    }
    else {
        let taskpane = wps.GetTaskPane(tsd);
        taskpane.Visible = !taskpane.Visible;
    }
}

function OpenDialogWindow(identifier, title = 'WxHCq', width = 400, height = 600) {
    wps.ShowDialog(GetUrlPath() + `/ui/${identifier}/index.html`, title,
        width * window.devicePixelRatio, height * window.devicePixelRatio, true);
}


/**
 * 返回一个以sheetName命名的工作表
 * @param {string} sheetName
 * @returns {object} worksheet
 */
function getWorkSheet(sheetName) {
    let aSheet = wps.EtApplication().ActiveSheet;
    let sheets = wps.EtApplication().ActiveWorkbook.Worksheets;
    let sheet = sheets.Item(sheetName);

    if (!sheet) {
        // 名字为 sheetName 的工作表不存在
        // 添加到末尾
        sheets.Add(undefined, sheets.Item(sheets.Count), 1, WPS_Enum.xlWorksheet);
        wps.EtApplication().ActiveSheet.Name = sheetName;
        aSheet.Activate();
        sheet = sheets.Item(sheetName);
    }
    return sheet;
}


// include the sheetname
function getWorkSheetExt(sheetName) {
    let aSheet = wps.EtApplication().ActiveSheet;
    let sheets = wps.EtApplication().ActiveWorkbook.Worksheets;
    for (let i = 1; i <= sheets.Count; i++) {
        let sheet = sheets.Item(i);
        if (sheet.Name.includes(sheetName)) return sheet;
    }
    sheets.Add(undefined, sheets.Item(sheets.Count), 1, WPS_Enum.xlWorksheet);
    wps.EtApplication().ActiveSheet.Name = sheetName;
    aSheet.Activate();
    return sheets.Item(sheetName);
}

/**
 * 返回一个以bookName命名的工作表
 * @param {string} bookName
 * @returns {object} workbook
 */
function getWorkBook(bookName) {
    for (let i = 1; i <= wps.EtApplication().Workbooks.Count; i++) {
        let x = wps.EtApplication().Workbooks.Item(i);
        if (x.Name == bookName) return x;
    }
    return null;
}

// include the bookName
function getWorkBookExt(bookName) {
    for (let i = 1; i <= wps.EtApplication().Workbooks.Count; i++) {
        let x = wps.EtApplication().Workbooks.Item(i);
        if (x.Name.indexOf(bookName) >= 0) return x;
    }
    return null;
}