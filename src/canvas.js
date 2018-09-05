
export default function canvas(el, width, height) {
	
	const c = document.createElement('canvas');
	c.width = width;
	c.height = height;
	
	if(containerEl && containerEl.nodeType) {
		containerEl.appendChild(this.canvas);
	}
	
	return c;
}