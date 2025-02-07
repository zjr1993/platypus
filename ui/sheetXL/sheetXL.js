const Sheet = window.Sheet || {};
const NUMBER_OF_ROWS = 50;
const NUMBER_OF_COLUMNS = 20;
var ActiveCell = null;
var Cells = {};
const ALPHABET = ['A', 'B', 'C', 'D', 'E',
    'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

(function (_sheet) {
    // 单元格类
    // 接口参考 wpsjs
    class _cell {
        constructor(row, col) {
            this.MergeCell = false;
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

            // 设置单元格值
            Object.defineProperty(that, 'Text', {
                get: function () { return that.domElement.value; },
                set: function (val) { that.domElement.value = val },
                enumerable: true
            });

            // 设置单元格宽度
            Object.defineProperty(that, 'width', {
                get: function () { return that.domElement.offsetWidth },
                set: function (val) { that.domElement.style['width'] = val },
                enumerable: true
            });

            // 设置单元格高度
            Object.defineProperty(that, 'height', {
                get: function () { return that.domElement.offsetHeight },
                set: function (val) { that.domElement.style['height'] = val },
                enumerable: true
            });

            this.Formula = null;
            this.Value = null;
            this.Text = null;

            this.Dependents = new Array();
            this.References = new Array();
        }

        allowEdit() {
            this.domElement.removeAttribute('readonly');
            this.readonly = false;
        }

        disallowEdit() {
            this.domElement.setAttribute('readonly', 'readonly');
            this.readonly = true;
        }

        toggleEdit() {
            if (this.domElement.getAttribute('readonly')) {
                this.allowEdit();
            }
            else {
                this.disallowEdit();
            }
        }

        clearContent() {
            this.Text = null;
            this.Value = null;
            this.Formula = null;
        }

        Activate() {
            ActiveCell.domElement.blur();
            this.domElement.focus();
            ActiveCell = this;
        }

        characterSelect(start, end) {
            let text = this.Text;
            if (text) {
                this.domElement.setSelectionRange(start, end == -1 ? text.length : end);
            }
        }

        offset(n, m) {
            let cell = Cells.data[(this.Row + n - 1) % (Cells.Row)][(this.Column + m - 1) % (Cells.Column)];
            return cell;
        }

        init() {
            this.domElement.addEventListener('mousedown', (event) => {
                if (event.detail > 1) {
                    event.preventDefault();
                }
                else {
                    if (this.domElement.getAttribute('readonly')) {
                        let cell = Cells.getCellByDomElement(event.target);
                        if (ActiveCell != cell){
                            // there is a exception in here TODO
                            ActiveCell.disallowEdit();
                            cell.Activate();
                        }
                        Cells.Selection.removeClass('selected');
                        Cells.dragging = true;
                    }
                }
            });
            this.domElement.addEventListener('mouseenter', (event)=>{
                if (!Cells.dragging){ return ; }
                Cells.Selection.removeClass('selected');
                if ( ActiveCell != this ){
                    Cells.Range(ActiveCell, Cells.getCellByDomElement(event.target)).Select();
                    Cells.Selection.removeClass('selected');
                }
            })

            this.domElement.addEventListener('mouseup', (event=>{
                Cells.dragging = false;
            }))
        }
    }
})