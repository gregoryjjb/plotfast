import canvas from './canvas';
import Viewport from './viewport';
import Interaction from './interaction';

class Plotfast {
	constructor(containerEl, opts = {}) {
		console.log("Creating new plot");
		
		const plot = {};
		this.plot = plot;
		
		plot.canvas = canvas(containerEl, opts.width, opts.height);
		plot.viewport = new Viewport(plot);
		plot.interaction = new Interaction(plot);
		
		//plot.data = this.generateData(100000); // [{x: 1, y: 1}, {x: 2, y: 0}, {x: 3, y: 2}];

		plot.datasets = [];
		
		//this.addDataset(this.generateData(100000));
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

	addDataset = (set) => {
		if(!Array.isArray(set)) throw new Error("Dataset must be an array");

		for(let i = 0; i < set.length; i++) {
			if(
				set[i] === undefined ||
				set[i].x === undefined ||
				set[i].y === undefined
			) {
				throw new Error("Elements of dataset must be objects of form {x, y}")
			}
		}

		this.plot.datasets.push(set);

		console.log(this.plot.datasets);
	}

	removeDataset = index => {
		if(index === undefined) {
			this.plot.datasets = [];
		}
		else if(index >= this.plot.datasets.length || index < 0) {
			throw new Error("Dataset index out of range");
		}
		else {
			this.plot.datasets.splice(index, 1);
		}
	}
	
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