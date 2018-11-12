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

export const createOptions = opts => {
    
    return {
        ...defaultOptions,
        ...opts,
    };
}