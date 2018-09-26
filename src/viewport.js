
class Viewport {
	constructor(plot) {
		this.plot = plot;
		
		this.xPos = 0;
		this.yPos = -100;

		this.startX = 0;
		this.endX = 20;
		this.startY = 0;
		this.endY = 20;
		
		this._offsetX = 0;
		this._offsetY = 0;
		
		// Don't set these directly
		this._minX = 0;
		this._maxX = 0;
		this._minY = 0;
		this._maxY = 0;

		this.paddingLeft = 30;
		this.paddingRight = 30;

		this.paddingTop = 30;
		this.paddingBottom = 30;
		
		// DEFNINTELY don't set these directly
		this._scaleX = 0;
		this._scaelY = 0;
		this._plotWidth = 0;
		this._plotHeight = 0;
		
		this._BENCH = [];

		window.FIT = this.fit;
	}
	
	_updateCalculations = () => {
		this._minX = this.startX + this._offsetX;
		this._maxX = this.endX + this._offsetX;
		this._minY = this.startY + this._offsetY;
		this._maxY = this.endY + this._offsetY;

		this._plotWidth = this.plot.canvas.width - this.paddingLeft - this.paddingRight;
		this._plotHeight = this.plot.canvas.height - this.paddingTop - this.paddingBottom;
		
		this._scaleX = (this.endX - this.startX) / this._plotWidth;
		this._scaleY = (this.endY - this.startY) / this._plotHeight;
	}
	
	setOffset = (x, y) => {
		this._offsetX = -x * ((this.endX - this.startX) / (this.paddingLeft - this.paddingLeft + this._plotWidth));
		this._offsetY = y * ((this.endY - this.startY) / this._plotHeight);
	}
	
	applyOffset = () => {
		this.startX += this._offsetX;
		this.endX += this._offsetX;
		this.startY += this._offsetY;
		this.endY += this._offsetY;
		
		this._offsetX = 0;
		this._offsetY = 0;
	}

	_getPlotWidth = () => this.plot.canvas.width - this.paddingLeft - this.paddingRight;
	_getPlotHeight = () => this.plot.canvas.height - this.paddingTop - this.paddingBottom;

	_dataToScreen = (d, dMin, dMax, sMin, sMax) => (d - dMin) * ((sMax - sMin) / (dMax - dMin)) + sMin;
	_screenToData = (s, dMin, dMax, sMin, sMax) => (s - sMin) * ((dMax - dMin) / (sMax - sMin)) + dMin;

	dataToScreenX = (d) => (d - this._minX) / this._scaleX + this.paddingLeft;
	dataToScreenY = (d) => (d - this._minY) / this._scaleY * -1 + this.paddingTop + this._plotHeight;
	screenToDataX = (s) => (s - this.paddingLeft) * this._scaleX + this._minX; 
	screenToDataY = (s) => (this.paddingTop + this._plotHeight - s) * this._scaleY + this._minY;
	
	// Old (slower?) way
	// Yep it's about 8% slower
	//dataToScreenX = (d) => this._dataToScreen(d, this._minX, this._maxX, this.paddingLeft, this.paddingLeft + this._plotWidth);
	//dataToScreenY = (d) => this._dataToScreen(d, this._minY, this._maxY, this.paddingTop + this._plotHeight, this.paddingTop);
	//screenToDataX = (s) => this._screenToData(s, this._minX, this._maxX, this.paddingLeft, this.paddingLeft + this._plotWidth);
	//screenToDataY = (s) => this._screenToData(s, this._minY, this._maxY, this.paddingTop + this._plotHeight, this.paddingTop);
	
	zoomToScreenCoords = (sStartX, sStartY, sEndX, sEndY) => {
		let x1 = this.screenToDataX(sStartX);
		let y1 = this.screenToDataY(sStartY);
		let x2 = this.screenToDataX(sEndX);
		let y2 = this.screenToDataY(sEndY);
		
		console.log("X1 is", x1);

		this.startX = Math.min(x1, x2);
		this.endX = Math.max(x1, x2);

		this.startY = Math.min(y1, y2);
		this.endY = Math.max(y1, y2);

		console.log(`New positions x1: ${this.startX}, y1: ${this.startY}, x2: ${this.endX}, y2: ${this.endY}`);
	}
	
