export default function canvas(
    el: HTMLElement,
    width: number,
    height: number,
): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = width || 640;
    c.height = height || 480;

    c.setAttribute('tabindex', '1');

    if (el && el.nodeType) {
        el.appendChild(c);
    }

    return c;
}