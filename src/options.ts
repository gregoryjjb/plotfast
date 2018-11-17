
const defaultOptions = {
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

export interface IOptions {
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

export interface IOptionsParams extends Partial<IOptions> {};

export const createOptions = (opts: IOptionsParams): IOptions => {
    
    return {
        ...defaultOptions,
        ...opts,
    };
}