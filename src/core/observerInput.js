'use strict';

export const EVENTS = {
	INPUT: {
		KEYBIND: 'keybind'
	}
};

const EXTRA_ACCEPTED_CODES = [
	'escape',
	'enter'
];

export default class ObserverInput {
	constructor(eventEmitter) {
		this._eventEmitter = eventEmitter;

		document.addEventListener('keyup', this._onKeyPress.bind(this));
	}

	_onKeyPress(e) {
		if (!ObserverInput._isTextInput(e.target)) {
			// console.log(e);
			const keybind = ObserverInput.getKeyBindFromEvent(e);
			if (keybind) {
				this._eventEmitter.emit(EVENTS.INPUT.KEYBIND, keybind, e);
			}
		}
	}

	static getKeyBindFromEvent(e) {
		let code = e.code.toLowerCase();
		const keyMatch = code.match(/^key([A-z]+)/i);
		if (keyMatch) {
			code = keyMatch[1];
		} else if (EXTRA_ACCEPTED_CODES.indexOf(code) === -1) {
			return null;
		}
		// Use undefined instead of false to reduce size of settings in localStorage
		return {
			key: code,
			ctrl: e.ctrlKey ? true : undefined,
			shift: e.shiftKey ? true : undefined,
			alt: e.altKey ? true : undefined,
			meta: e.metaKey ? true : undefined
		};
	}

	static _isTextInput(node) {
		if (node.nodeName === 'INPUT') {
			return true;
		}
		if (node.nodeName === 'TEXTAREA') {
			return true;
		}
		if (node.classList.contains('chatInput')) {
			return true;
		}
		if (node.classList.contains('fieldEditor')) {
			return true;
		}
		return false;
	}
}
