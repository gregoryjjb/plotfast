
class Interaction {
	constructor(plot) {
		this.plot = plot;
		
		// Key status
		this.shiftDown = false;
		this.ctrlDown = false;
		
		// Wheel zoom
		this.zoomMultiplier = 0.75;
		
		// Box zoom
		this.draggingZoom = false;
		this.zoomStartX = 0;
		this.zoomStartY = 0;
		this.zoomDeltaX = 0;
		this.zoomDeltaY = 0;
		
		// Pan
		this.draggingPan = false;
		this.panStartX = 0;
		this.panStartY = 0;
		this.panDeltaX = 0;
		this.panDeltaY = 0;
		
		// Event listeners
		this.plot.canvas.addEventListener('mousedown', this.handleMouseDown);
		window.addEventListener('mouseup', this.handleMouseUp);
		this.plot.canvas.addEventListener('mousemove', this.handleMouseMove);
		this.plot.canvas.addEventListener('wheel', this.handleWheel);
		window.addEventListener('keydown', this.handleKeydown);
		window.addEventListener('keyup', this.handleKeyup);
	}
	
	startBoxZoom = (x, y) => {
		this.draggingZoom = true;
		this.zoomStartX = x;
		this.zoomStartY = y;
	}
	
	updateBoxZoom = (x, y) => {
		this.zoomDeltaX = x - this.zoomStartX;
		this.zoomDeltaY = y - this.zoomStartY;
	}
	
	finishBoxZoom = (x, y) => {
		if(!this.draggingZoom) return;
		
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
	
	cancelBoxZoom = (x, y) => {
		this.draggingZoom = false;
		this.zoomStartX = 0;
		this.zoomStartY = 0;
		this.zoomDeltaX = 0;
		this.zoomDeltaY = 0;
	}
	
	startPan = (x, y) => {
		this.draggingPan = true;
		this.panStartX = x;
		this.panStartY = y;
	}
	
	updatePan = (x, y) => {
		this.panDeltaX = x - this.panStartX;
		this.panDeltaY = y - this.panStartY;
		
		this.plot.viewport.setOffset(this.panDeltaX, this.panDeltaY);
	}
	
	finishPan = () => {
		this.draggingPan = false;
			
		this.plot.viewport.applyOffset();
		
		this.panStartX = 0;
		this.panStartY = 0;
		this.panDeltaX = 0;
		this.panDeltaY = 0;
	}
	
	cancelPan = () => {
		this.draggingPan = false;
		
		this.plot.viewport.setOffset(0, 0);
		
		this.panStartX = 0;
		this.panStartY = 0;
		this.panDeltaX = 0;
		this.panDeltaY = 0;
	}
	
	handleMouseDown = e => {
		e.preventDefault();
		
		let x = e.layerX;
		let y = e.layerY;
		
		// Left click with control
		if(e.button === 0 && this.ctrlDown) {
			this.startBoxZoom(x, y);
		}
		
		// Left click with shift
		else if(e.button === 0 && this.shiftDown) {
			this.startPan(x, y);
		}
		
		// Middle click
		else if(e.button === 1) {
			this.startPan(x, y);
		}
	}
	
	handleMouseUp = e => {
		let x = e.layerX;
		let y = e.layerY;
		
		if(this.draggingPan === true) {
			this.finishPan();
		}

		if(this.draggingZoom === true) {
			this.finishBoxZoom(x, y);
		}
	}
	
	handleMouseMove = e => {
		const x = e.layerX;
		const y = e.layerY;
		
		if(this.draggingPan === true) {
			this.updatePan(x, y);
		}

		if(this.draggingZoom === true) {
			this.updateBoxZoom(x, y);
		}
	}

	handleWheel = e => {
		e.preventDefault();
		
		// Zoom in
		if(e.deltaY < 0) {
			this.plot.viewport.zoom(this.zoomMultiplier, e.layerX, e.layerY);
		}
		
		// Zoom out
		else {
			this.plot.viewport.zoom(1 / this.zoomMultiplier, e.layerX, e.layerY);
		}
	}

	handleKeydown = e => {
		console.log('Key pressed')
		console.log(e)
		
		const k = e.key;

		if(k === 'Escape') {
			this.cancelBoxZoom();
			this.cancelPan();
		}
		else if(k === 'Shift') {
			this.shiftDown = true;
		}
		else if(k === 'Control') {
			this.ctrlDown = true;
		}
		else if(k === 'f') {
			this.plot.viewport.fit();
		}
	}
	
	handleKeyup = e => {
		const k = e.key;
		
		if(k === 'Shift') {
			this.shiftDown = false;
		}
		else if(k === 'Control') {
			this.ctrlDown = false;
		}
	}
}

export default Interaction;