// 避免重复定义
const nodeGraph = window.nodeGraph || {};
var uniqueId = 0;
var deletePath = {};
var nodeList = new Array();
var nodeData = {};
var BeamData = {};
var receiver = null;
var allNodes = new Array();
// 判断是否存在Jquery库
if (!jQuery) alert('this app need jQuery-ui');



/*将代码实现封装到一个匿名函数中，避免自定义的变量和
全局域中的系统变量发生名字冲突。同时也可以隐藏那些不必要暴露的接口*/
(function (_Graph, _$) {
    // 如果 node 接口已经定义则返回
    if (_Graph.node) return;

    var clickNode = null;

    // 创建带命名空间的元素 svg
    const nameUrl = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(nameUrl, 'svg');
    svg.id = 'nodeGraph';
    svg.ns = svg.namespaceURI;
    // 放置到 body 中
    document.body.appendChild(svg);
    const noteMenu = document.createElement('div');
    noteMenu.id = 'ctx_menu'
    noteMenu.style.display = 'none'
    document.body.appendChild(noteMenu);

    const mouse = {
        currentInput: undefined
    };

    // start end == {x: , y: }
    function createPath(start, end) {
        if (typeof start == "string") {
            // 更新连接路径path的尾端坐标
            let start_x = Number(start.slice(1, start.indexOf(',')));
            let start_y = start.slice(start.indexOf(',') + 1, start.indexOf('C'));
            let dx = end.x - start_x;
            return `M${start_x},${start_y}C${start_x + dx / 3 * 2},${start_y} ${start_x + dx / 3},${end.y} ${end.x},${end.y}`;
        }
        else if (typeof end == "string") {
            // 更新连接路径path的头部坐标
            let end_x = Number(end.slice(end.lastIndexOf(' ') + 1, end.lastIndexOf(',')));
            let end_y = end.slice(end.lastIndexOf(',') + 1,);
            let dx = end_x - start.x;
            return `M${start.x},${start.y}C${start.x + dx / 3 * 2},${start.y} ${start.x + dx / 3},${end_y} ${end_x},${end_y}`;
        }
        else {
            let dx = end.x - start.x;
            // 三次贝塞尔曲线
            return `M${start.x},${start.y}C${start.x + dx / 3 * 2},${start.y} ${start.x + dx / 3},${end.y} ${end.x},${end.y}`;
        }
    };

    // 鼠标移动的时候绘制跟随曲线
    svg.onmousemove = function (event) {
        let input = mouse.currentInput;
        if (input && input.path) {
            let path = input.path;
            let inPtr = input.position;
            let outPtr = { x: event.pageX, y: event.pageY };
            path.setAttributeNS(null, 'd', createPath(inPtr, outPtr));
        }
    };

    // 鼠标点击空白画布,则放弃曲线
    svg.onclick = function (event) {
        let input = mouse.currentInput;
        if (input) {
            // 处于绘制曲线状态
            svg.removeChild(input.path);
            if (input.Links.length == 0) {
                // 此输出节点没有连接link
                input.domElement.classList.remove('linked');
                input.domElement.classList.add('unlinked');
            }
            mouse.currentInput = undefined;
        }
        noteMenu.style.display = 'none';
    };

    // 对于递归函数用函数赋值法, 可以避免因函数名被占用而导致的递归错误
    let getCoordinate = (function fn(elem) {
        let offset = { top: elem.offsetTop, left: elem.offsetLeft };
        if (elem.offsetParent) {
            let parentOff = fn(elem.offsetParent);
            offset.top += parentOff.top;
            offset.left += parentOff.left;
        }
        return offset;
    });

    function isConnect(input, output) {
        for (let link of input.Links) {
            if (link.target == output) {
                return true;
            }
        }
        return false;
    };

    class nodeInput {
        constructor(options) {
            this.name = 'a input interface';
            this.title = "--->▶";
            this.type = 'connection';
            this.stroke_width = 4;
            this.stroke_color = "#008B8B";

            for (let p in options) {
                if (this.hasOwnProperty(p)) {
                    this[p] = options[p];
                }
            }
            // [{target: inputObject, path: svgPath}, ... ]
            this.Links = new Array();
            this.path = null;
            this.node = null;
            this.domElement = document.createElement('div');
            this.domElement.textContent = this.name;
            this.domElement.setAttribute('title', this.title);
            this.domElement.classList.add('x-' + this.type);
            let that = this;
            if (this.type == 'input') {
                let input = document.createElement('input');
                this.domElement.classList.add('empty');
                Object.defineProperty(that, 'value', {
                    get: function () { return input.value; },
                    set: function (val) { input.value = val },
                    enumerable: true
                });
                this.domElement.textContent += ' ';
                this.domElement.appendChild(input);
            }
            if (this.type == 'connection') {
                this.domElement.classList.add('unlinked');
                this.domElement.onclick = function (event) {
                    if (mouse.currentInput === undefined) {
                        mouse.currentInput = that;
                        that.getPosition();
                        that.path = document.createElementNS(svg.ns, 'path');
                        that.path.setAttributeNS(null, 'stroke', that.stroke_color);
                        that.path.setAttributeNS(null, 'stroke-width', `${that.stroke_width}`);
                        that.path.setAttributeNS(null, 'stroke-opacity', '0.8');
                        that.path.setAttributeNS(null, 'fill', 'none');
                        svg.appendChild(that.path);
                        if (that.domElement.classList.contains('unlinked')) {
                            that.domElement.classList.remove('unlinked');
                            that.domElement.classList.add('linked');
                        }
                    }
                    event.stopPropagation();

                }
            }
        }

        getPosition() {
            var fchild = this.domElement; //x-connection
            var offset = getCoordinate(fchild);
            this.position = {
                x: offset.left + fchild.offsetWidth,
                y: offset.top + fchild.offsetHeight / 2
            };
        }
    };

    class nodeOutput {
        constructor(options) {
            this.name = 'receiver';
            this.identity = null;
            for (let p in options) {
                if (this.hasOwnProperty(p)) {
                    this[p] = options[p];
                }
            }
            // [{target: inputObject, path: svgPath}, ... ]
            this.Chains = new Array();
            this.connected = false;
            this.domElement = document.createElement('div');
            this.domElement.classList.add('x-output');  // x-node
            this.domElement.classList.add('unattached');
            // this.domElement.textContent = this.name;
            let span = document.createElement('span');
            span.classList.add('x-span'); // x-output
            span.textContent = '▶';
            this.domElement.appendChild(span);

            span = document.createElement('span');
            span.classList.add('x-span-text');
            span.textContent = this.name;
            this.domElement.appendChild(span);
        }

        getPosition() {
            var fchild = this.domElement.firstElementChild; //x-span
            var offset = getCoordinate(fchild);
            this.position = {
                x: offset.left + fchild.offsetWidth / 2,
                y: offset.top + fchild.offsetHeight / 2
            };
        }

        connectedTo(input) {
            if (!input.path) {
                // path not exist, not a click
                input.getPosition();
                input.path = document.createElementNS(svg.ns, 'path');
                input.path.setAttributeNS(null, 'stroke', input.stroke_color);
                input.path.setAttributeNS(null, 'stroke-width', `${input.stroke_width}`);
                input.path.setAttributeNS(null, 'stroke-opacity', '0.8');
                input.path.setAttributeNS(null, 'fill', 'none');
                svg.appendChild(input.path);
                if (input.domElement.classList.contains('unlinked')) {
                    input.domElement.classList.remove('unlinked');
                    input.domElement.classList.add('linked');
                }
                if (this.domElement.classList.contains("unattached")) {
                    this.domElement.classList.remove('unattached');
                    this.domElement.classList.add('attached');
                }
            }
            let flag = true;
            uniqueId++ // output call this function
            input.Links.push({
                target: this,
                path: input.path,
                id: uniqueId
            });
            this.connected = true;
            this.Chains.push({
                target: input,
                path: input.path,
                id: uniqueId
            });
            let idValue = uniqueId;
            this.getPosition();
            input.path.setAttributeNS(null, 'd', createPath(input.position, this.position));
            input.path.addEventListener('click', function (event) {
                if (flag) {
                    deletePath[idValue] = input;
                    event.target.setAttributeNS(null, 'stroke', '#FF1493');
                }
                else {
                    deletePath[idValue] = undefined;
                    event.target.setAttributeNS(null, 'stroke', '#008B8B');
                }
                flag = !flag;
            });
        }
    };

    class node {
        constructor(options) {
            this.name = "😀";
            this.values = {};
            this.titleColor = 'nodeTitle';
            for (let p in options) {
                if (this.hasOwnProperty(p)) {
                    this[p] = options[p];
                }
            }
            this.outputList = [];
            this.inputList = [];
            let that = this;
            this.domElement = document.createElement('div');
            this.domElement.classList.add('x-node');
            this.domElement.classList.add(this.titleColor);
            this.domElement.setAttribute('title', this.name);

            this.domElement.addEventListener('contextmenu', (e) => {
                noteMenu.style.top = 'calc(' + e.pageY + 'px - 1em)';
                noteMenu.style.left = e.pageX + 'px';
                noteMenu.style.display = 'inline-block';
                clickNode = that;
                e.preventDefault();
            });

            // a layout to contain text-input
            this.layout = document.createElement('section');
            this.layout.classList.add('inlayout');
            this.layout.style.display = 'none';
            this.domElement.appendChild(this.layout);
        }

        addOutput(options) {
            let output = new nodeOutput(options);
            let that = this;
            output.domElement.firstElementChild.onclick = function (event) {
                let input = mouse.currentInput;
                if (input && !that.IsSelfInput(input)) {
                    if (!isConnect(input, output)) {
                        // 排除自连接和重复连接的情况，进行连接
                        if (input.isSpecial && that.outputList.length >= 4) {
                            // 先删除原有的路径
                            svg.removeChild(input.path);
                            for (let i = 1; i < that.outputList.length - 1; i++) {
                                input.path = document.createElementNS(svg.ns, 'path');
                                input.path.setAttributeNS(null, 'stroke', '#3f8cc0');
                                input.path.setAttributeNS(null, 'stroke-width', '1');
                                input.path.setAttributeNS(null, 'stroke-opacity', '0.8');
                                input.path.setAttributeNS(null, 'fill', 'none');
                                svg.appendChild(input.path);
                                that.outputList[i].connectedTo(input);
                                if (that.outputList[i].domElement.classList.contains("unattached")) {
                                    that.outputList[i].domElement.classList.remove('unattached');
                                    that.outputList[i].domElement.classList.add('attached');
                                }
                            }
                            if (input.domElement.classList.contains('unlinked')) {
                                input.domElement.classList.remove('unlinked');
                                input.domElement.classList.add('linked');
                            }
                        }
                        else {
                            output.connectedTo(input);
                            if (output.domElement.classList.contains("unattached")) {
                                output.domElement.classList.remove('unattached');
                                output.domElement.classList.add('attached');
                            }
                        }
                        mouse.currentInput = undefined;
                    }
                }
                event.stopPropagation();
            }
            // output.node = this;
            this.outputList.push(output);
            this.domElement.appendChild(output.domElement);
            return output;
        }

        addInput(options) {
            let input = new nodeInput(options);

            if (options.type == 'input') {
                // 对于文字输入类型加入到布局中去
                this.layout.style.display = 'grid';
                this.layout.appendChild(input.domElement);
            }
            else {
                this.domElement.appendChild(input.domElement);
            }
            input.node = this;
            this.inputList.push(input);
            return input;
        }

        updatePosition() {
            for (let output of this.outputList) {
                output.getPosition();
                for (let i = 0; i < output.Chains.length; i++) {
                    let pathStr = createPath(output.Chains[i].target.position, output.position);
                    output.Chains[i].path.setAttributeNS(null, 'd', pathStr);
                }
            }
            for (let input of this.inputList) {
                input.getPosition();
                for (let i = 0; i < input.Links.length; i++) {
                    let pathStr = createPath(input.position, input.Links[i].target.position);
                    input.Links[i].path.setAttributeNS(null, 'd', pathStr);
                }
            }
        }

        IsSelfInput(input) {
            for (let ipt of this.inputList) {
                if (ipt == input) {
                    return true;
                }
            }
            return false;
        }

        moveTo(point /**px measure */) {
            this.domElement.style.top = point.y + 'px';
            this.domElement.style.left = point.x + 'px';
            this.updatePosition();
        }

        show() {
            let that = this;
            _$(this.domElement).draggable({
                containment: 'window',
                cancel: '.x-connection, .x-output, .x-input',
                drag: function (e, ui) {
                    that.updatePosition();
                }
            });

            this.domElement.style.position = 'absolute';
            // TODO
            document.body.appendChild(this.domElement);
            this.updatePosition();
        }
    };

    function deleteNode(node) {
        // 删除所有已连接的路径
        let outputs = node.outputList;
        let inputs = node.inputList;

        for (let input of inputs) {
            for (let i = 0; i < input.Links.length; i++) {
                svg.removeChild(input.Links[i].path);
                let output = input.Links[i].target;
                for (let j = 0; j < output.Chains.length; j++) {
                    if (output.Chains[j].id == input.Links[i].id) {
                        output.Chains.splice(j, 1);
                        break;
                    }
                }
                if (output.Chains.length < 1) {
                    output.domElement.classList.remove('attached');
                    output.domElement.classList.add('unattached');
                }
            }
        }
        for (let output of outputs) {
            for (let i = 0; i < output.Chains.length; i++) {
                svg.removeChild(output.Chains[i].path);
                let input = output.Chains[i].target;
                for (let j = 0; j < input.Links.length; j++) {
                    if (input.Links[j].id == output.Chains[i].id) {
                        input.Links.splice(j, 1);
                        break;
                    }
                }
                if (input.Links.length < 1) {
                    input.domElement.classList.remove('linked');
                    input.domElement.classList.add('unlinked');
                }
            }
        }

        for (let j = 0; j < nodeList.length; j++) {
            if (nodeList[j] == node) {
                nodeList.splice(j, 1);
            }
        }

        document.body.removeChild(node.domElement);
        allNodes = allNodes.filter(function (item){
            return node !== item;
        })
    }
    const subMenu = document.createElement('ul');
    noteMenu.appendChild(subMenu);

    const subOption_delete = document.createElement('li');
    subOption_delete.textContent = 'Delete';
    const subOption_copy = document.createElement('li');
    subOption_copy.textContent = 'copy';

    subMenu.appendChild(subOption_delete);
    subMenu.appendChild(subOption_copy);

    subOption_delete.onclick = function (e) {
        deleteNode(clickNode);
        noteMenu.style.display = 'none';
    }
    _Graph.connector = node;
    _Graph.svg = svg;
    _Graph.deleteNode = deleteNode;

})(nodeGraph, jQuery);


