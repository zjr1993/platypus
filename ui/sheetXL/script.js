document.getElementById('fx').addEventListener('mousedown', (event=>{
    // event.preventDefault();
    event.target.value = 300;
}));

document.getElementById('fx').addEventListener('dblclick', (event=>{
    // 
    if (event.target.getAttribute('readonly')){
        event.preventDefault();
        // event.target.removeAttribute('readonly');
        
    }
    // alert('dbclick');
}));

document.getElementById('main').addEventListener('dblclick', (event=>{
    // event.preventDefault();
   // alert('dbclick main');
}));