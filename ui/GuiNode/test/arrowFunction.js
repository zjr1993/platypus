// test
const NodeList = {};

class Draggable {
    constructor (update) {
        this.z = 1;
        this.selection = null;
        this.container = null;
        this.node = null;

        this.init_translate = {x:0, y:0};
        this.init_clientPos = {x:0, y:0};

        this.displacement = {x:0, y:0};

        this.current_translate = {x:0, y:0};
        this.current_clientPos = {x:0, y:0};

        this.update = update;}

        mousedownDrag = (event)=>{
            event.preventDefault();
            const style = event.target.style;
            style['z-index'] = (++this.z);
            this.selection = event.target;
            this.node = NodeList[this.selection.id];
            this.container = this.selection.offsetParent;

            if (this.node.draggable){
                [this.init_clientPos.x, this.init_clientPos.y] = [event.clientX, event.clientY];
                [this.init_translate.x, this.init_translate.y] = this.getTranslate2DFromStr(style.transform);
                window.addEventListener('mousemove', this.mousemoveDrag, {"once": false});
                window.addEventListener('mouseup', this.mouseupDrag);
                event.stopPropagation();
            }
        }
        mousemoveDrag=(event)=>{
            event.preventDefault();
            this.displacement.x = event.clientX - this.init_clientPos.x;
            this.displacement.y = event.clientY - this.init_clientPos.y;
            this.current_translate.x = this.displacement.x + this.init_translate.x;
            this.current_translate.y = this.displacement.y + this.init_translate.y;
            if (this.current_translate.x < 0){
                this.displacement.x = - this.init_translate.x;
                this.current_translate.x = 0;
            }
            if (this.current_translate.y < 0){
                this.displacement.y = - this.init_translate.y;
                this.current_translate.y = 0;
            }
            const containerRect = this.container.getBoundingClientRect();
            const draggableRect = this.selection.getBoundingClientRect();

            if (this.current_translate.x + draggableRect.width > containerRect.width){
                this.current_translate.x = containerRect.width - draggableRect.width;
            }

            if (this.current_translate.y + draggableRect.height > containerRect.height){
                this.current_translate.y = containerRect.height - draggableRect.height;
            }

            this.update();
        }

        mouseupDrag = (event) => {
            window.removeEventListener('mousemove', this.mousemoveDrag);
            window.removeEventListener('mouseup', this.mouseupDrag);
        }

    init(node){
        node.DomElement.addEventListener('mousedown', this.mousedownDrag);
        node.DomElement.style.transform = "translate(0px, 0px)";
        if (this.container == null) this.container = node.DomElement.offsetParent;
    }

    getTranslate2DFromStr(translateStr) {
        let translate2D = translateStr.match(/-?\d+(?=px)/g);
        translate2D.forEach((elem, index) => {
            translate2D[index] = Number(elem);
        });
        return translate2D;
    }
}


function update() {
    requestAnimationFrame(()=> {
        this.selection.style.transform = "translate("
            + this.current_translate.x + "px,"
            + this.current_translate.y + "px)";
    });
}



let node_1 = {};
let node_2 = {};

node_1.DomElement=document.querySelector('.block1');
node_2.DomElement=document.querySelector('.block2');

node_1.draggable = true;
node_2.draggable = true;

NodeList[node_1.DomElement.id] = node_1;
NodeList[node_2.DomElement.id] = node_2;

let drag = new Draggable(update);

drag.init(node_1);
drag.init(node_2);

