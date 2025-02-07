const LocalHost = "http://127.0.0.1:3989/"


const unit = document.getElementById("unit");
const unit2 = document.getElementById("unit2");
const part = document.getElementById("part");
const part2 = document.getElementById("part2");
const proj = document.getElementById("proj");





document.body.onload = initContent;

async function initContent() {
    // initial query
    let query = await fetch(LocalHost + 'findDist' + `?distkey=UnitProj&database=CqDemo&collection=PartList`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        // body: JSON.stringify({})
    })
    let resposeData = await query.json();
    if (resposeData[0] == 'UNknow') {
        alert("some error happen in query!");
    }
    else {
        for (var text of resposeData) {
            let unitOp = document.createElement("option");
            unitOp.setAttribute('value', text);
            unitOp.textContent = text;
            unit.appendChild(unitOp);
        }
    }
}

async function _queryIterative(key, filter, elem, database = "CqDemo", collection = "PartList") {
    let query = await fetch(LocalHost + 'findDist' + `?distkey=${key}` + `&database=${database}` + `&collection=${collection}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filter)
    })
    let resposeData = await query.json();
    elem.innerHTML = "";
    for (var text of resposeData) {
        let unitOp = document.createElement("option");
        unitOp.setAttribute('value', text);
        unitOp.textContent = text;
        elem.appendChild(unitOp);
    }
    return resposeData[0];
}


unit.addEventListener("change", async (event) => {
    let a1 = await _queryIterative('UnitProjItem', { 'UnitProj': event.target.value }, unit2);
    let a2 = await _queryIterative('PartProj', { 'UnitProj': event.target.value, 'UnitProjItem': a1 }, part);
    let a3 = await _queryIterative('PartProjItem', { 'UnitProj': event.target.value, 'UnitProjItem': a1, "PartProj": a2 }, part2);
    let a4 = await _queryIterative('SubProj', { 'UnitProj': event.target.value, 'UnitProjItem': a1, "PartProj": a2, "PartProjItem": a3 }, proj);
})


unit2.addEventListener("change", async (event) => {
    let a2 = await _queryIterative('PartProj', { 'UnitProj': unit.value, 'UnitProjItem': event.target.value }, part);
    let a3 = await _queryIterative('PartProjItem', { 'UnitProj': unit.value, 'UnitProjItem': event.target.value, "PartProj": a2 }, part2);
    let a4 = await _queryIterative('SubProj', { 'UnitProj': unit.value, 'UnitProjItem': event.target.value, "PartProj": a2, "PartProjItem": a3 }, proj);
})

part.addEventListener("change", async (event) => {
    let a3 = await _queryIterative('PartProjItem', { 'UnitProj': unit.value, 'UnitProjItem': unit2.value, "PartProj": event.target.value }, part2);
    let a4 = await _queryIterative('SubProj', { 'UnitProj': unit.value, 'UnitProjItem': unit2.value, "PartProj": event.target.value, "PartProjItem": a3 }, proj);
})


part2.addEventListener("change", async (event) => {
    let a4 = await _queryIterative('SubProj', { 'UnitProj': unit.value, 'UnitProjItem': unit2.value, "PartProj": part.value, "PartProjItem": event.target.value }, proj);
})

// 添加一个纯粹的接受器
async function addPureReceiver() {
    let filter = {};
    filter.UnitProj = document.getElementById('unit').value;
    filter.UnitProjItem = document.getElementById('unit2').value;
    filter.PartProj = document.getElementById('part').value;
    filter.PartProjItem = document.getElementById('part2').value;
    filter.SubProj = document.getElementById('proj').value;

    let options = {
        "projection": {
            "SubProjItem": 1
        }
    };

    let query = await fetch(LocalHost + 'query' + `?database=CqDemo&collection=PartList`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "filter": filter, "options": options })
    })

    let resposeData = await query.json();
    // elem.innerHTML = "";
    let receiver = new nodeGraph.connector({ "name": filter.UnitProj , 'values': 'Receiver'});

    for (let i = 0; i < resposeData.length; i++) {
        receiver.addOutput({ 'name': resposeData[i].SubProjItem, 'identity': resposeData[i]._id.toString() });
    }
    receiver.moveTo({ x: 900, y: 900 });
    receiver.show();

    nodeList.push(receiver);
}