function clearAll(){
    for (let _node of allNodes){
        nodeGraph.deleteNode(_node);
    }
    deletePath = {};
    nodeList = new Array();
    nodeData = {};
    BeamData = {};
    receiver = null;
    allNodes = new Array();
}



function deleteSelected() {
    for (let id in deletePath) {
        if (deletePath[id] === undefined) {
            continue;
        }
        else {
            // input.Links.push({
            //     target: this,
            //     path: input.path,
            //     id : uniqueId
            // });
            let input = deletePath[id];
            let newLinks = new Array();
            for (let i = 0; i < input.Links.length; i++) {
                let newChains = new Array();
                if (input.Links[i].id.toString() == id.toString()) {
                    nodeGraph.svg.removeChild(input.Links[i].path);
                    let output = input.Links[i].target;
                    for (let j = 0; j < output.Chains.length; j++) {
                        if (output.Chains[j].id.toString() != id.toString()) {
                            newChains.push(output.Chains[j]);
                        }
                    }
                    output.Chains = newChains;
                    if (output.Chains.length < 1) {
                        output.domElement.classList.remove('attached');
                        output.domElement.classList.add('unattached');
                    }
                }
                else {
                    newLinks.push(input.Links[i]);
                }
            }
            input.Links = newLinks;
            if (input.Links.length < 1) {
                input.domElement.classList.remove('linked');
                input.domElement.classList.add('unlinked');
            }
            delete deletePath[id];
        }
    }
}


