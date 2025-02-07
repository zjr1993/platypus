const LocalHost = "http://127.0.0.1:3989/"

// var rootnode = new nodeGraph.connector({ "name": "Extraterrestrials" });

// rootnode.addOutput({ "name": "satellite dish" });
// rootnode.addOutput({ "name": "A $ B" });
// rootnode.addOutput({ "name": "multiply C * D" });
// rootnode.addInput({ "name": "emit" });
// rootnode.addInput({ "name": "emit2" });
// rootnode.addInput({ "name": "n1", 'type': "input" });
// rootnode.addInput({ "name": "L", 'type': "input" });
// rootnode.addInput({ "name": "B", 'type': "input" });
// rootnode.addInput({ "name": "n3", 'type': "input" });

// rootnode.moveTo({ x: 300, y: 300 });
// rootnode.show();

// var rootnode2 = new nodeGraph.connector({ "name": "Extraterrestrials2" });
// rootnode2.addOutput({ "name": "satellite2 dish" });


// rootnode2.addInput({ "name": "emit" });

// rootnode2.addInput({ "name": "emit2" });
// rootnode2.addInput({ "name": "emit3" });

// rootnode2.moveTo({ x: 600, y: 300 });
// rootnode2.show();


// var rootnode3 = new nodeGraph.connector({ "name": "Extraterrestrials2" });
// rootnode3.addOutput({ "name": "satellite2 dish" });
// rootnode3.addOutput({ "name": "satellite2 dish" });


// rootnode3.addInput({ "name": "emit" });

// rootnode3.addInput({ "name": "emit2" });

// rootnode3.moveTo({ x: 600, y: 900 });
// rootnode3.show();


const unit = document.getElementById("unit");
const unit2 = document.getElementById("unit2");
const part = document.getElementById("part");
const part2 = document.getElementById("part2");
const proj = document.getElementById("proj");
const beams = document.getElementById("beams");
const partition = document.getElementById("partition");
const content = document.getElementById("content");
const BeamType = document.getElementById("BeamID");

document.body.onload = initContent;

// unit.addEventListener("change", (event) => {
//     let result.textContent = `You like ${event.target.value}`;
// });


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
    let query2 = await fetch(LocalHost + 'findDist' + `?distkey=name&database=CqDemo&collection=BeamSome`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        // body: JSON.stringify({})
    })
    let resposeData2 = await query2.json();
    if (resposeData2[0] == 'UNknow') {
        alert("some error happen in query!");
    }
    else {
        for (var text of resposeData2) {
            if (!(text.includes("边梁") || text.includes("中梁"))){
            let unitOp = document.createElement("option");
            unitOp.setAttribute('value', text);
            unitOp.textContent = text;
            BeamType.appendChild(unitOp);}
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


// input some beam calculate Table
beams.addEventListener("change", async (event) => {
    let a1 = await _queryIterative("info.part", { 'info.TypeOfBeam': event.target.value }, partition, "CqDemo", "BeamType1");

    let a2 = await _queryIterative('info.content', {'info.TypeOfBeam': event.target.value, 'info.part': a1}, content, "CqDemo", "BeamType1");
}
)

partition.addEventListener("change", async (event) => {
    let a2 = await _queryIterative('info.content', {'info.TypeOfBeam': beams.value, 'info.part': event.target.value}, content, "CqDemo", "BeamType1");
}
)

function addBeamData(){
    receiver = new nodeGraph.connector({ "name": "梁类型", 'values': 'Receiver'});
    allNodes.push(receiver);
    receiver.addInput({'name': '类型', 'type': 'input'});
    receiver.addOutput({ 'name': ">", 'identity': '0' });
    receiver.moveTo({ x: 900, y: 900 });
    receiver.show();
}

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

    let query = await fetch(LocalHost + 'filters' + `?database=CqDemo&collection=PartList`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "filters": filter, "options": options })
    })

    let resposeData = await query.json();
    // elem.innerHTML = "";
    let receiver = new nodeGraph.connector({ "name": filter.UnitProj , 'values': 'Receiver'});
    allNodes.push(receiver);

    for (let i = 0; i < resposeData.length; i++) {
        receiver.addOutput({ 'name': resposeData[i].SubProjItem, 'identity': resposeData[i]._id.toString() });
    }
    receiver.moveTo({ x: 900, y: 900 });
    receiver.show();

    nodeList.push(receiver);
}

