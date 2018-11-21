import { createPlotOptions, IPlotOptions, IPlotOptionsParams } from './options';
import downsample from './downsample';
import canvas from './canvas';
import Viewport from './viewport';
import Interaction from './interaction';
import Data, { IPoint } from './data';
import Events from './events';

export interface IPlot {
    options?: IPlotOptions;
    containerRef?: HTMLElement;
    canvas?: HTMLCanvasElement;
    events?: Events;
    viewport?: Viewport;
    interaction?: Interaction;
    data?: Data;
}

class Plotfast {
    plot: IPlot = {};

    constructor(containerEl: HTMLElement, opts: IPlotOptionsParams = {}) {
        const plot = this.plot;

        plot.options = createPlotOptions(opts);
        plot.containerRef = containerEl;
        plot.canvas = canvas(
            containerEl,
            plot.options.width,
            plot.options.height,
        );
        plot.events = new Events(plot);
        plot.viewport = new Viewport(plot);
        plot.interaction = new Interaction(plot);
        plot.data = new Data(plot);
    }

    addEventListener = (name: string, callback: Function) =>
        this.plot.events.addListener(name, callback);

    addDataset = (data: IPoint[], options: any) =>
        this.plot.data.addDataset(data, options);

    updateDataset = (id: string, data: IPoint[]) =>
        this.plot.data.updateDataset(id, data);

    removeDataset = (index: number) => this.plot.data.removeDataset(index);

    fitViewToData = () => this.plot.viewport.fit();

    start = () => {
        this.plot.viewport.fit();
        this.plot.data.updateDownsampling();
        this.plot.viewport.start();
    };

    render = () => this.plot.viewport.render();

    downsample = (d: IPoint[], n: number) => downsample(d, n);

    generateData(amount = 500): IPoint[] {
        let data: IPoint[] = [{ x: 0, y: 0 }];
        for (let i = 1; i < amount; i++) {
            data.push({
                x: i / 3,
                y: Math.round((Math.random() - 0.5) * 10 + data[i - 1].y),
            });
        }
        return data;
    }
}

export default Plotfast;
