
class Viewport {
	constructor(plot) {
		this.plot = plot;
		
		this.xPos = 0;
		this.yPos = 0;
		
		// Pixels per axis unit
		this.xScale = 1 / 100;
		this.yScale = 1 / 100;
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
			console.log('Drawing', ssd)
			ctx.fillRect(ssd.x, ssd.y, 5, 5);
		})
		
		//ctx.fillStyle = 'orange'
		//ctx.fillRect(5, 5, 100, 100);
	}
}

export default Viewport;