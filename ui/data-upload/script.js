// const LocalHost = 'http://127.0.0.1:3989/';


document.body.onload = initData;


function initData(){
    if (localStorage.getItem('iswhole')==0){
        document.getElementById("pOw").value = '1';
    }
    else {
        document.getElementById("pOw").value = '2';
    }

    if (localStorage.getItem('_db')){
        document.getElementById("database").value = localStorage.getItem('_db');
    }
    else {
        document.getElementById("database").value = localStorage.getItem('dft_database');
    }

    if (localStorage.getItem('_col')){
        document.getElementById("collection").value = localStorage.getItem('_col');
    }
    else {
        document.getElementById("collection").value = localStorage.getItem('dft_collection');
    }
}


function optDB() {
    let select = document.getElementById("pOw");

    if (select.value == '1') {
        // 当前工作表
        localStorage.setItem('iswhole', 0);
    }
    else {
        // 整个工作簿
        localStorage.setItem('iswhole', 1);
    }

    localStorage.setItem('_db', document.getElementById("database").value);
    localStorage.setItem('_col', document.getElementById("collection").value);
    window.close();
}