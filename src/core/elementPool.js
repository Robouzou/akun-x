'use strict';

export default class ElementPool {
	constructor(element) {
		this._element = element;
		this._pool = new Set();
		this._eventListeners = new Map();
	}

	get template() {
		return this._element;
	}

	getElement() {
		for (let element of this._pool) {
			// Check if the node is a descendant of the document
			if (!document.contains(element)) {
				// If it isn't then recycle it
				return element;
			}
		}
		return this._createNewElement();
	}

	forEach(callback) {
		callback(this._element);
		for (let element of this._pool) {
			callback(element);
		}
	}

	addEventListener(event, listener) {
		if (!this._eventListeners.has(event)) {
			this._eventListeners.set(event, new Set());
		}
		this._eventListeners.get(event).add(listener);
		for (let element of this._pool) {
			element.addEventListener(event, listener);
		}
	}

	removeEventListener(event, listener) {
		this._eventListeners.get(event).delete(listener);
		if (this._eventListeners.get(event).size === 0) {
			this._eventListeners.delete(event);
		}
	}

	_createNewElement() {
		const element = this._element.cloneNode(true);
		this._eventListeners.forEach((listeners, event) => {
			for (let listener of listeners) {
				element.addEventListener(event, listener);
			}
		});
		this._pool.add(element);
		return element;
	}
}
