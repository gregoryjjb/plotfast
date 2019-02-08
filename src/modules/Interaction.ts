import { IPlot } from '../Plotfast';
import { benchmark } from '../utils';

class Interaction {
    plot: IPlot;

    // Key status
    shiftDown: boolean;
    ctrlDown: boolean;

    // Wheel zoom
    zoomMultiplier: number = 0.75;

    // Box zoom
    draggingZoom: boolean = false;
    zoomStartX: number = 0;
    zoomStartY: number = 0;
    zoomDeltaX: number = 0;
    zoomDeltaY: number = 0;

    draggingPan: boolean = false;
    panStartX: number = 0;
    panStartY: number = 0;
    panDeltaX: number = 0;
    panDeltaY: number = 0;

    constructor(plot: IPlot) {
        this.plot = plot;

        // Wheel zoom
        this.zoomMultiplier = 0.75;

        // Event listeners
        this.plot.canvas.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        this.plot.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.plot.canvas.addEventListener('wheel', this.handleWheel);
        window.addEventListener('keydown', this.handleKeydown);
        window.addEventListener('keyup', this.handleKeyup);
    }

    startBoxZoom = (x: number, y: number) => {
        this.draggingZoom = true;
        this.zoomStartX = x;
        this.zoomStartY = y;
    };

    updateBoxZoom = (x: number, y: number) => {
        this.zoomDeltaX = x - this.zoomStartX;
        this.zoomDeltaY = y - this.zoomStartY;
    };

    finishBoxZoom = (x: number, y: number) => {
        if (!this.draggingZoom) return;

        this.draggingZoom = false;

        let x1 = this.zoomStartX;
        let x2 = x1 + this.zoomDeltaX;
        let y1 = this.zoomStartY;
        let y2 = y1 + this.zoomDeltaY;

        this.plot.viewport.zoomToScreenCoords(x1, y1, x2, y2);

        this.zoomStartX = 0;
        this.zoomStartY = 0;
        this.zoomDeltaX = 0;
        this.zoomDeltaY = 0;
    };

    cancelBoxZoom = () => {
        this.draggingZoom = false;
        this.zoomStartX = 0;
        this.zoomStartY = 0;
        this.zoomDeltaX = 0;
        this.zoomDeltaY = 0;
    };

    startPan = (x: number, y: number) => {
        this.draggingPan = true;
        this.panStartX = x;
        this.panStartY = y;
    };

    updatePan = (x: number, y: number) => {
        this.panDeltaX = x - this.panStartX;
        this.panDeltaY = y - this.panStartY;

        this.plot.viewport.setOffset(this.panDeltaX, this.panDeltaY);
    };

    finishPan = () => {
        this.draggingPan = false;

        this.plot.viewport.applyOffset();

        this.panStartX = 0;
        this.panStartY = 0;
        this.panDeltaX = 0;
        this.panDeltaY = 0;
    };

    cancelPan = () => {
        this.draggingPan = false;

        this.plot.viewport.setOffset(0, 0);

        this.panStartX = 0;
        this.panStartY = 0;
        this.panDeltaX = 0;
        this.panDeltaY = 0;
    };

    handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();

        let x = e.offsetX;
        let y = e.offsetY;

        // Left click with control
        if (e.button === 0 && this.ctrlDown) {
            this.startBoxZoom(x, y);
        }

        // Left click with shift
        else if (e.button === 0 && this.shiftDown) {
            this.startPan(x, y);
        }

        // Left click
        else if (e.button === 0) {
            let {
                iconY,
                iconSize,
                fullscreenIconX,
                cameraIconX,
            } = this.plot.viewport;

            if (y > iconY && y < iconY + iconSize) {
                if (x > fullscreenIconX && x < fullscreenIconX + iconSize) {
                    this.plot.viewport.toggleFullscreen();
                } else if (x > cameraIconX && x < cameraIconX + iconSize) {
                    this.plot.viewport.takeSnapshot();
                }
            }
        }

        // Middle click
        else if (e.button === 1) {
            this.startPan(x, y);
        }

        this.updateCursor();
    };

    handleMouseUp = (e: MouseEvent) => {
        let x = e.offsetX;
        let y = e.offsetY;

        if (this.draggingPan === true) {
            this.finishPan();
        }

        if (this.draggingZoom === true) {
            this.finishBoxZoom(x, y);
        }

        this.updateCursor();
    };

    handleMouseMove = (e: MouseEvent) => {
        const x = e.offsetX;
        const y = e.offsetY;

        if (this.draggingPan === true) {
            this.updatePan(x, y);
        } else if (this.draggingZoom === true) {
            this.updateBoxZoom(x, y);
        }

        if (this.shiftDown || this.ctrlDown) {
            //benchmark(this.plot.viewport.findUnderMouse, [x, y], 'FindUnderMouse');
            this.plot.viewport.findUnderMouse(null, null);
        } else {
            this.plot.viewport.findUnderMouse(x, y);
        }
    };

    handleWheel = (e: WheelEvent) => {
        e.preventDefault();

        // Zoom in
        if (e.deltaY < 0) {
            this.plot.viewport.zoom(this.zoomMultiplier, e.offsetX, e.offsetY);
        }

        // Zoom out
        else {
            this.plot.viewport.zoom(
                1 / this.zoomMultiplier,
                e.offsetX,
                e.offsetY,
            );
        }

        this.updateCursor();
    };

    handleKeydown = (e: KeyboardEvent) => {
        const k = e.key;

        if (k === 'Escape') {
            this.cancelBoxZoom();
            this.cancelPan();
        } else if (k === 'Shift') {
            this.shiftDown = true;
        } else if (k === 'Control') {
            this.ctrlDown = true;
        } else if (k === 'f') {
            this.plot.viewport.fit();
        }

        this.updateCursor();
        this.plot.viewport.findUnderMouse(null, null);
    };

    handleKeyup = (e: KeyboardEvent) => {
        const k = e.key;

        if (k === 'Shift') {
            this.shiftDown = false;
        } else if (k === 'Control') {
            this.ctrlDown = false;
        }

        this.updateCursor();
    };

    updateCursor = () => {
        let c = 'default';

        if (this.draggingPan) c = 'grabbing';
        else if (this.shiftDown) c = 'grab';
        else if (this.ctrlDown) c = 'zoom-in';
        else c = 'default';

        this.plot.canvas.style.cursor = c;
    };
}

export default Interaction;
