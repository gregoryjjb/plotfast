// Log10 Polyfill
// Courtesy of MDN
const log10 = function(x: number): number {
    return Math.log(x) * Math.LOG10E;
};

/**
 * Get the number of digits from a number
 * @param {number} x Number to examine
 */
export const numDigits = (x: number) => {
    return Math.max(Math.floor(log10(Math.abs(x))), 0) + 1;
};

/**
 * DEPRICATED, use Number.toPrecision(n) instead
 * @param {*} x Number to round
 * @param {*} n Digits to round to
 */
export const round = (x: number, n: number) => {
    if (typeof n != 'number') n = numDigits(x) - 1;
    let roundTo = Math.pow(10, n);
    return Math.round(x / roundTo) * roundTo;
};

export const clamp = (n: number, min: number, max: number) => {
    return Math.min(Math.max(n, min), max);
};

export const benchmark = (f: Function, args: Array<any>, name: string) => {
    const t0 = performance.now();
    const result = f(...args);
    const t1 = performance.now();
    let t = (t1 - t0).toPrecision(3);
    console.log(`${name} took ${t}ms`);
};

export default { numDigits, round };
