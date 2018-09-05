import canvas from './canvas';
import viewport from './viewport';

class Plotfast {
	constructor(containerEl, opts = {}) {
		console.log("Creating new plot");
		
		const plot = {};
		
		plot.canvas = canvas(containerEl, opts.width, opts.height);
		plot.viewport = viewport(plot);
		
		plot.data = [{x: 1, y: 1}, {x: 2, y: 0}, {x: 3, y: 2}];
		
		plot.viewport.render();
	}
	
	generateData(amount = 500) {
		let data = [{x: 0, y: 0}];
		for(let i = 1; i < amount; i++) {
			data.push({
				x: i,
				y: Math.round((Math.random() - 0.5) * 10 + data[i - 1].y),
			});
		}
		
		this.data = data;
	}
	
	render() {
		let ctx = this.canvas.getContext('2d');
		let { width, height } = this.canvas;
		
		ctx.clearRect(0, 0, width, height);
		
		let o = this.offset + this.dragDelta;
		let scale = width / this.data.length;
		
		this.data.map(d => {
			ctx.strokeRect(
				d.x * scale + o,
				height / 2,
				1,
				-1 * d.y,
			)
		})
	}
	
	handleClick = e => {
		this.generateData();
		this.render();
	}
	
	handleMouseDown = e => {
		let x = e.layerX;
		let y = e.layerY;
		
		this.dragging = true;
		this.dragStart = x;
	}
	
	handleMouseUp = e => {
		let x = e.layerX;
		let y = e.layerY;
		
		this.offset += this.dragDelta;
		this.dragging = false;
		this.dragStart = 0;
		this.dragDelta = 0;
		
		console.log('New offset:', this.offset);
	}
	
	handleMouseMove = e => {
		if(this.dragging) {
			this.dragDelta = e.layerX - this.dragStart;
			console.log('Delta:', this.dragDelta);
		}
		
		this.render();
	}
}

export default Plotfast;