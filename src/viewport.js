
class Viewport {
	constructor(plot) {
		this.plot = plot;
		
		this.xPos = 0;
		this.yPos = -100;
		
		// Pixels per axis unit
		this.xScale = 1;
		this.yScale = 1;
	}
	
	pixelsToAxis = (x, y) => {
		
	}
	
	axisToPixels = (x, y) => {
		
	}
	
	_getPosition = () => {
		return {
			x: this.xPos - this.plot.interaction.panDelta.x,
			y: this.yPos - this.plot.interaction.panDelta.y,
		}
	}
	
	screenToDataSpace = ({ x, y }) => {
		const pos = this._getPosition();
		
		return {
			x: (x + pos.x) * this.xScale,
			y: (y + pos.y) * this.yScale,
		}
	}
	
	dataToScreenSpace = ({ x, y }) => {
		const pos = this._getPosition();
		
		return {
			x: (x / this.xScale) - pos.x,
			y: (y / this.yScale) - pos.y,
		}
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
		const { data, canvas } = this.plot;
		
		if(!data || !canvas || !canvas.getContext) return;
		
		const ctx = canvas.getContext('2d');
		const zero = this.dataToScreenSpace({ x: 0, y: 0 });
		
		// Clear
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		ctx.strokeStyle = 'lightgrey';
		
		//  Draw x axis
		ctx.beginPath();
		ctx.moveTo(0, zero.y);
		ctx.lineTo(canvas.width, zero.y);
		ctx.stroke();
		
		// Draw y axis
		ctx.beginPath();
		ctx.moveTo(zero.x, 0);
		ctx.lineTo(zero.x, canvas.height);
		ctx.stroke();
		
		ctx.strokeStyle = 'black';
		
		// Start line graph
		ctx.beginPath();
		ctx.moveTo(zero.x, zero.y);
		
		// Draw lines to points
		data.map(d => {
			let ssd = this.dataToScreenSpace(d);
			ctx.lineTo(ssd.x, ssd.y);
		})
		
		ctx.stroke();
		
		// Next frame
		requestAnimationFrame(this.render);
	}
}

export default Viewport;