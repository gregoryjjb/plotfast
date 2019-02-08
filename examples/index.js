import Plotfast from '../src/Plotfast';

// Credit to Anatoliy on Stackoverflow
// https://stackoverflow.com/a/1484514
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var container = document.getElementById("container");
var plot = new Plotfast(container, { logging: true, width: 640, height: 480, downsample: true });
var data = plot.generateData(1000000);
plot.addDataset(data,  { color: getRandomColor(), type: 'point' });
plot.start();

document.querySelector("#generate").addEventListener("click", function(e) {
    plot.addDataset(plot.generateData(1000000), { color: getRandomColor() })
    plot.fitViewToData();
});

document.querySelector("#clear").addEventListener("click", function(e) {
    plot.removeDataset();
});

plot.addEventListener('viewMoved', e => {
    //console.log(e.x1, e.x2, e.y1, e.y2);
    //let visible = e.x2 - e.x1;
    //let total = data[data.length - 1].x - data[0].x;
    //let dec = Math.ceil(total / visible * 540);
    //console.log("Decimate to", dec)
    //let newData = down(data, e.x1, e.x2, dec);
    //plot.updateDataset(0, newData);
})

window.plot = plot;
