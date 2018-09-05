
class Interaction {
	constructor(plot) {
		this.plot = plot;
		
		this.dragging = false;
		this.dragStart = 0;
		this.dragDelta = 0;
		
		this.plot.canvas.addEventListener('mousedown', this.handleMouseDown);
		this.plot.canvas.addEventListener('mouseup', this.handleMouseUp);
		this.plot.canvas.addEventListener('mousemove', this.handleMouseMove);
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