const fullscreenImgSrc = require('../../img/baseline-fullscreen-24px.svg');
const cameraImgSrc = require('../../img/outline-camera_alt-24px.svg');

import { IPlot } from '../Plotfast';
import { IPoint } from './Data';
import { IDataset, EPlotType } from '../utils/options';

class Viewport {
    plot: IPlot;

    // Final positions, in data coords, after offsetting
    startX: number = 0;
    startY: number = 0;
    endX: number = 20;
    endY: number = 20;

    private offsetX: number = 0;
    private offsetY: number = 0;

    // Position without offsetting
    private minX: number = 0;
    private maxX: number = 0;
    private minY: number = 0;
    private maxY: number = 0;

    // Padding
    readonly paddingLeft: number = 70;
    readonly paddingRight: number = 30;
    readonly paddingTop: number = 40;
    readonly paddingBottom: number = 50;

    // Calculated once per frame
    private scaleX: number = 0;
    private scaleY: number = 0;
    private plotWidth: number = 0;
    private plotHeight: number = 0;

    selectedX: number = null;
    selectedY: number = null;

    // Benchmarks
    private BENCH: Array<number> = [];

    // Is fullscreen or not
    private fullscreen: boolean = false;

    // Icon images
    private fullscreenImg: HTMLImageElement;
    private cameraImg: HTMLImageElement;

    // Icons
    iconSize: number = 0;
    iconY: number = 0;
    fullscreenIconX: number = 0;
    cameraIconX: number = 0;

    constructor(plot: IPlot) {
        this.plot = plot;

        this.fullscreenImg = new Image();
        this.fullscreenImg.src = fullscreenImgSrc;

        this.cameraImg = new Image();
        this.cameraImg.src = cameraImgSrc;

        window.addEventListener('resize', e => {
            if (this.fullscreen === false || !this.plot.canvas) return;

            this.plot.canvas.width = window.innerWidth;
            this.plot.canvas.height = window.innerHeight;
        });
    }

    getPlotWidth = () =>
        this.plot.canvas.width - this.paddingLeft - this.paddingRight;
    getPlotHeight = () =>
        this.plot.canvas.height - this.paddingTop - this.paddingBottom;

    _updateCalculations = () => {
        this.minX = this.startX + this.offsetX;
        this.maxX = this.endX + this.offsetX;
        this.minY = this.startY + this.offsetY;
        this.maxY = this.endY + this.offsetY;

        this.plotWidth =
            this.plot.canvas.width - this.paddingLeft - this.paddingRight;
        this.plotHeight =
            this.plot.canvas.height - this.paddingTop - this.paddingBottom;

        this.scaleX = (this.endX - this.startX) / this.plotWidth;
        this.scaleY = (this.endY - this.startY) / this.plotHeight;

        this.iconSize = Math.floor(this.paddingTop - 10);
        this.iconY = 5;
        this.fullscreenIconX =
            Math.floor(this.plot.canvas.width - this.iconSize - 5) + 0.5;
        this.cameraIconX =
            Math.floor(this.fullscreenIconX - this.iconSize - 5) + 0.5;
    };

    setOffset = (x: number, y: number) => {
        this.offsetX =
            -x *
            ((this.endX - this.startX) /
                (this.paddingLeft - this.paddingLeft + this.plotWidth));
        this.offsetY = y * ((this.endY - this.startY) / this.plotHeight);
    };

    applyOffset = () => {
        this.startX += this.offsetX;
        this.endX += this.offsetX;
        this.startY += this.offsetY;
        this.endY += this.offsetY;

        this.offsetX = 0;
        this.offsetY = 0;

        this._viewMoved();
    };

    _dataToScreen = (
        d: number,
        dMin: number,
        dMax: number,
        sMin: number,
        sMax: number,
    ): number => (d - dMin) * ((sMax - sMin) / (dMax - dMin)) + sMin;
    _screenToData = (
        s: number,
        dMin: number,
        dMax: number,
        sMin: number,
        sMax: number,
    ): number => (s - sMin) * ((dMax - dMin) / (sMax - sMin)) + dMin;

    dataToScreenX = (d: number): number =>
        (d - this.minX) / this.scaleX + this.paddingLeft;
    dataToScreenY = (d: number): number =>
        ((d - this.minY) / this.scaleY) * -1 +
        this.paddingTop +
        this.plotHeight;
    screenToDataX = (s: number): number =>
        (s - this.paddingLeft) * this.scaleX + this.minX;
    screenToDataY = (s: number): number =>
        (this.paddingTop + this.plotHeight - s) * this.scaleY + this.minY;