	zoom = (amount, screenX, screenY) => {
		
		let anchorX = this.screenToDataX(screenX);
		let anchorY = this.screenToDataY(screenY);
		
		let anchorLeft = (anchorX - this.startX) * amount;
		let anchorRight = (this.endX - anchorX) * amount;
		
		let anchorBottom = (anchorY - this.startY) * amount;
		let anchorTop = (this.endY - anchorY) * amount;
		
		// pmin2 = p - (pmax - pmin) / 4, pmax2 = p + (pmax - pmin) / 4
		let halfX = (this.endX - this.startX) * amount;
		let halfY = (this.endY - this.startY) * amount;
		
		this.startX = anchorX - anchorLeft;
		this.endX = anchorX + anchorRight;
		
		this.startY = anchorY - anchorBottom;
		this.endY = anchorY + anchorTop;
	}

	addPan = ({ x, y }) => {
		this.xPos -= x;
		this.yPos -= y;
	}
	
	fit = () => {
		if(!Array.isArray(this.plot.data)) return;
		if(!this.plot.canvas) return;
		
		const { data } = this.plot;
		
		let maxX = this.plot.data.length;
		let maxY = 0;
		let minY = Number.MAX_VALUE;
		
		for(let i = 0; i < data.length; i++) {
			let d = data[i].y;
			if(d > maxY) maxY = d;
			if(d < minY) minY = d;
		}

		this.startX = 0;
		this.endX = maxX;
		this.startY = minY;
		this.endY = maxY;
	}
	
	start = () => {
		requestAnimationFrame(this.render);
	}
	
	render = () => {
		this._updateCalculations();
		
		const { data, canvas } = this.plot;
		
		if(!data || !canvas || !canvas.getContext) return;
		
		const ctx = canvas.getContext('2d');
		const zeroX = this.dataToScreenX(0);
		const zeroY = this.dataToScreenY(0);
		
		// Clear
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Draw bounds around graph area (temporary?)
		ctx.strokeStyle = 'lightgrey';
		ctx.lineWidth = "1";
		ctx.setLineDash([]);
		ctx.strokeRect(
			this.paddingLeft - 0.5,
			this.paddingTop - 0.5,
			this._plotWidth + 0.5,
			this._plotHeight + 0.5,
		);

		// Draw zoom box (if dragging zoom)
		if(this.plot.interaction.draggingZoom === true) {
			
			let i = this.plot.interaction;

			ctx.setLineDash([5, 10]);
			ctx.strokeRect(
				i.zoomStartX,
				i.zoomStartY,
				i.zoomDeltaX,
				i.zoomDeltaY,
			);
			ctx.setLineDash([]);
		}

		let x1 = this.dataToScreenX(0.5);
		let y1 = this.dataToScreenY(0.5);

		let x2 = this.dataToScreenX(10);
		let y2 = this.dataToScreenY(10);

		ctx.fillStyle = 'red';
		ctx.fillRect(x1, y1, 2, 2);

		ctx.fillStyle = 'blue';
		ctx.fillRect(x2, y2, 2, 2);

		ctx.strokeStyle = 'lightgrey';
		
		//  Draw x axis
		ctx.beginPath();
		ctx.moveTo(0, zeroY);
		ctx.lineTo(canvas.width, zeroY);
		ctx.stroke();
		
		// Draw y axis
		ctx.beginPath();
		ctx.moveTo(zeroX, 0);
		ctx.lineTo(zeroX, canvas.height);
		ctx.stroke();
		
		ctx.strokeStyle = 'black';
		
		// Start line graph
		ctx.beginPath();
		ctx.moveTo(zeroX, zeroY);
		
		//let t0 = performance.now();
		
		// Draw lines to points
		data.map(d => {
			//let ssd = this.dataToScreenSpace(d);
			let dx = this.dataToScreenX(d.x);
			let dy = this.dataToScreenY(d.y);
			ctx.lineTo(dx, dy);
		})
		
		//let t1 = performance.now();
		
		//if(this._BENCH.length >= 30) {
		//	let avg = this._BENCH.reduce((acc, el) => acc + el) / this._BENCH.length;
		//	console.log("Average is", avg);
		//	this._BENCH = [];
		//}
		//this._BENCH.push(t1 - t0);
		
		ctx.stroke();
		
		// Next frame
		requestAnimationFrame(this.render);
	}
}

export default Viewport;