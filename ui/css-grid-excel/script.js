class point {
    constructor() {
        this.startPoint = {
            x: 0, y: 0
        }
        this.endPoint = {
            x: 0, y: 0
        }
        this.Moving = false;
    }

    // 0______________2
    // |              |
    // |              | 
    // |              |
    // 3--------------1
    getPosRect() {
        let rect = new Array();
        rect.push(this.startPoint);
        rect.push(this.endPoint);
        rect.push({
            x: this.endPoint.x,
            y: this.startPoint.y
        });
        rect.push({
            x: this.startPoint.x,
            y: this.endPoint.y
        });
        return rect;
    }

    isSelected(rect) {
        let angle = this.getPosRect();
        let rectangle = [
            {
                x: rect.x,
                y: rect.y
            },
            {
                x: rect.x + rect.width,
                y: rect.y + rect.height
            },
            {
                x: rect.x + rect.width,
                y: rect.y
            },
            {
                x: rect.x,
                y: rect.y + rect.height
            }
        ];
        return ((rectangle[1].x - angle[3].x)*(rectangle[3].x - angle[1].x) <= 0 && 
        (rectangle[1].y - angle[2].y)*(rectangle[2].y - angle[1].y) <= 0) || ((angle[1].x - rectangle[3].x)*(angle[3].x - rectangle[1].x) <= 0 && 
        (angle[1].y - rectangle[2].y)*(angle[2].y - rectangle[1].y) <= 0) ;
    }
}

const Point = new point();
const domElemts = document.querySelectorAll("input.cells__input");
var current_highlight_element = null;


addEventListener("mousemove", (event)=>{
    if (!Point.Moving) return;
    let x = event.clientX;
    let y = event.clientY;
    Point.endPoint = {"x":x, "y":y};
    for (let elem of domElemts){
        if (Point.isSelected(elem.getBoundingClientRect())){
            elem.classList.add('selected');
        }
        else {
            elem.classList.remove('selected');
        }
    }
})

addEventListener('mouseup', (event)=>{
    Point.Moving = false;
})


addEventListener("mousedown", (event) => {
    let x = event.clientX;
    let y = event.clientY;
    Point.startPoint = {"x":x, "y":y};
    Point.endPoint = Point.startPoint;
    Point.Moving = !Point.Moving;

    for (let elem of domElemts){
        if (Point.isSelected(elem.getBoundingClientRect())){
            elem.classList.add('selected');
            if (current_highlight_element){
                current_highlight_element.classList.remove('selected');
            }
            current_highlight_element = elem;
            break;
        }
    }
});


// setInterval(()=>{console.log(Point.endPoint.x, Point.endPoint.y)}, 2000)


class cursor {
    constructor (x, y) {
        this.startPoint = {
            x: x, y: y
        }
        this.endPoint = {
            x: x, y: y
        }
        this.Moving = false;
    }
}