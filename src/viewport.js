
class Viewport {
	constructor(plot) {
		this.plot = plot;
		
		this.xPos = 0;
		this.yPos = 0;
		
		// Pixels per axis unit
		this.xScale = 20;
		this.yScale = 20;
	}
	
	pixelsToAxis = (x, y) => {
		
	}
	
	axisToPixels = (x, y) => {
		
	}
	
	screenToDataSpace = ({ x, y }) => {
		return {
			x: (x - this.xPos) * this.xScale,
			y: (y - this.yPos) * this.yScale,
		}
	}
	
	dataToScreenSpace = ({ x, y }) => {
		return {
			x: (x / this.xScale) + this.xPos,
			y: (y / this.yScale) + this.yPos,
		}
	}
	
	render = () => {
		const { data, canvas } = this.plot;
		
		if(!data || !canvas || !canvas.getContext) return;
		
		const ctx = canvas.getContext('2d');
		
		data.map(d => {
			
			let ssd = this.dataToScreenSpace(d);
			
			ctx.fillRect(ssd.x, ssd.y, 5, 5);
		})
		
		ctx.fillRect(5, 5, 100, 100);
	}
}