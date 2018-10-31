import downsample from './downsample';
import { clamp } from './utils';

const defaultOptions = {
	name: 'Dataset',
	color: 'black',
}

class Data {
	constructor(plot) {
		this.plot = plot;
		
		this.sets = [];
		
		this.plot.events.addListener('viewMoved', e => {
			if(e.x1 !== e.x2) this.updateDownsampling(e.x1, e.x2);
		})
	}
	
	downsampleSet = (data, min, max, resolution) => {
		if(min === undefined) min = this.plot.viewport.startX;
		if(max === undefined) max = this.plot.viewport.endX;
		if(resolution === undefined) resolution = this.plot.viewport.getPlotWidth();
		
		let visible = max - min;
		let total = data[data.length - 1].x - data[0].x;
		let actualRes = Math.ceil(total / visible * resolution);
		
		let actualMin = min - visible * 2;
		let actualMax = max + visible * 2;
		
		console.log("=========================================");
		console.log("Downsampling to", actualRes, "points");
		
		let finalData;
		
		// If we are downsampling to more than 0.05% of our whole dataset,
		// it's faster to filter first
		if(actualRes > data.length * 0.0005) {
			// If we are zoomed in
			// Filter first
			let slicedData = this.subsection(data, actualMin, actualMax);
			let dsData = downsample(slicedData, resolution * 5);
			finalData = dsData;
			console.log("FILTER first");
		}
		else {
			let dsData = downsample(data, actualRes);
			let slicedData = this.subsection(dsData, actualMin, actualMax);
			finalData = slicedData;
			console.log("DOWNSAMPLE first");
		}
		
		return finalData;
	}
	
	_filterData = (data, min, max) => {
		let arr = [];
		for(let i = 0; i < data.length; i++) {
			if(data[i].x > min && data[i].x < max) arr.push(data[i]);
		}
		return arr;
	}
	
	subsection = (data, min, max) => {
		let start = this._binarySearch(data, min);
		if(data[start - 1] != undefined) start--;
		let end = this._binarySearch(data, max);
		if(data[end + 1] != undefined) end++;
		return data.slice(start, end + 1);
	}
	
	_binarySearch = (data, value) => {
		let start = 0;
		let stop = data.length - 1;
		let middle = Math.floor((start + stop) / 2);
		
		while (stop > start) {
			if(value < data[middle].x) {
				stop = middle - 1;
			}
			else {
				start = middle + 1;
			}
			
			middle = Math.floor((start + stop) / 2);
		}
		
		return clamp(middle, 0, data.length - 1);
	}
	
	updateDownsampling = (min, max) => {
		// Logging
		let t0 = performance.now();
		
		for(let i = 0; i < this.sets.length; i++) {
			let set = this.sets[i];
			set.downsampledData = this.downsampleSet(set.data);
		}
		
		let t1 = performance.now();
		let t = (t1 - t0).toPrecision(3);
		console.log(`Dowsampling took ${t}ms`);
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
		
		let downsampledData = this.downsampleSet(data, data[0].x, data[data.length - 1].x);
		
		console.log("ENDED UP WITH", downsampledData.length, "POINTS OF DOWNSAMPLED");

		this.sets.push({
			data,
			downsampledData,
			...defaultOptions,
			...options,
		});
		
		//this.updateDownsampling();
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