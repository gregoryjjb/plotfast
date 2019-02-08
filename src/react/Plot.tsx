import * as React from 'react';
import Plotfast from '../Plotfast';
import { IPlotOptionsParams, IDatasetOptionsParams } from '../utils/options';
import { IPoint } from '../modules/data';

class Plot extends React.Component<{
    options?: IPlotOptionsParams;
    datasets: {
        data: IPoint[];
        options: IDatasetOptionsParams;
    };
}> {
    containerRef: HTMLDivElement = null;

    componentDidMount() {
        let plot = new Plotfast(this.containerRef, this.props.options || {});
        plot.addDataset(this.props.datasets.data, this.props.datasets.options);
        plot.start();
    }

    render() {
        return <div ref={r => (this.containerRef = r)} />;
    }
}

export default Plot;
