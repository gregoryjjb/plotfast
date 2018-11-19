import { IPlot } from './Plotfast';

interface IListeners {
    [key: string]: Array<Function>,
}

class Events {
    plot: IPlot;
    listeners: IListeners;
    
    constructor(plot: IPlot) {
        this.plot = plot;

        this.listeners = {
            viewMoved: [],
        };
    }

    /**
     * Add a listener to the plot
     * @param {string} name Name of the event to listen to
     * @param {function} callback Event callback
     */
    addListener = (name: string, callback: Function) => {
        if(!name || typeof name !== 'string') {
            throw new Error('Name of event must be a string');
        }
        if(typeof callback !== 'function') {
            throw new Error('Must provide callback for event');
        }
        if(!Array.isArray(this.listeners[name])) {
            throw new Error(`No such event '${name}'`);
        }
        
        this.listeners[name].push(callback);
    }
    
    fireEvent = (name: string, args: any) => {
        let l = this.listeners[name];
        
        if(!Array.isArray(l)) return;
        
        for(let i = 0; i < l.length; i++) {
            l[i](args);
        }
    }
}

export default Events;