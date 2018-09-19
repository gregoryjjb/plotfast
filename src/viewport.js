
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
		
		// Pixels per axis unit
		this.xScale = 1;
		this.yScale = 1;
	}
	
	_updateCalculations = () => {
		this._minX = this.startX + this._offsetX;
		this._maxX = this.endX + this._offsetX;
		this._minY = this.startY + this._offsetY;
		this._maxY = this.endY + this._offsetY;
	}
	
	setOffset = (x, y) => {
		this._offsetX = -x * ((this.endX - this.startX) / (this.paddingLeft - this.paddingLeft + this._getPlotWidth()));
		this._offsetY = y * ((this.endY - this.startY) / this._getPlotHeight());
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

	dataToScreenX = (d) => this._dataToScreen(d, this._minX, this._maxX, this.paddingLeft, this.paddingLeft + this._getPlotWidth());
	dataToScreenY = (d) => this._dataToScreen(d, this._minY, this._maxY, this.paddingTop + this._getPlotHeight(), this.paddingTop);
	
	_screenToData = (s, dMin, dMax, sMin, sMax) => (s - sMin) * ((dMax - dMin) / (sMax - sMin)) + dMin;

	screenToDataX = (s) => this._screenToData(s, this._minX, this._maxX, this.paddingLeft, this.paddingLeft + this._getPlotWidth());
	screenToDataY = (s) => this._screenToData(s, this._minY, this._maxY, this.paddingTop + this._getPlotHeight(), this.paddingTop);

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
		
		//this.startX = centerX - halfX;
		//this.endX = centerX + halfX;
		//this.startY = centerY - halfY;
		//this.endY = centerY + halfY;
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
		
		console.log('Max', maxY)
		
		this.xScale = maxX / this.plot.canvas.width;
		this.yScale = (maxY - minY) / this.plot.canvas.height;
		this.xPos = 0;
		this.yPos = minY / this.yScale;
		
		console.log('Y', this.yPos)
	}
	
	start = () => {
		requestAnimationFrame(this.render);
	}
	
	render = () => {
		this._updateCalculations();
		
		//console.log("Min X:", this._minX)
		//console.log("Max X:", this._maxX)
		
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
			this._getPlotWidth() + 0.5,
			this._getPlotHeight() + 0.5,
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
		
		// Draw lines to points
		data.map(d => {
			//let ssd = this.dataToScreenSpace(d);
			let dx = this.dataToScreenX(d.x);
			let dy = this.dataToScreenY(d.y);
			ctx.lineTo(dx, dy);
		})
		
		ctx.stroke();
		
		// Next frame
		requestAnimationFrame(this.render);
	}
}

export default Viewport;