
const defaultOptions = {
	name: 'Dataset',
	color: 'black',
}

class Data {
	constructor(plot) {
		this.plot = plot;
		
		this.sets = [];
	}
	
	/**
	 * Add a dataset to the plot
	 * @param {Object[]} data The new dataset to add
	 * @param {number} data[].x X coordinate of point
	 * @param {number} data[].y Y coordinate of point
	 * @param {Object} [options] Options for the dataset
	 * @param {string} options.color Color of the set
	 * @param {string} options.name Name of the set
	 */
	addDataset = (data, options) => {
		if(!Array.isArray(data)) throw new Error("Dataset must be an array");

		for(let i = 0; i < data.length; i++) {
			if(
				data[i] === undefined ||
				data[i].x === undefined ||
				data[i].y === undefined
			) {
				throw new Error("Elements of dataset must be objects of form {x, y}")
			}
		}
		
		data.sort((a, b) => {
			if(a.x > b.x) return 1;
			if(a.x < b.x) return -1;
			return 0;
		});

		this.sets.push({
			data,
			...defaultOptions,
			...options,
		});
	}
	
	/**
	 * Modify the data in a dataset
	 * @param {number} id The index of the dataset
	 * @param {Object[]} data The new dataset to replace with
	 * @param {number} data[].x X coordinate of point
	 * @param {number} data[].y Y coordinate of point
	 */
	updateDataset = (id, data) => {
		if(id === undefined) return;
		if(typeof id !== 'number') return;
		if(id < 0 || id >= this.sets.length) return;
		if(!Array.isArray(data)) return;
		
		this.sets[id].data = data;
	}
	
	/**
	 * Remove a dataset from the plot
	 * @param {string | number} id The index or name of the dataset to remove
	 */
	removeDataset = id => {
		if(id === undefined) {
			this.sets = [];
		}
		else if(typeof id === 'number') {
			if(id >= this.sets.length || id < 0) {
				throw new Error("Dataset index out of range");
			}
			else {
				this.sets.splice(id, 1);
			}
		}
		else if(typeof id === 'string') {
			let indexes = [];
			for(let i = 0; i < this.sets.length; i++) {
				if(this.sets[i].name === id) indexes.push(i);
			}
			
			if(indexes.length === 0) {
				throw new Error(`Dataset name '${id}' not found`);
			}
			
			for(let i = indexes.length - 1; i >= 0; i--) {
				this.sets.splice(indexes[i], 1);
			}
		}
		else {
			throw new Error("Dataset identifier must be an index or name");
		}
	}
}

export default Data;