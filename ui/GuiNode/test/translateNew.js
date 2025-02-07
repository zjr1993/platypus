class draggable {
    constructor() {
        this.focus = null;
        this.target = null;
        this.initialTranslation = { x: 0, y: 0 };
        this.initialMousePosition = { x: 0, y: 0 };
        this.zIndex = 2;
        this.container = null;
        this.boundmousemoveDrag = this.mousemoveDrag.bind(this);
        this.boundmouseupDrag = this.mouseupDrag.bind(this);
        this.boundmousedownDrag = this.mousedownDrag.bind(this);
    }

    init(query) {
        this.target = document.querySelector(query);
        this.target.style.transform = "translate(0px, 0px)";
        this.target.addEventListener('mousedown', this.boundmousedownDrag);
        if (this.container === null) this.container = this.target.offsetParent;
    }

    getTranslate2DFromStr(translateStr) {
        let translate2D = translateStr.match(/-?\d+(?=px)/g);
        translate2D.forEach((elem, index) => {
            translate2D[index] = Number(elem);
        });
        return translate2D;
    }

    mousedownDrag(event) {
        event.preventDefault();
        const style = event.target.style;
        style['z-index'] = (++this.zIndex);
        this.focus = event.target;
        if (style.transform) {
            this.initialMousePosition.x = event.clientX;
            this.initialMousePosition.y = event.clientY;
            [this.initialTranslation.x, this.initialTranslation.y] = this.getTranslate2DFromStr(style.transform);
            window.addEventListener('mousemove', this.boundmousemoveDrag);
            window.addEventListener('mouseup', this.boundmouseupDrag);
        }
        event.stopPropagation();
    }

    mousemoveDrag(event) {
        event.preventDefault();
        let diffX = event.clientX - this.initialMousePosition.x;
        let diffY = event.clientY - this.initialMousePosition.y;
        requestAnimationFrame(()=> {
            this.focus.style.transform = "translate("
                + (this.initialTranslation.x + diffX) + "px,"
                + (this.initialTranslation.y + diffY) + "px)";
        })
    }

    mouseupDrag(event) {
        window.removeEventListener('mousemove', this.boundmousemoveDrag);
        window.removeEventListener('mouseup', this.boundmouseupDrag);
    }
}

const drag = new draggable();

drag.init('.block1')
drag.init('.block2')
// let target1 = new drag('.block1');
// let target2 = new drag('.block2');