    // Old (slower?) way
    // Yep it's about 8% slower
    //dataToScreenX = (d) => this._dataToScreen(d, this.minX, this.maxX, this.paddingLeft, this.paddingLeft + this.plotWidth);
    //dataToScreenY = (d) => this._dataToScreen(d, this.minY, this.maxY, this.paddingTop + this.plotHeight, this.paddingTop);
    //screenToDataX = (s) => this._screenToData(s, this.minX, this.maxX, this.paddingLeft, this.paddingLeft + this.plotWidth);
    //screenToDataY = (s) => this._screenToData(s, this.minY, this.maxY, this.paddingTop + this.plotHeight, this.paddingTop);

    setFullscreen = () => {
        this.fullscreen = true;

        const { canvas } = this.plot;

        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.bottom = '0';
        canvas.style.left = '0';
        canvas.style.right = '0';
        canvas.style.zIndex = Number.MAX_VALUE.toString(); // Big value

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        document.querySelector('body').appendChild(canvas);

        this._viewMoved('fullscreen');
    };

    unsetFullscreen = () => {
        this.fullscreen = false;

        const { canvas, options } = this.plot;

        canvas.style.position = 'unset';
        canvas.style.top = 'unset';
        canvas.style.bottom = 'unset';
        canvas.style.left = 'unset';
        canvas.style.right = 'unset';
        canvas.style.zIndex = 'unset';

        canvas.width = options.width;
        canvas.height = options.height;

        this.plot.containerRef.appendChild(canvas);

        this._viewMoved('fullscreen');
    };

    toggleFullscreen = () =>
        this.fullscreen ? this.unsetFullscreen() : this.setFullscreen();

    zoomToScreenCoords = (
        sStartX: number,
        sStartY: number,
        sEndX: number,
        sEndY: number,
    ) => {
        if (sStartX === sEndX || sStartY === sEndY) return;

        let x1 = this.screenToDataX(sStartX);
        let y1 = this.screenToDataY(sStartY);
        let x2 = this.screenToDataX(sEndX);
        let y2 = this.screenToDataY(sEndY);

        this.startX = Math.min(x1, x2);
        this.endX = Math.max(x1, x2);

        this.startY = Math.min(y1, y2);
        this.endY = Math.max(y1, y2);

        this._viewMoved();
    };

    zoom = (amount: number, screenX: number, screenY: number) => {
        let anchorX = this.screenToDataX(screenX);
        let anchorY = this.screenToDataY(screenY);

        let anchorLeft = (anchorX - this.startX) * amount;
        let anchorRight = (this.endX - anchorX) * amount;

        let anchorBottom = (anchorY - this.startY) * amount;
        let anchorTop = (this.endY - anchorY) * amount;

        this.startX = anchorX - anchorLeft;
        this.endX = anchorX + anchorRight;

        this.startY = anchorY - anchorBottom;
        this.endY = anchorY + anchorTop;

        this._viewMoved('zoom');
    };

    fit = () => {
        if (!Array.isArray(this.plot.data.sets)) return;
        if (!this.plot.canvas) return;

        const datasets = this.plot.data.sets;

        let minX = datasets
            .map(({ data }) => data[0].x)
            .reduce((a, b) => Math.min(a, b));
        let maxX = datasets
            .map(({ data }) => data[data.length - 1].x)
            .reduce((a, b) => Math.max(a, b));
        let maxY = 0;
        let minY = Number.MAX_VALUE;

        for (let j = 0; j < datasets.length; j++) {
            let set = datasets[j].data;
            for (let i = 0; i < set.length; i++) {
                let d = set[i].y;
                if (d > maxY) maxY = d;
                if (d < minY) minY = d;
            }
        }

        this.startX = minX;
        this.endX = maxX;
        this.startY = minY;
        this.endY = maxY;

        this._viewMoved('fit');
    };

    _viewMoved = (type?: string) => {
        this.plot.events.fireEvent('viewMoved', {
            type: type,
            x1: this.startX,
            x2: this.endX,
            y1: this.startY,
            y2: this.endY,
        });
    };

    start = () => {
        requestAnimationFrame(this.render);
    };

