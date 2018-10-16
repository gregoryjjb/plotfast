
export const numDigits = x => {
	return Math.max(Math.floor(Math.log10(Math.abs(x))), 0) + 1;
}

export const round = (x, n) => {
	if(typeof n != 'number')
		n = numDigits(x) - 1;
	let roundTo = Math.pow(10, n);
	return Math.round(x / roundTo) * roundTo;
}

export default { numDigits, round }