
export default function canvas(el, width, height) {
	
	const c = document.createElement('canvas');
	c.width = width || 640;
	c.height = height || 480;
	
	if(el && el.nodeType) {
		el.appendChild(c);
	}
	
	return c;
}