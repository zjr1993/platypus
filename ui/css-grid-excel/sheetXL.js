const Sheet = window.Sheet || {};
const NUMBER_OF_ROWS = 100;
const NUMBER_OF_COLUMNS = 20;
var RECENT_EDIT_CELL = null;
var ActiveCell = null;
var dragging = false;
var Cells = {};
var $cell = $('.cell');

const ALPHABET = ['A', 'B', 'C', 'D', 'E',
    'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
(function (_sheet) {
    class _cell {
        constructor(row, col) {
            this.Merge = false;
            this.MergeCount = 1;
            this.MergeArea = {
                from: { Row: row, Column: col },
                to: { Row: row, Column: col }
            };
            this.Row = row;
            this.Column = col;
            this.readonly = true;
            this.domElement = document.createElement('input');
            this.domElement.classList.add('cell');
            this.domElement.setAttribute('id', `${row} ${col}`);
            this.domElement.setAttribute('readonly', 'readonly');
            let that = this;
            Object.defineProperty(that, 'Value', {
                get: function () { return that.domElement.value; },
                set: function (val) { that.domElement.value = val },
                enumerable: true
            });

            // this.Value = null;
            this.Formula = null;
            this.Text = "";
            this.Dependents = new Array();
            this.References = new Array();
        }


        EnableEdit() {
            this.domElement.removeAttribute('readonly');
            this.readonly = false;
        }


        DisableEdit() {
            this.domElement.setAttribute('readonly', "readonly");
            this.readonly = true;
        }


        ToggleEdit() {
            if (this.domElement.getAttribute('readonly')) {
                this.EnableEdit();
            }
            else {
                this.DisableEdit();
            }
        }

        ClearContent() {
            this.Text = "";
            this.Formula = null;
            this.Value = null;
        }

        Activate(){
            if (this != ActiveCell){
                if (ActiveCell) ActiveCell.domElement.blur();
                this.domElement.focus();
                ActiveCell = this;
            }
        }

        CharacterSelect(start, end) {
            let text = this.Value;
            if (text) {
                this.domElement.setSelectionRange(start,
                    end == -1 ? text.length : end);
            }
        }

        Offset(n, m){
            let cell = Sheet.rng.data[(this.Row + n-1)%(Sheet.rng.Row)][(this.Column + m-1)%(Sheet.rng.Column)];
            return cell;
        }

        init() {
            this.domElement.addEventListener('mousedown',(event)=>{
                if (event.detail > 1) {
                    event.preventDefault();
                }
                else {
                    let cell = getCellByDomElement(event.target);
                    cell.Activate();
                    dragging = true;
                    $('.cell').removeClass('selected');
                    $(rectClosureByCells(event.target, event.target)).each(function () {
                        $(this).addClass('selected');
                    })
                }
            });
            this.domElement.addEventListener('click', (event) => {
                let cell = getCellByDomElement(event.target);
                if (RECENT_EDIT_CELL && RECENT_EDIT_CELL != cell) {
                    RECENT_EDIT_CELL.DisableEdit();
                    RECENT_EDIT_CELL = null;
                }
                cell.Activate();
                // console.log(cell.domElement.style.outline);
            });

            this.domElement.addEventListener('mouseenter', (event) => {
                if (!dragging) {
                    return;
                }
                $('.cell').removeClass('selected');
                $(rectClosureByCells(ActiveCell.domElement, event.target)).each(function () {
                    console.log(this);
                    $(this).addClass('selected');
                })
            });

            this.domElement.addEventListener('mouseup', (event) => {
                dragging = false;
            })
        }
    }

    class _Cells {
        constructor(options) {
            this.Row = NUMBER_OF_ROWS;
            this.Column = NUMBER_OF_COLUMNS;
            for (let p in options) {
                if (this.hasOwnProperty(p)) {
                    this[p] = options[p];
                }
            }

            this.domElement = document.createElement('div');
            this.domElement.setAttribute('id', 'grid');
            this.domElement.classList.add('cells');
            document.getElementById('main').appendChild(this.domElement);

            let space = document.createElement('div');
            space.classList.add('cells_space');
            this.domElement.appendChild(space);

            this.domElement.style['grid-template-columns'] = `1fr repeat(${this.Column},calc((100% - 50px) / ${this.Column}))`;
            this.domElement.style['grid-template-rows'] = `repeat(${this.Row + 1}, 20px)`;

            for (let i = 1; i <= this.Column; i++) {
                let t = document.createElement('div');
                t.classList.add('cells_table_head');
                t.setAttribute('id', `head_${i}`);
                t.textContent = ALPHABET[i - 1];
               // t.style['width'] = `calc((100% - 50px) / ${this.Column})`;
                this.domElement.appendChild(t);
            }

            for (let i = 1; i <= this.Row; i++) {
                let line = document.createElement('div');
                line.classList.add('cells_table_line');
                line.setAttribute('id', `line_${i}`);
                line.textContent = i;
                this.domElement.appendChild(line);
            }

            this.data = new Array();
            for (let j = 1; j <= this.Row; j++) {
                let arr = new Array();

                for (let k = 1; k <= this.Column; k++) {
                    let p = new _cell(j, k);
                    p.init();
                    arr.push(p);
                    this.domElement.appendChild(p.domElement);
                }
                this.data.push(arr);
            }
            let fcell = this.data[0][0];
            fcell.Activate();
            ActiveCell = fcell;
        }
    }
    _sheet.Cells = _Cells;
})(Sheet);

Cells = new Sheet.Cells();

function getCellByDomElement(element) {
    if (/\d+ \d+/.test(element.id)) {
        let coordinate = element.id.split(' ');
        let row = coordinate[0];
        let col = coordinate[1];
        return Cells.data[row - 1][col - 1];
    }
    return null;
}


Cells.domElement.addEventListener('dblclick', (event) => {
    let cell = getCellByDomElement(document.activeElement);
    if (cell == RECENT_EDIT_CELL) {
        cell.CharacterSelect(0, -1);
        return;
    }
    if (RECENT_EDIT_CELL) {
        RECENT_EDIT_CELL.DisableEdit();
    }
    RECENT_EDIT_CELL = cell;
    cell.EnableEdit();
})


Cells.domElement.addEventListener('keydown', (event) => {
    let that = ActiveCell;
    if (that.readonly) {
        switch (event.key) {
            case 'i':
                RECENT_EDIT_CELL = that;
                that.EnableEdit();
                that.CharacterSelect(0, 0);
                break;
            case 'a':
                RECENT_EDIT_CELL = that;
                that.EnableEdit();
                that.CharacterSelect(that.Text.length - 1, that.Text.length - 1);
                break;
            case 'c':
                RECENT_EDIT_CELL = that;
                that.ClearContent();
                that.EnableEdit();
                break;
            case 'l':
                ActiveCell.Offset(0, 1).Activate();
                break;
            case 'h':
                ActiveCell.Offset(0, -1).Activate();
                break;
            case 'j':
            case 'Enter':
                ActiveCell.Offset(1, 0).Activate();
                break;
            case 'k':
                ActiveCell.Offset(-1, 0).Activate();
                break;
            case 'Delete':
                that.ClearContent();
                break;
            default:
                break;
        }
        event.preventDefault();
    }
    else {
        switch (event.key) {
            case 'Escape':
                ActiveCell.DisableEdit();
                break;

            case 'Enter':
                ActiveCell.DisableEdit();
                ActiveCell.Offset(1, 0).Activate();
                break;
            default:
                break;
        }
    }
})


function rectClosureByCells(start, end) {
    let elementsInside = [start, end];
    do {
        let bounds = getBoundsRectByElements(elementsInside);
        console.log(bounds);
        let elementsInsideAfterExpansion = rectangleSelect('.cell', bounds);
        if (elementsInsideAfterExpansion.length == elementsInside.length) {
            return elementsInside;
        }
        else {
            elementsInside = elementsInsideAfterExpansion;
        }
    } while (1);
}


function onInterval(point, x1, x2) {
    return (point >= x1 && point <= x2);
}

function rectangleSelect(selector, bounds) {
    let elements = [];
    $(selector).each(function () {
        let that = $(this);
        let offset = that.offset();
        let x = offset.left;
        let y = offset.top;
        if (onInterval(x + 1, bounds.minX, bounds.maxX) && onInterval(y + 1,
            bounds.minY, bounds.maxY)) {
            elements.push(that.get(0));
        }
    })
    return elements;
}

function getBoundsRectByElements(elements) {
    let x1 = elements.reduce(function (currMinX, elememt) {
        let elemLeft = $(elememt).offset().left;
        return ((currMinX != undefined) && currMinX < elemLeft) ? currMinX : elemLeft;
    }, undefined);

    let x2 = elements.reduce(function (currMaxX, elememt) {
        let elemRight = $(elememt).offset().left + $(elememt).outerWidth();
        return ((currMaxX != undefined) && currMaxX > elemRight) ? currMaxX : elemRight;
    }, undefined);

    let y1 = elements.reduce(function (currMinY, elememt) {
        let elemTop = $(elememt).offset().top;
        return ((currMinY != undefined) && currMinY < elemTop) ? currMinY : elemTop;
    }, undefined);

    let y2 = elements.reduce(function (currMaxY, elememt) {
        let elemBottom = $(elememt).offset().top + $(elememt).outerHeight();
        return ((currMaxY != undefined) && currMaxY > elemBottom) ? currMaxY : elemBottom;
    }, undefined);

    return { minX: x1, minY: y1, maxX: x2, maxY: y2 };
}


function dragSelect(event) {

}