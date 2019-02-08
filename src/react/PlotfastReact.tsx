import * as React from 'react';
import Plotfast from '../Plotfast';

class PlotfastReact extends React.Component {
    containerRef: HTMLDivElement = null;

    componentDidMount() {
        let plot = new Plotfast(this.containerRef);
        plot.addDataset([{x: 1, y: 1}, {x: 100, y: 100}, {x: 150, y: 50}], {});
        plot.start();
    }

    render() {
        return (
            <div ref={r => this.containerRef = r}></div>
        )
    }
}

export default PlotfastReact;