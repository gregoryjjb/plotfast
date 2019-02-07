import React from 'react';
import Plotfast from './Plotfast';

class PlotfastReact extends React.Component {
    containerRef = null;

    componentDidMount() {
        const plot = new Plotfast(this.containerRef);
        plot.addDataset([{x: 10, y: 7}, {x: 15, y: 5}, {x: 17, y: 12}], {});
        plot.start();
    }

    render() {
        return (
            <div ref={r => this.containerRef = r} />
        )
    }
}

export default PlotfastReact;