    _clearRect = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
    ) => {
        let bg = this.plot.options.backgroundColor;
        if (this.fullscreen && (!bg || bg === 'none')) {
            bg = '#FFF';
        }
        if (!bg || bg === 'none') {
            ctx.clearRect(x, y, w, h);
        } else {
            ctx.fillStyle = bg;
            ctx.fillRect(x, y, w, h);
        }
    };

    distance = (p1: IPoint, p2: IPoint) => {
        let dx = Math.abs(p1.x - p2.x);
        let dy = Math.abs(p1.y - p2.y);
        return Math.sqrt(dx * dx + dy * dy);
    };

    findUnderMouse = (msx: number, msy: number) => {
        if (
            msx === null ||
            msx < this.paddingLeft ||
            msx > this.plot.canvas.width - this.paddingRight ||
            msy < this.paddingTop ||
            msy > this.plot.canvas.height - this.paddingBottom
        ) {
            this.selectedX = null;
            this.selectedY = null;
            return;
        }

        const { data } = this.plot;
        const { sets } = data;

        const range = 10;

        let scanStartScreen = msx - range;
        let scanEndScreen = msx + range;

        let scanStartData = this.screenToDataX(scanStartScreen);
        let scanEndData = this.screenToDataX(scanEndScreen);

        let mouseScreenPoint = { x: msx, y: msy };

        let nearestPoint: IPoint = null;
        let smallestDistance = Number.MAX_VALUE;

        sets.forEach(set => {
            let startIndex = data.binarySearch(
                set.downsampledData,
                scanStartData,
            );
            let endIndex = data.binarySearch(set.downsampledData, scanEndData);

            if (startIndex === -1 || endIndex === -1) return;

            for (let i = startIndex; i <= endIndex; i++) {
                let p = set.downsampledData[i];
                let ps = {
                    x: this.dataToScreenX(p.x),
                    y: this.dataToScreenY(p.y),
                };
                let dist = this.distance(ps, mouseScreenPoint);
                if (!nearestPoint || dist < smallestDistance) {
                    nearestPoint = p;
                    smallestDistance = dist;
                }
            }
        });

        if (nearestPoint === null) {
            this.selectedX = null;
            this.selectedY = null;
            return;
        }

        let pointScreenX = this.dataToScreenX(nearestPoint.x);
        let pointScreenY = this.dataToScreenY(nearestPoint.y);

        let deltaX = Math.abs(pointScreenX - msx);
        let deltaY = Math.abs(pointScreenY - msy);

        if (deltaX < range && deltaY < range) {
            this.selectedX = nearestPoint.x;
            this.selectedY = nearestPoint.y;
        } else {
            this.selectedX = null;
            this.selectedY = null;
        }
    };

    drawLinePlot = (set: IDataset, ctx: CanvasRenderingContext2D): number => {
        let data = set.downsampledData;
        let nPoints = 0;

        let inLine = false;

        ctx.strokeStyle = set.color || 'black';

        ctx.beginPath();

        for (let i = 0; i < data.length; i++) {
            let d = data[i];

            if (
                d.x >= this.minX &&
                d.x <= this.maxX &&
                d.y >= this.minY &&
                d.y <= this.maxY
            ) {
                // We are in the visible area, draw the point
                nPoints++;

                let dx = this.dataToScreenX(d.x);
                let dy = this.dataToScreenY(d.y);

                // If in line already, continue it
                if (inLine) {
                    ctx.lineTo(dx, dy);
                }
                // Otherwise we may have to start a new segment
                else {
                    let prev = data[i - 1];

                    if (prev) {
                        // Connecting line to the previous off-screen point
                        let px = this.dataToScreenX(prev.x);
                        let py = this.dataToScreenY(prev.y);
                        ctx.moveTo(px, py);
                        ctx.lineTo(dx, dy);
                    } else {
                        // New standalone point with no previous
                        ctx.moveTo(dx, dy);
                    }

                    inLine = true;
                }
            } else {
                if (inLine) {
                    // We just went off the edge of the screen, draw this last point
                    let dx = this.dataToScreenX(d.x);
                    let dy = this.dataToScreenY(d.y);

                    ctx.lineTo(dx, dy);
                }

                inLine = false;
            }
        }

        ctx.stroke();

        return nPoints;
    };

    drawPointPlot = (set: IDataset, ctx: CanvasRenderingContext2D): number => {
        let nPoints = 0;

        let start = this.plot.data.binarySearch(
            set.downsampledData,
            this.minX,
            1,
        );
        let end = this.plot.data.binarySearch(
            set.downsampledData,
            this.maxX,
            -1,
        );

        ctx.fillStyle = set.color || 'black';

        for (let i = start; i < end; i++) {
            let d = set.downsampledData[i];

            nPoints++;

            let dx = this.dataToScreenX(d.x);
            let dy = this.dataToScreenY(d.y);

            ctx.fillRect(dx - 2, dy - 2, 4, 4);

            // Actual circles are incredibly slow
            //ctx.moveTo(dx, dy);
            //ctx.arc(dx, dy, 2, 0, Math.PI * 2);
            //ctx.fill();
        }

        return nPoints;
    };

    render = () => {
        this._updateCalculations();

        const { canvas, options } = this.plot;
        const datasets = this.plot.data.sets;

        if (!datasets || !canvas || !canvas.getContext) return;

        const ctx = canvas.getContext('2d');
        const zeroX = this.dataToScreenX(0);
        const zeroY = this.dataToScreenY(0);

        // Clear
        this._clearRect(ctx, 0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(0.5, 0.5);

        // Draw lines to points
        /*data.filter(d => (
			d.x > this.minX &&
			d.x < this.maxX &&
			d.y > this.minY &&
			d.y < this.maxY
		)).map(d => {
			//let ssd = this.dataToScreenSpace(d);
			let dx = this.dataToScreenX(d.x);
			let dy = this.dataToScreenY(d.y);
			ctx.lineTo(dx, dy);
		})*/

        let t0;
        let DEBUG = options.logging;
        if (DEBUG) t0 = performance.now();
        let nPoints = 0;

        for (let j = 0; j < datasets.length; j++) {
            let set = datasets[j];

            if (set.type === EPlotType.Line) {
                nPoints += this.drawLinePlot(set, ctx);
            } else if (set.type === EPlotType.Point) {
                nPoints += this.drawPointPlot(set, ctx);
            }
        }

        if (DEBUG) {
            let t1 = performance.now();
            if (this.BENCH.length >= 30) {
                let avg =
                    this.BENCH.reduce((acc, el) => acc + el) /
                    this.BENCH.length;
                console.log(
                    `Drawing ${nPoints} points took %c${avg.toPrecision(3)}ms`,
                    'color: blue;',
                );
                this.BENCH = [];
            }
            this.BENCH.push(t1 - t0);
        }

        // Clear out margins in case of data hanging off the edge
        this._clearRect(ctx, 0, -1, canvas.width, this.paddingTop);
        this._clearRect(ctx, 0, 0, this.paddingLeft, canvas.height);
        this._clearRect(
            ctx,
            0,
            canvas.height,
            canvas.width,
            -this.paddingBottom,
        );
        this._clearRect(
            ctx,
            canvas.width,
            0,
            -this.paddingRight,
            canvas.height,
        );

        // Axis labels (todo)
        let rangeX = this.maxX - this.minX;
        let rangeY = this.maxY - this.minY;
        let steps = 5;
        let stepSizeX = Number(Math.floor(rangeX / steps).toPrecision(1));
        let stepSizeY = Number(Math.floor(rangeY / steps).toPrecision(1));
        //let stepSizeRaw = Math.floor(rangeX / steps);
        //let stepSize = Number(stepSizeRaw.toPrecision(1))

        let leftmostX = this.screenToDataX(this.paddingLeft);
        let roundedLeftmostX = Math.floor(leftmostX / stepSizeX) * stepSizeX;

        let bottommostY = this.screenToDataY(
            canvas.height - this.paddingBottom,
        );
        let roundedBottommostY =
            Math.floor(bottommostY / stepSizeY) * stepSizeY;

        let mx = roundedLeftmostX;
        let my = roundedBottommostY;

        ctx.strokeStyle = options.lineColor || 'lightgrey';
        ctx.fillStyle = options.textColor || 'black';

        ctx.textAlign = 'left';
        ctx.font = '14px sans-serif';
        ctx.fillText(
            `Start: ${my}; Step: ${stepSizeY};`,
            this.paddingLeft + 10,
            this.paddingTop + 24,
        );

        for (let i = 0; i < steps * 2; i++) {
            let dx = mx + stepSizeX * i;
            let x = this.dataToScreenX(dx);
            let yTop = canvas.height - this.paddingBottom;
            if (
                x >= this.paddingLeft &&
                x <= canvas.width - this.paddingRight
            ) {
                ctx.beginPath();
                ctx.moveTo(x, yTop);
                ctx.lineTo(x, yTop + 10);
                ctx.stroke();
                ctx.fillText(`${dx}`, x - 4, yTop + 24);
            }
        }

        for (let i = 0; i < steps * 2; i++) {
            let dy = my + stepSizeY * i;
            let y = this.dataToScreenY(dy);
            if (
                y >= this.paddingTop &&
                y <= canvas.height - this.paddingBottom
            ) {
                ctx.beginPath();
                ctx.moveTo(this.paddingLeft, y);
                ctx.lineTo(this.paddingLeft - 10, y);
                ctx.stroke();
                ctx.textAlign = 'right';
                ctx.fillText(`${dy}`, this.paddingLeft - 15, y + 7);
            }
        }

        // Axis names
        // X
        ctx.textAlign = 'center';
        ctx.fillText(options.xLabel, canvas.width / 2, canvas.height - 5);
        // Y
        ctx.save();
        ctx.translate(19, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(options.yLabel, 0, 0);
        ctx.restore();

        // Dataset names
        let totalLength = this.paddingLeft;
        let spacing = 20;
        let baseline = 20;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';

        for (let i = 0; i < datasets.length; i++) {
            let d = datasets[i];
            ctx.fillStyle = d.color;
            ctx.fillRect(totalLength, baseline - 11, 10, 10);
            totalLength += 15;
            ctx.fillText(d.name, totalLength, baseline);
            totalLength += ctx.measureText(d.name).width + spacing;
        }

        ctx.fillStyle = options.textColor || 'black';

        // Draw bounds around graph area (temporary?)
        ctx.strokeStyle = options.lineColor || 'lightgrey';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.strokeRect(
            this.paddingLeft,
            this.paddingTop,
            this.plotWidth,
            this.plotHeight,
        );

        // Draw zoom box (if dragging zoom)
        if (this.plot.interaction.draggingZoom === true) {
            let i = this.plot.interaction;

            ctx.setLineDash([5, 10]);
            ctx.strokeRect(
                i.zoomStartX,
                i.zoomStartY,
                i.zoomDeltaX,
                i.zoomDeltaY,
            );
            ctx.setLineDash([]);
        }

        // Axes
        ctx.strokeStyle = options.lineColor || 'lightgrey';

        //  Draw x axis
        if (this.minY < 0 && this.maxY > 0) {
            ctx.beginPath();
            ctx.moveTo(this.paddingLeft, zeroY);
            ctx.lineTo(this.paddingLeft + this.plotWidth, zeroY);
            ctx.stroke();
        }

        // Draw y axis
        if (this.minX < 0 && this.maxX > 0) {
            ctx.beginPath();
            ctx.moveTo(zeroX, this.paddingTop);
            ctx.lineTo(zeroX, this.paddingTop + this.plotHeight);
            ctx.stroke();
        }

        // Draw fullscreen button
        if (this.fullscreenImg) {
            ctx.drawImage(
                this.fullscreenImg,
                this.fullscreenIconX,
                this.iconY,
                this.iconSize,
                this.iconSize,
            );
        }

        // Draw camera button
        if (this.cameraImg) {
            ctx.drawImage(
                this.cameraImg,
                this.cameraIconX,
                this.iconY,
                this.iconSize,
                this.iconSize,
            );
        }

        if (this.selectedX !== null && this.selectedY !== null) {
            let x = this.dataToScreenX(this.selectedX);
            let y = this.dataToScreenY(this.selectedY);

            //ctx.strokeStyle = 'red';
            //ctx.beginPath();
            //ctx.moveTo(x, yUp);
            //ctx.lineTo(x, yDown);
            //ctx.stroke();
            ctx.fillStyle = 'lightgrey';
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.save();

            ctx.fillStyle = '#FFF';
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowOffsetY = 2;

            let string1 = `x: ${this.selectedX}`;
            let string2 = `y: ${this.selectedY}`;

            let padding = 10;
            let maxTextWidth = 250;
            let maxWidth = maxTextWidth + padding * 2;

            let w1 = ctx.measureText(string1).width;
            let w2 = ctx.measureText(string2).width;
            let w = Math.min(Math.max(w1, w2) + padding * 2, maxWidth);
            let h = 14 * 2 + padding * 2 + 10;
            let cornerX = x + (x < maxWidth ? 10 : -w - 10);
            let cornerY = Math.max(y - h - 10, 10);

            ctx.fillRect(cornerX, cornerY, w, h);
            ctx.restore();

            ctx.fillStyle = 'black';
            ctx.fillText(
                string1,
                cornerX + padding,
                cornerY + 14 + padding,
                maxWidth,
            );
            ctx.fillText(
                string2,
                cornerX + padding,
                cornerY + h - padding,
                maxWidth,
            );
        }

        ctx.restore();

        // Next frame
        requestAnimationFrame(this.render);
    };

    takeSnapshot = () => {
        let src = this.plot.canvas.toDataURL(); //('image/png').replace('image/png', 'image/octet-stream');
        let link = document.createElement('a');
        link.href = src;
        link.download = 'myplot.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}

export default Viewport;
