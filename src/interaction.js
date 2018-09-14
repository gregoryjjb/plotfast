
class Interaction {
	constructor(plot) {
		this.plot = plot;
		
		this.draggingPan = false;
		this.panDelta = { x: 0, y: 0 };
		this.panStart = { x: 0, y: 0 };
		
		this.draggingZoom = false;
		this.zoomStartX = 0;
		this.zoomStartY = 0;
		this.zoomDeltaX = 0;
		this.zoomDeltaY = 0;
		
		this.dragStart = { x: 0, y: 0 };
		
		this.plot.canvas.addEventListener('mousedown', this.handleMouseDown);
		this.plot.canvas.addEventListener('mouseup', this.handleMouseUp);
		this.plot.canvas.addEventListener('mousemove', this.handleMouseMove);
		this.plot.canvas.addEventListener('wheel', this.handleWheel);
		window.addEventListener('keydown', this.handleKeydown);
	}
	
	handleMouseDown = e => {
		e.preventDefault();
		
		let x = e.layerX;
		let y = e.layerY;
		
		this.dragStart = { x, y };
		
		// Left click
		if(e.button === 0) {
			this.draggingZoom = true;
			this.zoomStartX = x;
			this.zoomStartY = y;
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
			//this.plot.viewport.addPan(this.panDelta);
			
			this.panDelta = { x: 0, y: 0 };
		}

		if(this.draggingZoom === true) {
			this.draggingZoom = false;

			let x1 = this.zoomStartX;
			let x2 = x1 + this.zoomDeltaX;
			let y1 = this.zoomStartY;
			let y2 = y1 + this.zoomDeltaY;

			this.plot.viewport.zoomToScreenCoords(x1, y1, x2, y2);

			this.zoomStartX = 0;
			this.zoomStartY = 0;
			this.zoomDeltaX = 0;
			this.zoomDeltaY = 0;
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

		if(this.draggingZoom === true) {
			this.zoomDeltaX = x - this.zoomStartX;
			this.zoomDeltaY = y - this.zoomStartY;
		}
	}

	handleWheel = e => {
		e.preventDefault();

		console.log("Scrolled", e.deltaY);
	}

	handleKeydown = e => {
		console.log('Key pressed')
		console.log(e)

		if(e.key === 'Escape') {
			this.draggingZoom = false;
			this.zoomStartX = 0;
			this.zoomStartY = 0;
			this.zoomDeltaX = 0;
			this.zoomDeltaY = 0;
		}
	}
}

export default Interaction;