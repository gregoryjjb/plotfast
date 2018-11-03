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

		this.paddingLeft = 70;
		this.paddingRight = 30;

		this.paddingTop = 30;
		this.paddingBottom = 50;
		
		// DEFNINTELY don't set these directly
		this._scaleX = 0;
		this._scaelY = 0;
		this._plotWidth = 0;
		this._plotHeight = 0;
		
		this.plotWidth = 0;
		
		this.selectedX = null;
		this.selectedY = null;
		
		this._BENCH = [];
	}
	
	getPlotWidth = () => this.plot.canvas.width - this.paddingLeft - this.paddingRight;
	
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
		
		this._viewMoved('zoom');
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
	
	_viewMoved = (type) => {
		this.plot.events.fireEvent('viewMoved', {
			type: type,
			x1: this.startX,
			x2: this.endX,
			y1: this.startY,
			y2: this.endY,
		})
	}
	
	start = () => {
		requestAnimationFrame(this.render);
	}
	
	_clearRect = (ctx, x, y, w, h) => {
		let bg = this.plot.options.backgroundColor;
		if(!bg || bg === 'none') {
			ctx.clearRect(x, y, w, h);
		}
		else {
			ctx.fillStyle = this.plot.options.backgroundColor;
			ctx.fillRect(x, y, w, h);
		}
	}
	
	distance = (p1, p2) => {
		let dx = Math.abs(p1.x - p2.x);
		let dy = Math.abs(p1.y - p2.y);
		return Math.sqrt(dx*dx + dy*dy);
	}
	
	findUnderMouse = (msx, msy) => {
		if(
			msx === null ||
			msx < this.paddingLeft ||
			msx > this.plot.canvas.width - this.paddingRight ||
			msy < this.paddingTop ||
			msy > this.plot.canvas.height - this.paddingBottom
		) {
			this.selectedX = null;
			this.selectedY = null;
			return;
		}
		
		const { data } = this.plot;
		const { sets } = data;
		
		const range = 10;
		
		let scanStartScreen = msx - range;
		let scanEndScreen = msx + range;
		
		let scanStartData = this.screenToDataX(scanStartScreen);
		let scanEndData = this.screenToDataX(scanEndScreen);
		
		let mouseScreenPoint = { x: msx, y: msy };
		
		let nearestPoint = null;
		let smallestDistance = Number.MAX_VALUE;
		
		sets.forEach(set => {
			let startIndex = data._binarySearch(set.downsampledData, scanStartData);
			let endIndex = data._binarySearch(set.downsampledData, scanEndData);
			
			for(let i = startIndex; i <= endIndex; i++) {
				let p = set.downsampledData[i];
				let ps = {
					x: this.dataToScreenX(p.x),
					y: this.dataToScreenY(p.y),
				};
				let dist = this.distance(ps, mouseScreenPoint);
				if(!nearestPoint || dist < smallestDistance) {
					nearestPoint = p;
					smallestDistance = dist;
				}
			}	
		})
		
		let pointScreenX = this.dataToScreenX(nearestPoint.x);
		let pointScreenY = this.dataToScreenY(nearestPoint.y);
		
		let deltaX = Math.abs(pointScreenX - msx);
		let deltaY = Math.abs(pointScreenY - msy);
		
		if(deltaX < range && deltaY < range) {
			this.selectedX = nearestPoint.x;
			this.selectedY = nearestPoint.y;
		}
		else {
			this.selectedX = null;
			this.selectedY = null;
		}
	}
	
	render = () => {
		this._updateCalculations();
		
		const { canvas, options } = this.plot;
		const datasets = this.plot.data.sets;
		
		if(!datasets || !canvas || !canvas.getContext) return;
		
		const ctx = canvas.getContext('2d');
		const zeroX = this.dataToScreenX(0);
		const zeroY = this.dataToScreenY(0);
		
		// Clear
		this._clearRect(ctx, 0, 0, canvas.width, canvas.height);
		
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
		
		let t0;
		let DEBUG = options.logging;
		if(DEBUG) t0 = performance.now();
		let nPoints = 0;

		for(let j = 0; j < datasets.length; j++) {
			let set = datasets[j];
			let data = set.downsampledData;
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
					// We are in the visible area, draw the point
					nPoints++;
					
					let dx = this.dataToScreenX(d.x);
					let dy = this.dataToScreenY(d.y);
					
					// If in line already, continue it
					if(inLine) {
						ctx.lineTo(dx, dy);
					}
					// Otherwise we may have to start a new segment
					else {
						let prev = data[i - 1];
						
						if(prev) {
							// Connecting line to the previous off-screen point
							let px = this.dataToScreenX(prev.x);
							let py = this.dataToScreenY(prev.y);
							ctx.moveTo(px, py);
							ctx.lineTo(dx, dy);
						}
						else {
							// New standalone point with no previous
							ctx.moveTo(dx, dy);
						}
						
						inLine = true;
					}
				}
				else {
					if(inLine) {
						// We just went off the edge of the screen, draw this last point
						let dx = this.dataToScreenX(d.x);
						let dy = this.dataToScreenY(d.y);
						
						ctx.lineTo(dx, dy);
					}
					
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
		
		// Clear out margins in case of data hanging off the edge
		this._clearRect(ctx, 0, 0, canvas.width, this.paddingTop);
		this._clearRect(ctx, 0, 0, this.paddingLeft, canvas.height);
		this._clearRect(ctx, 0, canvas.height, canvas.width, -this.paddingBottom);
		this._clearRect(ctx, canvas.width, 0, -this.paddingRight, canvas.height);
		
		// Axis labels (todo)
		let rangeX = this._maxX - this._minX;
		let rangeY = this._maxY - this._minY;
		let steps = 5;
		let stepSizeX = Number(Math.floor(rangeX / steps).toPrecision(1))
		let stepSizeY = Number(Math.floor(rangeY / steps).toPrecision(1))
		//let stepSizeRaw = Math.floor(rangeX / steps);
		//let stepSize = Number(stepSizeRaw.toPrecision(1))
		
		let leftmostX = this.screenToDataX(this.paddingLeft);
		let roundedLeftmostX = Math.floor(leftmostX / stepSizeX) * stepSizeX;
		
		let bottommostY = this.screenToDataY(canvas.height - this.paddingBottom);
		let roundedBottommostY = Math.floor(bottommostY / stepSizeY) * stepSizeY;

		let mx = roundedLeftmostX;
		let my = roundedBottommostY;
		
		ctx.strokeStyle = options.lineColor || 'lightgrey';
		ctx.fillStyle = options.textColor || 'black';

		ctx.textAlign = 'left';
		ctx.font = '14px sans-serif';
		ctx.fillText(
			`Start: ${my}; Step: ${stepSizeY};`,
			this.paddingLeft + 10,
			this.paddingTop + 24
		);
		
		for(let i = 0; i < steps * 2; i++) {
			let dx = mx + stepSizeX * i;
			let x = this.dataToScreenX(dx);
			let yTop = canvas.height - this.paddingBottom;
			if(x >= this.paddingLeft && x <= canvas.width - this.paddingRight) {
				ctx.beginPath();
				ctx.moveTo(x, yTop);
				ctx.lineTo(x, yTop + 10);
				ctx.stroke();
				ctx.fillText(`${dx}`, x - 4, yTop + 24)
			}
		}
		
		for(let i = 0; i < steps * 2; i++) {
			let dy = my + stepSizeY * i;
			let y = this.dataToScreenY(dy);
			if(y >= this.paddingTop && y <= canvas.height - this.paddingBottom) {
				ctx.beginPath();
				ctx.moveTo(this.paddingLeft, y);
				ctx.lineTo(this.paddingLeft - 10, y);
				ctx.stroke();
				ctx.textAlign = 'right';
				ctx.fillText(`${dy}`, this.paddingLeft - 15, y + 7);
			}
		}
		
		// Axis names
		// X
		ctx.textAlign = 'center';
		ctx.fillText(options.xLabel, canvas.width / 2, canvas.height - 5);
		// Y
		ctx.save();
		ctx.translate(19, canvas.height / 2);
		ctx.rotate(-Math.PI/2);
		ctx.fillText(options.yLabel, 0, 0);
		ctx.restore();
		
		// Dataset names
		let totalLength = this.paddingLeft;
		let spacing = 20;
		let baseline = 20;
		ctx.font = '14px sans-serif';
		ctx.textAlign = 'left';
		
		for(let i = 0; i < datasets.length; i++) {
			let d = datasets[i];
			ctx.fillStyle = d.color;
			ctx.fillRect(totalLength, baseline - 11, 10, 10);
			totalLength += 15;
			ctx.fillText(d.name, totalLength, baseline);
			totalLength += ctx.measureText(d.name).width + spacing;
		}
		
		ctx.fillStyle = options.textColor || 'black';
		
		// Draw bounds around graph area (temporary?)
		ctx.strokeStyle = options.lineColor || 'lightgrey';
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
		ctx.strokeStyle = options.lineColor || 'lightgrey';
		
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
		
		if(this.selectedX !== null && this.selectedY !== null) {
			let x = this.dataToScreenX(this.selectedX);
			let y = this.dataToScreenY(this.selectedY);
			
			//ctx.strokeStyle = 'red';
			//ctx.beginPath();
			//ctx.moveTo(x, yUp);
			//ctx.lineTo(x, yDown);
			//ctx.stroke();
			ctx.fillStyle = 'lightgrey';
			ctx.strokeStyle = 'black';
			ctx.beginPath();
			ctx.arc(x, y, 3, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			
			ctx.save();
			
			ctx.fillStyle = '#FFF';
			ctx.shadowBlur = 4;
			ctx.shadowColor = '#777';
			ctx.shadowOffsetY = 2;
			
			let string1 = `x: ${this.selectedX}`;
			let string2 = `y: ${this.selectedY}`;
			
			let padding = 10;
			let maxTextWidth = 250;
			let maxWidth = maxTextWidth + padding * 2;
			
			let w1 = ctx.measureText(string1).width;
			let w2 = ctx.measureText(string2).width;
			let w = Math.min(Math.max(w1, w2) + padding * 2, maxWidth);
			let h = (14 * 2) + padding * 2 + 10;
			let cornerX = x + (x < maxWidth ? 10 : -w - 10);
			let cornerY = Math.max(y - h - 10, 10);
			
			ctx.fillRect(cornerX, cornerY, w, h);
			ctx.restore();
			
			ctx.fillStyle = 'black';
			ctx.fillText(string1, cornerX + padding, cornerY + 14 + padding, maxWidth);
			ctx.fillText(string2, cornerX + padding, cornerY + h - padding, maxWidth);
		}
		
		// Next frame
		requestAnimationFrame(this.render);
	}
}

export default Viewport;