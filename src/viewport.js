import utils from './utils';

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
		
		this._viewMoved();
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
		if(sStartX === sEndX || sStartY === sEndY) return;
		
		let x1 = this.screenToDataX(sStartX);
		let y1 = this.screenToDataY(sStartY);
		let x2 = this.screenToDataX(sEndX);
		let y2 = this.screenToDataY(sEndY);
		
		this.startX = Math.min(x1, x2);
		this.endX = Math.max(x1, x2);

		this.startY = Math.min(y1, y2);
		this.endY = Math.max(y1, y2);

		this._viewMoved();
	}
	
	zoom = (amount, screenX, screenY) => {
		let anchorX = this.screenToDataX(screenX);
		let anchorY = this.screenToDataY(screenY);
		
		let anchorLeft = (anchorX - this.startX) * amount;
		let anchorRight = (this.endX - anchorX) * amount;
		
		let anchorBottom = (anchorY - this.startY) * amount;
		let anchorTop = (this.endY - anchorY) * amount;
		
		this.startX = anchorX - anchorLeft;
		this.endX = anchorX + anchorRight;
		
		this.startY = anchorY - anchorBottom;
		this.endY = anchorY + anchorTop;
		
		this._viewMoved();
	}

	addPan = ({ x, y }) => {
		this.xPos -= x;
		this.yPos -= y;
	}
	
	fit = () => {
		if(!Array.isArray(this.plot.data.sets)) return;
		if(!this.plot.canvas) return;
		
		const datasets = this.plot.data.sets;
		
		let minX = datasets.map(({data}) => data[0].x).reduce((a, b) => Math.min(a, b));
		let maxX = datasets.map(({ data }) => data[data.length - 1].x).reduce((a, b) => Math.max(a, b));
		let maxY = 0;
		let minY = Number.MAX_VALUE;
		
		for(let j = 0; j < datasets.length; j++) {
			let set = datasets[j].data;
			for(let i = 0; i < set.length; i++) {
				let d = set[i].y;
				if(d > maxY) maxY = d;
				if(d < minY) minY = d;
			}
		}

		this.startX = minX;
		this.endX = maxX;
		this.startY = minY;
		this.endY = maxY;
		
		this._viewMoved();
	}
	
	_viewMoved = () => {
		this.plot.events.fireEvent('viewMoved', {
			x1: this.startX,
			x2: this.endX,
			y1: this.startY,
			y2: this.endY,
		})
	}
	
	start = () => {
		requestAnimationFrame(this.render);
	}
	
	render = () => {
		this._updateCalculations();
		
		const { canvas } = this.plot;
		const datasets = this.plot.data.sets;
		
		if(!datasets || !canvas || !canvas.getContext) return;
		
		const ctx = canvas.getContext('2d');
		const zeroX = this.dataToScreenX(0);
		const zeroY = this.dataToScreenY(0);
		
		// Clear
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Axis labels (todo)
		let rangeX = this._maxX - this._minX;
		let steps = 5;
		let stepSizeRaw = Math.floor(rangeX / steps);
		let stepSize = Number(stepSizeRaw.toPrecision(1))

		let lenRange = utils.numDigits(Math.floor(rangeX));
		let lenStep = utils.numDigits(stepSize);
		let precisionStart = lenRange - lenStep + 1;
		
		let leftmostX = this.screenToDataX(this.paddingLeft);
		let roundedLeftmostX = Math.floor(leftmostX / stepSize) * stepSize;

		let mx = roundedLeftmostX;
		ctx.strokeStyle = 'grey';

		ctx.font = '14px sans-serif';
		ctx.fillText(`Start: ${mx}; Step: ${stepSize};`, 40, 54);
		
		for(let i = 0; i < steps * 2; i++) {
			let dx = mx + stepSize * i;
			let x = this.dataToScreenX(dx);
			if(x >= this.paddingLeft && x <= canvas.width - this.paddingRight) {
				ctx.beginPath();
				ctx.moveTo(x, canvas.height - this.paddingBottom);
				ctx.lineTo(x, canvas.height - 20);
				ctx.stroke();
				ctx.fillText(`${dx}`, x - 4, canvas.height - 5)
			}
		}
		
		// Dataset names
		let totalLength = this.paddingLeft;
		let spacing = 20;
		let baseline = 20;
		ctx.font = '14px sans-serif';
		
		for(let i = 0; i < datasets.length; i++) {
			let d = datasets[i];
			ctx.fillStyle = d.color;
			ctx.fillRect(totalLength, baseline - 11, 10, 10);
			totalLength += 15;
			ctx.fillText(d.name, totalLength, baseline);
			totalLength += ctx.measureText(d.name).width + spacing;
		}
		
		ctx.fillStyle = 'black';
		
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

		// Axes
		ctx.strokeStyle = 'lightgrey';
		
		//  Draw x axis
		if(this._minY < 0 && this._maxY > 0) {
			ctx.beginPath();
			ctx.moveTo(this.paddingLeft, zeroY);
			ctx.lineTo(this.paddingLeft + this._plotWidth, zeroY);
			ctx.stroke();
		}
		
		// Draw y axis
		if(this._minX < 0 && this._maxX > 0) {
			ctx.beginPath();
			ctx.moveTo(zeroX, this.paddingTop);
			ctx.lineTo(zeroX, this.paddingTop + this._plotHeight);
			ctx.stroke();
		}
		
		let t0;
		let DEBUG = true;
		
		// Draw lines to points
		/*data.filter(d => (
			d.x > this._minX &&
			d.x < this._maxX &&
			d.y > this._minY &&
			d.y < this._maxY
		)).map(d => {
			//let ssd = this.dataToScreenSpace(d);
			let dx = this.dataToScreenX(d.x);
			let dy = this.dataToScreenY(d.y);
			ctx.lineTo(dx, dy);
		})*/

		if(DEBUG) t0 = performance.now();
		let nPoints = 0;

		for(let j = 0; j < datasets.length; j++) {
			let set = datasets[j];
			let data = set.data;
			let inLine = false;

			ctx.strokeStyle = set.color || 'black';

			ctx.beginPath();

			for(let i = 0; i < data.length; i++) {
				let d = data[i];

				if(
					d.x >= this._minX &&
					d.x <= this._maxX &&
					d.y >= this._minY &&
					d.y <= this._maxY
				) {
					nPoints++;
					
					let dx = this.dataToScreenX(d.x);
					let dy = this.dataToScreenY(d.y);
					
					if(inLine) {
						ctx.lineTo(dx, dy);
					}
					else {
						ctx.moveTo(dx, dy);
						inLine = true;
					}
				}
				else {
					inLine = false;
				}
			}

			ctx.stroke();
		}

		if(DEBUG) {
			let t1 = performance.now();
			if(this._BENCH.length >= 30) {
				let avg = this._BENCH.reduce((acc, el) => acc + el) / this._BENCH.length;
				console.log(`Drawing ${nPoints} points took %c${avg.toPrecision(3)}ms`, "color: blue;");
				this._BENCH = [];
			}
			this._BENCH.push(t1 - t0);
		}
		
		// Next frame
		requestAnimationFrame(this.render);
	}
}

export default Viewport;