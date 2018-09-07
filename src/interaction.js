
class Interaction {
	constructor(plot) {
		this.plot = plot;
		
		this.draggingPan = false;
		this.panDelta = { x: 0, y: 0 };
		this.panStart = { x: 0, y: 0 };
		
		this.draggingZoom = false;
		
		this.dragStart = { x: 0, y: 0 };
		
		this.plot.canvas.addEventListener('mousedown', this.handleMouseDown);
		this.plot.canvas.addEventListener('mouseup', this.handleMouseUp);
		this.plot.canvas.addEventListener('mousemove', this.handleMouseMove);
		this.plot.canvas.addEventListener('wheel', this.handleWheel);
	}
	
	handleMouseDown = e => {
		e.preventDefault();
		
		let x = e.layerX;
		let y = e.layerY;
		
		this.dragStart = { x, y };
		
		// Left click
		if(e.button === 0) {
			
		}
		
		// Middle click
		else if(e.button === 1) {
			this.draggingPan = true;
			this.panStart = { x, y };
		}
	}
	
	handleMouseUp = e => {
		let x = e.layerX;
		let y = e.layerY;
		
		if(this.draggingPan === true) {
			this.draggingPan = false;
			
			console.log(this.panDelta);
			this.plot.viewport.addPan(this.panDelta);
			
			this.panDelta = { x: 0, y: 0 };
		}
	}
	
	handleMouseMove = e => {
		const x = e.layerX;
		const y = e.layerY;
		
		if(this.draggingPan === true) {
			this.panDelta = {
				x: x - this.panStart.x,
				y: y - this.panStart.y,
			};
		}
	}

	handleWheel = e => {
		e.preventDefault();

		console.log("Scrolled", e.deltaY);
	}
}

export default Interaction;