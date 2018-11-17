import { IPlot } from './Plotfast';

class Events {
    plot: IPlot;
    listeners: any;
    
    constructor(plot) {
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
    addListener = (name: string, callback) => {
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
    
    fireEvent = (name, args) => {
        let l = this.listeners[name];
        
        if(!Array.isArray(l)) return;
        
        for(let i = 0; i < l.length; i++) {
            l[i](args);
        }
    }
}

export default Events;