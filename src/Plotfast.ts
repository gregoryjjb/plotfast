import { createOptions, IOptions, IOptionsParams } from './options';
import downsample from './downsample';
import canvas from './canvas';
import Viewport from './viewport';
import Interaction from './interaction';
import Data from './data';
import Events from './events';

export interface IPlot {
	options?: IOptions,
	containerRef?: HTMLElement,
	canvas?: HTMLCanvasElement,
	events?: Events,
	viewport?: any,
	interaction?: any,
	data?: any,
}

class Plotfast {
	
	plot: IPlot = {};
	
	addEventListener: any;
	addDataset: any;
	updateDataset: any;
	removeDataset: any;
	fitViewToData: any;
	start: any;
	render: any;
	downsample: any;
	
	constructor(containerEl, opts: IOptionsParams = {}) {
		
		const plot = this.plot;
		
		plot.options = createOptions(opts);
		plot.containerRef = containerEl;
		plot.canvas = canvas(containerEl, plot.options.width, plot.options.height);
		plot.events = new Events(plot);
		plot.viewport = new Viewport(plot);
		plot.interaction = new Interaction(plot);
		plot.data = new Data(plot);
		
		this.addEventListener = (name, callback) => this.plot.events.addListener(name, callback);
		this.addDataset = (data, options) => this.plot.data.addDataset(data, options);
		this.updateDataset = (id, data) => this.plot.data.updateDataset(id, data);
		this.removeDataset = index => this.plot.data.removeDataset(index);
		
		this.fitViewToData = () => this.plot.viewport.fit();
		
		this.start = () => {
			this.plot.viewport.fit();
			this.plot.data.updateDownsampling();
			this.plot.viewport.start();
		}
		
		this.render = () => {
			this.plot.viewport.render();
		}
		
		this.downsample = (d, n) => downsample(d, n);
	}
	
	//addEventListener = (name, callback) => this.plot.events.addListener(name, callback);
	
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
	
	
	
	 // processData(d, n)
	
	//takeSnapshot = () => this.plot.viewport.takeSnapshot();
}

export default Plotfast;