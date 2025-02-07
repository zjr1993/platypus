$('.message a').click(function () {
    $('form').animate({ height: "toggle", opacity: "toggle" }, "fast");
});

// 自动填充表单
if (localStorage.getItem('username')) {
    document.getElementById("name").value = localStorage.getItem("username");
}
if (localStorage.getItem("password")) {
    document.getElementById("psword").value = localStorage.getItem("password");
}

async function register(){
    // some register code
    let password = document.getElementById("psword_new").value;

    let username = document.getElementById("name_new").value;

    let database = document.getElementById("storage").value;

    if (!database) {
        database = defaultDataBase;
    }

    let isRegister = await Register(username,password, database);


    // alert(isRegister.data);

    if (isRegister.status==200){
        alert(`${username} register successfully! and id is ${isRegister.data}`);
    }
    else if (isRegister.status==0) {
        alert('网络故障');
    }
    else if (isRegister.status==303){
        alert(isRegister.data);
    }
    else {
        alert('注册失败');
    }
}

async function connect(){
    let password = document.getElementById("psword").value;
    let username = document.getElementById("name").value;
    let isConnect = await Login(username, password);

    if (isConnect.status==200){
        alert(isConnect.data);
    }
    else if (isConnect.status==404){
        alert(isConnect.data);
    }
    else if (isConnect.status==0) {
        alert('网络故障');
    }
    else {
        alert('数据库服务错误❌');
    }
}