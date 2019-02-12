export default function canvas(
    el: HTMLElement,
    width: number | 'fill',
    height: number | 'fill',
): HTMLCanvasElement {
    const c = document.createElement('canvas');

    const getFillWidth = () =>
        Number(getComputedStyle(el).width.replace('px', ''));
    const getFillHeight = () =>
        Number(getComputedStyle(el).height.replace('px', ''));

    if (width === 'fill') {
        c.width = getFillWidth();
    } else {
        c.width = width | 640;
    }

    if (height === 'fill') {
        c.height = getFillHeight();
    } else {
        c.height = height | 480;
    }

    c.setAttribute('tabindex', '1');

    if (el && el.nodeType) {
        el.appendChild(c);
    }

    window.addEventListener('resize', () => {
        if (width === 'fill') c.width = getFillWidth();
        if (height === 'fill') c.width = getFillHeight();
    });

    return c;
}
