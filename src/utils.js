
export const numDigits = x => {
	return Math.max(Math.floor(Math.log10(Math.abs(x))), 0) + 1;
}

/**
 * DEPRICATED, use Number.toPrecision(n) instead
 * @param {*} x Number to round
 * @param {*} n Digits to round to
 */
export const round = (x, n) => {
	if(typeof n != 'number')
		n = numDigits(x) - 1;
	let roundTo = Math.pow(10, n);
	return Math.round(x / roundTo) * roundTo;
}

export default { numDigits, round }