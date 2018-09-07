import canvas from './canvas';
import Viewport from './viewport';
import Interaction from './interaction';

class Plotfast {
	constructor(containerEl, opts = {}) {
		console.log("Creating new plot");
		
		const plot = {};
		
		plot.canvas = canvas(containerEl, opts.width, opts.height);
		plot.viewport = new Viewport(plot);
		plot.interaction = new Interaction(plot);
		
		plot.data = this.generateData(100); // [{x: 1, y: 1}, {x: 2, y: 0}, {x: 3, y: 2}];
		
		plot.viewport.fit();
		plot.viewport.start();
	}
	
	generateData(amount = 500) {
		let data = [{x: 0, y: 0}];
		for(let i = 1; i < amount; i++) {
			data.push({
				x: i,
				y: Math.round((Math.random() - 0.5) * 10 + data[i - 1].y),
			});
		}
		console.log('Generating data')
		return data;
	}
	
	render() {
		plot.viewport.render();
	}
}

export default Plotfast;