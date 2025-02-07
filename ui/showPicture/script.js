const LocalHost = 'http://127.0.0.1:3989/';
// const LocalHost = 'http://192.168.1.86:3989/';
var chartDom = document.getElementById('main');
var myChart = echarts.init(chartDom, null, {
    renderer: 'svg'
});
var option;

function getData() {
    let database = 'CqDemo';
    let collection = localStorage.getItem("ProjectCol");
    if (! collection){
        collection= 'ProjListNew';
    }
    let row = wps.ActiveCell.Row;
    let subItem = wps.Range(`A${row}`).Text;
    let filters = {
        subItemIndex: subItem
    }
    fetch(LocalHost + 'filters' + `?database=${database}&collection=${collection}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filters: filters })
    }).then((res) => {
        let status = res.status;
        if (status != 200) {
            alert("some error happen!");
            return Promise.reject();
        }
        else {
            return res.json();
        }
    }).then((v) => {
        let v1 = v[0];
        let data = new Array();
        let lengendArr = new Array();
        let title =subItem + " " + v1.subItemName;
        if (v1.checkNumber) {
            for (let v2 of v1.component) {
                if (v2.number == 0) {
                    continue;
                }
                else {
                    data.push({ value: v2.number.toFixed(2), name: v2.bridge + v2.project });
                    // lengendArr.push({ name: v2.bridge + v2.project, icon: 'roundRect' });
                }
            }
            option = {
                title: {
                    text: title
                  },
                tooltip: {
                    trigger: 'item'
                },
                // legend: {
                //     top: 'bottom',
                //     itemHeight: 5,
                //     data: lengendArr,
                // },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { show: true, readOnly: false },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                series: [
                    {
                        name: '组分情况',
                        type: 'pie',
                        radius: [50, 220],
                        minAngle: 10,
                        center: ['50%', '50%'],
                        // roseType: 'radius',
                        roseType: 'radius',
                        data: data
                    }
                ]
            };

            option && myChart.setOption(option);
        }
        else {
            alert('没有组分数据!');
        }

    });
}

getData();


