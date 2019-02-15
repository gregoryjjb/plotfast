import * as React from 'react';
import Plotfast from '../modules/Plotfast';
import { IPlotOptionsParams, IDatasetOptionsParams } from '../utils/options';
import { IPoint } from '../modules/Data';

interface IPlotParams {
    options?: IPlotOptionsParams;
    datasets: {
        data: IPoint[];
        options: IDatasetOptionsParams;
    }[];
}

class Plot extends React.Component<IPlotParams> {
    containerRef: HTMLDivElement = null;

    componentDidMount() {
        let plot = new Plotfast(this.containerRef, this.props.options || {});

        this.props.datasets.forEach(dataset => {
            plot.addDataset(dataset.data, dataset.options);
        });

        plot.start();
    }

    render() {
        let { options, datasets, ...props } = this.props;
        return <div ref={r => (this.containerRef = r)} {...props} />;
    }
}

export default Plot;
