import { IPlot } from './Plotfast';
import downsample from '../utils/downsample';
import { clamp } from '../utils';
import {
    createDatasetOptions,
    IDatasetOptions,
    IDatasetOptionsParams,
} from '../utils/options';

export interface IPoint {
    x: number;
    y: number;
}

interface IDataset extends IDatasetOptions {
    data: IPoint[];
    downsampledData: IPoint[];
}

class Data {
    plot: IPlot;
    sets: IDataset[];
    _timeout: any;

    constructor(plot: IPlot) {
        this.plot = plot;

        this.sets = [];

        this._timeout = null;

        this.plot.events.addListener('viewMoved', (e: any) => {
            if (e.x1 === e.x2) return;

            if (e.type === 'zoom') {
                clearTimeout(this._timeout);
                this._timeout = setTimeout(
                    () => this.updateDownsampling(e.x1, e.x2),
                    250,
                );
            } else {
                this.updateDownsampling(e.x1, e.x2);
            }
        });

        //const testData = [0, 1, 2, 3].map(n => ({ x: n }));
        //const find = -1;
        //
        //const hi = this.binarySearch(testData, find, 1);
        //const lo = this.binarySearch(testData, find, -1);
        //const cl = this.binarySearch(testData, find, 0);
        //console.log("Hi", hi, "Lo", lo, "Close", cl);
    }

    downsampleSet = (
        data: IPoint[],
        min?: number,
        max?: number,
        resolution?: number,
    ): IPoint[] => {
        if (min === undefined) min = this.plot.viewport.startX;
        if (max === undefined) max = this.plot.viewport.endX;
        if (resolution === undefined)
            resolution = this.plot.viewport.getPlotWidth();

        let visible = max - min;
        let total = data[data.length - 1].x - data[0].x;
        let actualRes = Math.ceil((total / visible) * resolution);

        let actualMin = min - visible * 2;
        let actualMax = max + visible * 2;
        let actualRange = actualMax - actualMin;

        console.log('=========================================');
        console.log('Downsampling to', actualRes, 'points');

        let dataRange = data[data.length - 1].x - data[0].x;

        let finalData, slicedData;

        if (actualRange > dataRange) {
            console.warn("WE'RE WASTING EFFORT IF WE SLICE HERE");
            slicedData = data;
            resolution = actualRes;
        } else {
            slicedData = this.subsection(data, actualMin, actualMax, true);
            resolution *= 5;
        }

        finalData = downsample(slicedData, resolution);

        return finalData;
    };

