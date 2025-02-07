// function hunter(){
//     let cell = navToLTCellInLUA(wps.ActiveCell);
//     let TypeOfBeam = wps.ActiveSheet.Name;
//     let part = cell.Offset(1,0).Text;
//     let content = cell.Item(2, 10).Text;
//     alert(content);
//     document.getElementById("Beam").value = TypeOfBeam;
//     document.getElementById("Part").value = part;
//     document.getElementById("Extra").value = content;
// }

// function send(){

// }

function hunter() {
    let cell = navToLTCellInLUA(wps.ActiveCell);
    let TypeOfBeam = '搭板';
    let part = cell.Offset(1,0).Text;
    let content = cell.Item(2, 10).Text;

    document.getElementById("Beam").value = TypeOfBeam;
    document.getElementById("Part").value = part;
    document.getElementById("Extra").value = content;
}


async function send() {
    // let _document = localStorage.getItem("tmpTable");upStardTable
    let _document = UpLoadTemTable();
    if (! _document){
        alert('no parameters selected!');
        return ;
    }
    _document['info']['TypeOfBeam'] = document.getElementById("Beam").value;
    _document['info']['part'] = document.getElementById("Part").value;
    _document['info']['content'] = document.getElementById("Extra").value;

    let isPush = await PushDoc("pushdoc", _document);

    if (isPush.status == 200) {
        alert(`table push successfully! and id is ${isPush.data}`);
    }
    else if (isPush.status == 0) {
        alert('网络故障');
    }
    else if (isPush.status == 303) {
        alert(isPush.data);
    }
    else {
        alert('未知错误❌');
    }
}