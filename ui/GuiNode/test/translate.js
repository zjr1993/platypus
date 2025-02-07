// drag and move
class drag {
    constructor(){
        this.constructor.focus = null;  // dom
        this.constructor.isStart = false;
        this.constructor.currentPos = {x: 0, y: 0};
        this.constructor.initialPos = {x: 0, y: 0};
        this.constructor.zIndex = 2;
        this.constructor.OffsetLeft = 0;
        this.constructor.OffsetTop = 0;
        this.constructor.container = null;
    }

    init(query) {
        this.target = document.querySelector(query);
        this.target.style.transform="translate(0px, 0px)";
        this.target.addEventListener('mousedown', drag.mousedownDrag);
        if (drag.container===null){
            drag.container = this.target.offsetParent;
        }
    }

    static getTranslate2DFromStr(translateStr) {
        let translate2D = translateStr.match(/-?\d+(?=px)/g);
        translate2D.forEach((elem, index) => {
            translate2D[index] = Number(elem);
        });
        return translate2D;
    }

    static mousedownDrag(event) {
        event.preventDefault();
        const style = event.target.style;
        style['z-index'] = (drag.zIndex);
        drag.zIndex = drag.zIndex + 1;
        drag.isStart = true;
        drag.focus = event.target;
        if (style.transform) {
            drag.initialPos.x = event.clientX;
            drag.initialPos.y = event.clientY;
            [drag.currentPos.x, drag.currentPos.y] = drag.getTranslate2DFromStr(style.transform);
            window.addEventListener('mousemove', drag.mousemoveDrag);
            window.addEventListener('mouseup', drag.mouseupDrag);
        }
        event.stopPropagation();
    }

    static mousemoveDrag(event) {
        event.preventDefault();
        if (drag.isStart) {
            let diffX = event.clientX - drag.initialPos.x;
            let diffY = event.clientY - drag.initialPos.y;
            requestAnimationFrame(function(){
                drag.focus.style.transform = "translate("
                    + (drag.currentPos.x + diffX) + "px,"
                    + (drag.currentPos.y + diffY) + "px)";
            })
        }
    }
    
    static mouseupDrag(event){
        if (drag.isStart){
            drag.isStart = false;
            window.removeEventListener('mousemove', drag.mousemoveDrag);
            window.removeEventListener('mouseup', drag.mouseupDrag);
        }
    }
}


let target1 = new drag('.block1');
let target2 = new drag('.block2');