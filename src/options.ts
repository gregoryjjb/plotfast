import { IPoint } from './data';

export interface IPlotOptions {
    logging: boolean,
    width: number,
    height: number,
    xLabel: string,
    yLabel: string,
    lineColor: string,
    textColor: string,
    backgroundColor: string,
    downsample: boolean,
}

export interface IPlotOptionsParams extends Partial<IPlotOptions> {};

const defaultPlotOptions: IPlotOptions = {
    logging: false,
    width: 640,
    height: 480,
    xLabel: 'X Axis',
    yLabel: 'Y Axis',
    // Colors
    lineColor: 'lightgrey',
    textColor: 'black',
    backgroundColor: 'none',
    // Data
    downsample: true,
};

export const createPlotOptions = (opts: IPlotOptionsParams): IPlotOptions => {
    return {
        ...defaultPlotOptions,
        ...opts,
    };
}

export interface IDatasetOptions {
	name: string,
	downsample?: boolean,
	color: string,
}

export interface IDatasetOptionsParams extends Partial<IDatasetOptions> {};

const defaultDatasetOptions: IDatasetOptions = {
	name: 'Dataset',
	color: 'black',
}

export const createDatasetOptions = (opts: IDatasetOptionsParams): IDatasetOptions => {
    return {
        ...defaultDatasetOptions,
        ...opts,
    };
}

export interface IDataset extends IDatasetOptions {
	data: IPoint[],
	downsampledData: IPoint[],
}