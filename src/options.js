const defaultOptions = {
    logging: false,
    width: 640,
    height: 480,
    xLabel: 'X Axis',
    yLabel: 'Y Axis',
    lineColor: 'lightgrey',
    textColor: 'black',
    backgroundColor: 'none',
};

export const createOptions = opts => {
    
    return {
        ...defaultOptions,
        ...opts,
    };
}