    /**
     * @deprecated Use subsection instead
     */
    filter = (data: IPoint[], min: number, max: number): IPoint[] => {
        let arr = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].x > min && data[i].x < max) arr.push(data[i]);
        }
        return arr;
    };

    /**
     * Get a subsection of an array of data
     * @param {[{x: number, y: number}]} data Data array
     * @param {number} min Minimum data value
     * @param {number} max Maximum data value
     * @param {bool} [includeOuter=false] Include one extra point on each side just outside the range
     */
    subsection = (
        data: IPoint[],
        min: number,
        max: number,
        includeOuter: boolean = false,
    ): IPoint[] => {
        if (min > max) return [];

        let start = this.binarySearch(data, min, includeOuter ? 0 : 1);
        let end = this.binarySearch(data, max, includeOuter ? 0 : -1);

        if (start === -1 || end === -1) return [];

        if (includeOuter && data[start].x > min && start > 0) start--;
        if (includeOuter && data[end].x < max && end < data.length - 1) end++;

        return data.slice(start, end + 1);
    };

    /**
     * Find the index of a given X value using binary search
     * @param {[x: number, y: number]} data The data array to search
     * @param {number} value The value to find
     * @param {number} [hilo=0] -1: closest lower, 1: closest higher, 0: closest
     * @return {number} The index of the point, or -1 if the point wasn't found
     */
    binarySearch = (
        data: IPoint[],
        value: number,
        hilo: number = 0,
    ): number => {
        const max = data.length - 1;

        if (data.length === 0) {
            return -1;
        }
        if (value <= data[0].x) {
            return hilo >= 0 ? 0 : -1;
        }
        if (value >= data[max].x) {
            return hilo <= 0 ? max : -1;
        }

        let mid = 0;
        let start = 0;
        let stop = max;

        const pick = (i1: number, i2: number) => {
            let val1 = data[i1].x;
            let val2 = data[i2].x;
            if (hilo === 1) {
                return i2;
            } else if (hilo === -1) {
                return i1;
            } else if (value - val1 >= val2 - value) {
                return i2;
            } else {
                return i1;
            }
        };

        while (start < stop) {
            mid = Math.floor((start + stop) / 2);

            if (value === data[mid].x) return mid;

            if (value < data[mid].x) {
                if (mid > 0 && value > data[mid - 1].x) {
                    return pick(mid - 1, mid);
                }
                stop = mid;
            } else {
                if (mid < max - 1 && value < data[mid + 1].x) {
                    return pick(mid, mid + 1);
                }
                start = mid + 1;
            }
        }

        return mid;
    };

    /**
     * Re-downsample all datasets to area within range
     * @param {number} min Start of range
     * @param {number} max End of range
     */
    updateDownsampling = (min?: number, max?: number) => {
        if (min === undefined) min = this.plot.viewport.startX;
        if (max === undefined) max = this.plot.viewport.endX;

        // Logging
        let t0 = performance.now();

        for (let i = 0; i < this.sets.length; i++) {
            let set = this.sets[i];
            if (set.downsample === true) {
                set.downsampledData = this.downsampleSet(set.data);
            } else {
                set.downsampledData = set.data;
            }
        }

        let t1 = performance.now();
        let t = (t1 - t0).toPrecision(3);
        console.log(`Dowsampling took ${t}ms`);
    };

    /**
     * Add a dataset to the plot
     * @param {Object[]} data The new dataset to add
     * @param {number} data[].x X coordinate of point
     * @param {number} data[].y Y coordinate of point
     * @param {Object} [options] Options for the dataset
     * @param {string} options.color Color of the set
     * @param {string} options.name Name of the set
     */
    addDataset = (data: IPoint[], options: IDatasetOptionsParams) => {
        if (!Array.isArray(data)) throw new Error('Dataset must be an array');

        for (let i = 0; i < data.length; i++) {
            if (
                data[i] === undefined ||
                data[i].x === undefined ||
                data[i].y === undefined
            ) {
                throw new Error(
                    'Elements of dataset must be objects of form {x, y}',
                );
            }
        }

        data.sort((a, b) => {
            if (a.x > b.x) return 1;
            if (a.x < b.x) return -1;
            return 0;
        });

        const opts = createDatasetOptions(options);

        // Get default downsample option from global options
        if (opts.downsample === undefined) {
            opts.downsample = this.plot.options.downsample;
        }

        let downsampledData = opts.downsample
            ? this.downsampleSet(data, data[0].x, data[data.length - 1].x)
            : data;

        this.sets.push({
            data,
            downsampledData,
            ...opts,
        });
    };

    /**
     * Modify the data in a dataset
     * @param {number} id The index of the dataset
     * @param {Object[]} data The new dataset to replace with
     * @param {number} data[].x X coordinate of point
     * @param {number} data[].y Y coordinate of point
     */
    updateDataset = (id: string | number, data: IPoint[]): void => {
        if (id === undefined) return;
        if (typeof id !== 'number') return;
        if (id < 0 || id >= this.sets.length) return;
        if (!Array.isArray(data)) return;

        let downsampledData = this.sets[id].downsample
            ? this.downsampleSet(data, data[0].x, data[data.length - 1].x)
            : data;

        this.sets[id].data = data;
        this.sets[id].downsampledData = downsampledData;
    };

    /**
     * Remove a dataset from the plot
     * @param {string | number} id The index or name of the dataset to remove
     */
    removeDataset = (id: string | number) => {
        if (id === undefined) {
            this.sets = [];
        } else if (typeof id === 'number') {
            if (id >= this.sets.length || id < 0) {
                throw new Error('Dataset index out of range');
            } else {
                this.sets.splice(id, 1);
            }
        } else if (typeof id === 'string') {
            let indexes = [];
            for (let i = 0; i < this.sets.length; i++) {
                if (this.sets[i].name === id) indexes.push(i);
            }

            if (indexes.length === 0) {
                throw new Error(`Dataset name '${id}' not found`);
            }

            for (let i = indexes.length - 1; i >= 0; i--) {
                this.sets.splice(indexes[i], 1);
            }
        } else {
            throw new Error('Dataset identifier must be an index or name');
        }
    };
}

export default Data;
