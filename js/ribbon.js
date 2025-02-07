// initial function
// the function OnAddinLoad run first before all others
function OnAddinLoad(ribbonUI) {
    // dont modify the official code
    if (typeof (wps.ribbonUI) != "object") {
        wps.ribbonUI = ribbonUI
    }
    // test login
    wps.PluginStorage.setItem("isLogin", false);
    if (localStorage.getItem("password") && localStorage.getItem("username")) {
        Login(localStorage.getItem("username"), localStorage.getItem("password")).then((respose) => {
            if (respose.status == 0) {
                alert("网络故障!");
            }
        });
    }
    return true;
}

function ClickBtn(control) {
    var elemId = control.Id;
    switch (elemId) {
        case "config":
            {
                // connect to db
                OpenDialogWindow('database', "用户登录");
                break;
            }
        case "upload":
            {
                OpenDialogWindow('data-upload', "配置数据集");
                break;
            }
        case "download":
            {
                // OpenTaskPane('pushBeamData', "上传数据");
                // gatherthisBridge();
                // dataUpLoad();
                // OpenDialogWindow('showPicture', "数据组分", 900, 700);
                // dogather();
                // toDataBase();
                // dopush();
                // toxianjiao();
                // DataGo();
                // toDataSF();
                // toDataOfGuardrail();
                // toDataZZ();
                // toDataFS();
                setCellCharFontAll();
                break;
            }
        case "convert":
            {
                OpenDialogWindow('showPicture', "数据组分", 900, 700);
                // ConvetToRebarSymbol();
                break;
            }
        case "calcTable":
            {
                InsertTable();
                break;
            }
        case "calcTableEx":
            {
                InsertTableEx();
                break;
            }
        case "gather":
            {
                GatherTable();
                break;
            }
        default:
            break;
    }
    return true;
}

function GetImageBtn(control) {
    const id = control.Id;
    const isLogin = wps.PluginStorage.getItem("isLogin");
    switch (id) {
        case "config":
            if (!isLogin) {
                return "images/config2.svg";
            }
            return "images/config1.svg";

        case "upload":
            return "images/upload1.svg";

        case "download":
            return "images/download1.svg";

        case "convert":
            return "images/convert.svg";

        case "calcTable":
            return "images/calcTable.svg";

        case "calcTableEx":
            return "images/calcTableEx.svg";

        case "gather":
            return "images/gather.svg";

        default:
            return "images/0.svg";
    }
}

function GetImageCtl(control) {
    const id = control.Id;
    switch (id) {
        case "calculate":
            return "images/calculate.svg";
        default:
            return "images/0.svg";
    }
}


function IsElemVisible(control) {
    return true;
}

function OnGetEnabled(control) {
    return wps.PluginStorage.getItem("isLogin");
}

//wxhcq.namespace_('OpenTaskPane', OpenTaskPane)
//wxhcq.namespace_('OpenDialogWindow', OpenDialogWindow)
//wxhcq.namespace_('getWorkSheet', getWorkSheet)
//wxhcq.namespace_('getWorkSheetExt', getWorkSheetExt)
//wxhcq.namespace_('getWorkBook', getWorkBook)
//wxhcq.namespace_('getWorkBookExt', getWorkBookExt)
//wxhcq.namespace_('range.navToLTCellInLUA', navToLTCellInLUA)
//wxhcq.namespace_('range.setBorder', setBorder)
//wxhcq.namespace_('range.setAlgin', setAlgin)
//wxhcq.namespace_('range.setBackgroundColor', setBackgroundColor)
//wxhcq.namespace_('range.setFontStyle', setFontStyle)
//wxhcq.namespace_('range.setStandardize', setStandardize)
//wxhcq.namespace_('range.setCellCharFont', setCellCharFont)
//wxhcq.namespace_('range.insertBeneath', insertBeneath)
//wxhcq.namespace_('range.ArrayXPut', ArrayXPut)
//wxhcq.namespace_('range.ArrayYPut', ArrayYPut)
//wxhcq.namespace_('range.cellMergedY', cellMergedY)
//wxhcq.namespace_('range.cellMergedX', cellMergedX)
//wxhcq.namespace_('document.DocumentToRange', DocumentToRange)
//wxhcq.namespace_('document.RangeToDocument', RangeToDocument)
//wxhcq.namespace_('net.Login', Login)
//wxhcq.namespace_('net.Register', Register)

//calc.namespace_('ConvetToRebarSymbol', ConvetToRebarSymbol)
//calc.namespace_('InsertTable', InsertTable)
//calc.namespace_('InsertTableEx', InsertTableEx)
//calc.namespace_('GatherTable', GatherTable)
//calc.namespace_('createIDTbale', createIDTbale)
// calc.namespace_('', )
// calc.namespace_('', )
// calc.namespace_('', )
// calc.namespace_('', )