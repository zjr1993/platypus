// const { get } = require("express/lib/request");

const SheetXL = window.SheetXL || {};
const NUMBER_OF_ROWS = 50;
const NUMBER_OF_COLUMNS = 20;
var dbClickElememt = null;
const ALPHABET = ['A', 'B', 'C', 'D', 'E',
'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
'O', 'P', 'Q', 'R','S','T','U','V','W','X','Y','Z'];

(function(sheet){
    class Cells {
        constructor (options){
            this.rows = NUMBER_OF_ROWS;
            this.columns = NUMBER_OF_COLUMNS;
            // 设置前面列举的属性
            for (let p in options){
                if (this.hasOwnProperty(p)){
                    this[p] = options[p];
                }
            }
        }
        setTableTitle(){
            for (let i=1; i<=this.columns; i++){
                let tableTitleElement = document.createElement('div');
                tableTitleElement.classList.add('cells_table_title');
                tableTitleElement.setAttribute('id', `title_${i}`);
                tableTitleElement.textContent = ALPHABET[i - 1];
                this.domElement.appendChild(tableTitleElement);
            }
        }
        setLineNumber(){
            for (let i=1; i<=this.rows; i++){
                let lineNumberElement = document.createElement('div');
                lineNumberElement.classList.add('cells_line_number');
                lineNumberElement.setAttribute('id', `line_${i}`);
                lineNumberElement.textContent = i;
                this.domElement.appendChild(lineNumberElement);
            }
        }

        setCellsStyle(){
            let cells = this.domElement;
            cells.style['grid-template-columns'] = `1fr repeat(${this.columns}, calc((100% - 50px) / ${this.columns}))`;
            cells.style['grid-template-rows'] = `repeat(${this.rows + 1}, 20px)`;
        }

        init(){
            this.domElement = document.createElement('div');
            this.domElement.setAttribute('id', 'grid_layout');
            this.domElement.classList.add('cells');

            document.getElementById('main').appendChild(this.domElement);

            let spaceHolder = document.createElement('div');
            spaceHolder.classList.add('cells_space_holder');
            this.domElement.appendChild(spaceHolder);

            this.setCellsStyle();

            this.setTableTitle();
            this.setLineNumber();
            this.data = new Array();

            for (let j = 1; j<=this.rows;j++){
                let arr = new Array();
                for (let k=1; k<=this.columns;k++){
                    let t = new cell(j, k);
                    t.init();
                    arr.push(t);
                    this.domElement.appendChild(t.domElement);
                }
                this.data.push(arr);
            }
        }
    }

    class cell {
        constructor(row, col){
            this.Merge = false;
            this.MergeArea = {
                from: {
                    row: -1,
                    col: -1
                },
                to: {
                    row: -1,
                    col: -1
                }
            }

            this.row = row;
            this.col = col;
            this.readonly = true;

            this.domElement = document.createElement('input');
            this.domElement.classList.add('cells_input');
            this.domElement.setAttribute('id', `${row}x${col}`);
            this.domElement.setAttribute('readonly', "readonly");
            let that = this;
            Object.defineProperty(that, 'value', {
                get: function () { return that.domElement.value; },
                set: function (val) { that.domElement.value = val },
                enumerable: true
            });

            this.value = "";
            this.formula = "";
            this.dependents = new Array();
            this.references = new Array();
        }
        enable_edit(){
            this.domElement.removeAttribute('readonly');
            this.readonly = false;
        }

        disable_edit(){
            this.domElement.setAttribute('readonly', "readonly");
            this.readonly = true;
        }

        toggle_edit(){
            if (this.domElement.getAttribute('readonly')){
                this.enable_edit();
            }
            else {
                this.disable_edit();
            }
        }

        clearContent(){
            this.value = "";
        }

        charSelect(start, end){
            let text = this.value;
            if (text){
                this.domElement.setSelectionRange(start, end ==-1 ? text.length: end);
            }
        }

        init(){
            this.domElement.addEventListener('mousedown',event=>{
                if (event.detail > 1){
                    event.preventDefault();
                }
            });
            let that = this;
            // this.domElement.addEventListener('compositionstart', (event) => {
            //     that.IMEActive = true;
            // });
            // this.domElement.addEventListener('compositionend', (event)=>{
            //     alert('jj')
            //     if (!that.readonly){
            //         that.value = event.data;
            //     }
            // });
            this.domElement.addEventListener('keydown', (event)=>{
                // if ()
                if (that.readonly ){
                    dbClickElememt = that;
                    that.clearContent();
                    that.enable_edit();
                    event.preventDefault();
                    that.preventKey = event.key;
                    let  keyevent = new KeyboardEvent('keydown', {
                        'key': 'Process',
                        'code': event.code,
                        'location': event.location
                    });
                    that.domElement.dispatchEvent(keyevent);
                }
                else {
                    that.preventKey = event.key;
                }
                // if (event.code == 'KeyL'){
                //     alert(true);
                // }
                // alert(event.key);

                /**
                 * 
                 * 按下 "Process" 键 [事件：keydown]
即将输入 "r" 键 [事件：beforeinput]
输入 "r" 键 [事件：input]
即将输入 "r" 键 [事件：beforeinput]
输入 "r" 键 [事件：input]
释放 "Process" 键 [事件：keyup]
                 */

                // let keycode = event.code;
                // if (keycode.includes('Key') && that.readonly){
                //     that.enable_edit();
                //     dbClickElememt = that;
                //     dispatchEvent(event);
                // }
                // else {
                //     return true;
                // }
            });

            // this.domElement.addEventListener('keyup', (event)=>{

            // })
        }
    }
    sheet.Cells = Cells;
})(SheetXL);


const Cells = new SheetXL.Cells();

Cells.init();

  
function getCellByElement(elem){
    if (/\d+x\d+/.test(elem.id)){
        let coordinate = elem.id.split('x');
        let row = coordinate[0];
        let col = coordinate[1];
        return Cells.data[row-1][col-1];
    }
    else {
        return null;
    }
}

addEventListener('click', (event)=>{
    let p = document.activeElement;
    let ActiveCell = getCellByElement(p);
    if (!ActiveCell){
        return;
    }
    // 按在一个单元格子上面
    // dbClickElememt 最新被双击过的单元并处于可编辑状态
    if (dbClickElememt && dbClickElememt != ActiveCell ){
        dbClickElememt.disable_edit();
        dbClickElememt = null;
    }
})


// addEventListener('keydown', (event)=>{
//     let p = document.activeElement;
//     let ActiveCell = getCellByElement(p);
//     if (!ActiveCell){
//         // 非单元格直接返回
//         return;
//     }
//     let keycode = event.code;
//     if (keycode.includes('Key') && ActiveCell.readonly){
//         ActiveCell.clearContent()
//         ActiveCell.enable_edit();
//         dbClickElememt = ActiveCell;
//     }
// })


addEventListener("dblclick", (event) => {
    let p = document.activeElement;
    let ActiveCell = getCellByElement(p);
    if (!ActiveCell){
        // 非单元格直接返回
        return;
    }
    else if (ActiveCell == dbClickElememt) {
        // 选中整个单元格文本
        ActiveCell.charSelect(0, -1);
        return;
    }

    if (dbClickElememt){
        dbClickElememt.disable_edit();
    }

    dbClickElememt = ActiveCell;
    ActiveCell.enable_edit();
    // let width = p.offsetWidth;
    // let offset_Click = event.offsetX;
    // let content = ActiveCell.value;
    // let len = content.length;
   //  p.setSelectionRange(0, 0, 'forward');
});

// addEventListener('onkeyup', (event)=>{
// });


