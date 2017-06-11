'use strict';

export const makeElastic = (node) => {
	function resize() {
		// Gotta do this the long way since scrollHeight and it's kin are 0 if this is done when the element isn't visible
		const computedStyle = window.getComputedStyle(node);
		const lineCount = node.value.split('\n').length;
		const lineHeight = parseInt(computedStyle.lineHeight, 10);
		const borderTop = parseInt(computedStyle.borderTopWidth, 10);
		const borderBottom = parseInt(computedStyle.borderBottomWidth, 10);
		const paddingTop = parseInt(computedStyle.paddingTop, 10);
		const paddingBottom = parseInt(computedStyle.paddingBottom, 10);
		const height = (lineCount * lineHeight) + borderTop + paddingTop + paddingBottom + borderBottom;
		node.style.height = 'auto';
		node.style.height = height + 'px';
	}

	// 0-timeout to get the already changed text
	function delayedResize() {
		window.setTimeout(resize, 0);
	}

	node.addEventListener('change', resize, false);
	node.addEventListener('cut', delayedResize, false);
	node.addEventListener('paste', delayedResize, false);
	node.addEventListener('drop', delayedResize, false);
	node.addEventListener('keydown', delayedResize, false);

	node.focus();
	node.select();
	delayedResize();
};

export const areObjectsEquivalent = (obj1, obj2) => {
	return doesObjectShareValues(obj1, obj2) && doesObjectShareValues(obj2, obj1);
};

export const doesObjectShareValues = (obj1, obj2) => {
	for (let property in obj1) {
		if (obj1.hasOwnProperty(property) && obj2[property] !== obj1[property]) {
			return false;
		}
	}
	return true;
};
