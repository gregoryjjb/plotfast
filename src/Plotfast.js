import canvas from './canvas';
import Viewport from './viewport';
import Interaction from './interaction';
import Data from './data';
import Events from './events';

class Plotfast {
	constructor(containerEl, opts = {}) {
		console.log("Creating new plot");
		
		const plot = {};
		this.plot = plot;
		
		plot.canvas = canvas(containerEl, opts.width, opts.height);
		plot.viewport = new Viewport(plot);
		plot.interaction = new Interaction(plot);
		plot.data = new Data(plot);
		plot.events = new Events(plot);
		
		plot.datasets = [];
	}
	
	addEventListener = (name, callback) => this.plot.events.addListener(name, callback);
	
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

	addDataset = (data, options) => this.plot.data.addDataset(data, options);

	removeDataset = index => this.plot.data.removeDataset(index);
	
	render() {
		plot.viewport.render();
	}

	fitViewToData = () => {
		this.plot.viewport.fit();
	}

	start = () => {
		this.plot.viewport.fit();
		this.plot.viewport.start();
	}
}

export default Plotfast;