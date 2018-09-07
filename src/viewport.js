
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
	
	screenToDataSpace = ({ x, y }) => {
		return {
			x: (x + this.xPos) * this.xScale,
			y: (y + this.yPos) * this.yScale,
		}
	}
	
	dataToScreenSpace = ({ x, y }) => {
		return {
			x: (x / this.xScale) - this.xPos,
			y: (y / this.yScale) - this.yPos,
		}
	}
	
	render = () => {
		console.log('Rendering')
		const { data, canvas } = this.plot;
		
		if(!data || !canvas || !canvas.getContext) return;
		
		const ctx = canvas.getContext('2d');
		const zero = this.dataToScreenSpace({ x: 0, y: 0 });
		
		ctx.beginPath();
		ctx.moveTo(zero.x, zero.y);
		
		data.map(d => {
			
			let ssd = this.dataToScreenSpace(d);
			console.log('Drawing', ssd)
			//ctx.fillRect(ssd.x, ssd.y, 5, 5);
			ctx.lineTo(ssd.x, ssd.y);
		})
		
		ctx.stroke();
		
		//ctx.fillStyle = 'orange'
		//ctx.fillRect(5, 5, 100, 100);
	}
}

export default Viewport;