// blue: #1e90ff;
// --white: #ffffff;
// --green: #93e070;
// --purple: #be51cf;
// --woodGray: #ccb8b8;
// --red: #dc4848;
// --winterBlue: #3f8cc0;
// --nodeTitle: #3b61bd;
// --tee: #9ba91e;
// --gold: #daae0f;
function colorChoice(name){
    if (name.includes('翼板')){
        return 'purple';
    }
    else if (name.includes('梁肋')){
        return 'woodGray';
    }
    else if (name.includes('横隔梁')){
        return 'winterBlue';
    }
    else if (name.includes('锚')){
        return 'green';
    }
    else if (name.includes('齿')){
        return 'tee';
    }
    else {
        return 'nodeTitle';
    }
}

async function insert(){
    let filter = {};
    let _TypeOfBeam = beams.value;
    let _part = partition.value;
    let _content = content.value;

    filter['info.TypeOfBeam'] = _TypeOfBeam;
    filter['info.part'] = _part;
    filter['info.content'] = _content;

    let options = {
        "projection": {
            // some projection
            "param": 1
        }
    };

    let query = await fetch(LocalHost + 'filters' + `?database=CqDemo&collection=BeamType1`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "filters": filter, "options": options })
    })

    let resposeData = await query.json();
    let table = new nodeGraph.connector({ 'name': _TypeOfBeam + ' ' + _part,'titleColor':  colorChoice(_part),'values': resposeData[0]._id });
    allNodes.push(table);
    for (p in resposeData[0].param){
        let input = table.addInput({'name': p, 'type': 'input'});
        input.value = resposeData[0].param[p];
    }
    table.addInput({'name': _content});
    table.show();
}


function AmplifierConnector(){
    let amp = new nodeGraph.connector({'name': '放大器', 'values': 'Amplifier'});
    allNodes.push(amp);
    amp.addOutput({'name': '---λ-->'});
    let input = amp.addInput({'name': 'scale', 'type': 'input'});
    input.value = 1;
    let ip = amp.addInput({'name': 'scale', 'stroke_color': '#3f8cc0', 'stroke_width': 2});
    ip.isSpecial = true;
    amp.show();
}


function GenConnecter(){
    let amp = new nodeGraph.connector({'name': '集线器', 'values': 'Amplifier'});
    allNodes.push(amp);
    amp.addOutput({'name': '-->'});
    let input = amp.addInput({'name': 'scale', 'type': 'input'});
    input.value = 1;
    let ip = amp.addInput({'name': 'scale', 'stroke_color': '#3f8cc0', 'stroke_width': 1});
    ip.isSpecial = false;
    amp.show();
}

function GenCon(name, multiply, x, y, isSpecial, stroke_width){
    let amp = new nodeGraph.connector({'name': name, 'values': 'Amplifier'});
    allNodes.push(amp);
    amp.addOutput({'name': '-->'});
    let input = amp.addInput({'name': 'scale', 'type': 'input'});
    input.value = multiply;
    let ip = amp.addInput({'name': 'scale', 'stroke_color': '#3f8cc0',
    'stroke_width': stroke_width});
    ip.isSpecial = isSpecial;
    amp.moveTo({'x': x, 'y': y});
    amp.show();
    return amp;
}


function dataToGraph(data){
    let x_init = 300;
    let y_init = 600;
    let endNode = GenCon('集线器', 1, x_init+500, y_init+200, false, 2);
    for (let elem of data){
        let param = elem.param;
        let table = new nodeGraph.connector({'name': elem.nodeName,
        'titleColor':elem.titleColor,'values': elem.id});
        allNodes.push(table);
        for (p in param){
            let input = table.addInput({'name': p, 'type': 'input'});
            input.value = param[p];
        }
        let ip = table.addInput({'name': elem.inputName});
        table.moveTo({ x: x_init, y: y_init });
        table.show();
        if (elem.multiply > 0){
            // 创建一个集线器
            let scaleNode = GenCon('集线器', elem.multiply, x_init+300, y_init, false, 2);
            scaleNode.outputList[0].connectedTo(ip);
            endNode.outputList[0].connectedTo(scaleNode.inputList[1]);
        }
        else {
            endNode.outputList[0].connectedTo(ip);
        }
        y_init += 100;
    }
}

async function downLoadBeam(){
    let name = document.getElementById("BeamID").value;
    // alert(name);

    let query = await fetch(LocalHost + 'filters' + `?database=CqDemo&collection=BeamSome`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({  
            "filters": {"name": name}
        })
    });

    let resposeData = await query.json();
    if (resposeData.length>0){
        let docx = resposeData[0];
        dataToGraph(docx.data);
    }
    else {
        alert('数据不存在');
    }
}