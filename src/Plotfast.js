import { createOptions } from './options';
import downsample from './downsample';
import canvas from './canvas';
import Viewport from './viewport';
import Interaction from './interaction';
import Data from './data';
import Events from './events';

class Plotfast {
	constructor(containerEl, opts = {}) {
		
		const plot = {};
		this.plot = plot;
		
		plot.options = createOptions(opts);
		plot.containerRef = containerEl;
		plot.canvas = canvas(containerEl, plot.options.width, plot.options.height);
		plot.events = new Events(plot);
		plot.viewport = new Viewport(plot);
		plot.interaction = new Interaction(plot);
		plot.data = new Data(plot);
		
		plot.datasets = [];
	}
	
	addEventListener = (name, callback) => this.plot.events.addListener(name, callback);
	
	generateData(amount = 500) {
		let data = [{x: 0, y: 0}];
		for(let i = 1; i < amount; i++) {
			data.push({
				x: i / 3,
				y: Math.round((Math.random() - 0.5) * 10 + data[i - 1].y),
			});
		}
		return data;
	}

	addDataset = (data, options) => this.plot.data.addDataset(data, options);
	updateDataset = (id, data) => this.plot.data.updateDataset(id, data);
	removeDataset = index => this.plot.data.removeDataset(index);
	
	render() {
		plot.viewport.render();
	}

	fitViewToData = () => {
		this.plot.viewport.fit();
	}

	start = () => {
		this.plot.viewport.fit();
		this.plot.data.updateDownsampling();
		this.plot.viewport.start();
	}
	
	downsample = (d, n) => downsample(d, n); // processData(d, n)
}

export default Plotfast;