// if not have output, then return input Of type input
// {id: node.values, param: {}, multiply: 1}
// f(node)

// f(node, array, multiply) if (node has output) loop output loop input ==> f(node, array, nodeInput)
// else have no output array.push({id: node.values, param: {}, multiply: 1})


// 收集梁的类型数据
async function GatherToBeamTable() {
    let output = receiver.outputList[0];
    BeamData = {};
    let nameBeam = receiver.inputList[0].value;
    if (!nameBeam) {
        alert('缺少梁类型名');
        return;
    }
    BeamData[nameBeam] = new Array();
    for (let input of output.Chains) {
        GatherIterate(input.target.node, BeamData[nameBeam], 1);
    }

    let ret = await fetch(LocalHost + 'BeamType', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(BeamData)
    });
    let resposeData = await ret.text();
    // console.log(isOk);
    if (resposeData){
        alert(`数据上传成功编号为:${resposeData}`);
    }
    else {
        alert('数据上传失败');
    }
}




// 对所用关联数据进行汇总并上传服务器
async function GatherDataToServer() {
    nodeData = {};
    for (let node of nodeList) {
        for (let output of node.outputList) {
            // begin gather through input
            nodeData[output.identity] = new Array();
            for (let input of output.Chains) {
                GatherIterate(input.target.node, nodeData[output.identity], 1);
            }
        }
    }
    let emptyKey = [];
    for (let key in nodeData) {
        if (nodeData[key].length == 0) {
            emptyKey.push(key);
        }
    }
    for (let key of emptyKey) {
        delete nodeData[key];
    }

    //{ids: [{id: node.values, param: {}, multiply: 1},{id: node.values, param: {}, multiply: 1},....],ids:[{}]}
    let post = await fetch(LocalHost + 'data', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nodeData)
    });

    let resposeData = await post.json();
    let isOk = resposeData.isOk;
    // console.log(isOk);
    if (isOk){
        alert('数据上传成功');
    }
    else {
        alert('数据上传失败');
        // console.log(resposeData.errorInfo);
    }
}

function GatherIterate(node, array, multiply) {
    if (node.outputList.length == 0) {
        // 最后的节点
        // the database id of the table of this node
        let id = node.values;
        let ret = { 'id': id, "multiply": multiply, "nodeName": node.name, "titleColor": node.titleColor };
        let param = {};
        for (let input of node.inputList) {
            if (input.type == 'input') {
                param[input.name] = input.value;
            }
            else {
                ret.inputName = input.name;
            }
        }
        ret.param = param;
        array.push(ret);
    }
    else {
        let mul = 1;
        if (node.values == 'Amplifier') {
            mul = node.inputList[0].value;
        }
        for (let output of node.outputList) {
            for (let input of output.Chains) {
                GatherIterate(input.target.node, array, mul * multiply);
            }
        }
    }
}
