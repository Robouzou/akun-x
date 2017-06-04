'use strict';

import EventEmitter from 'eventemitter3';
import Settings from './settings';
import ObserverDOM from './observerDOM';
import ObserverNet from './observerNet';

const EVENTS = {
	FOCUS: 'focus'
};

const THEMES = {
	LIGHT: 'snowdrift',
	DARK: 'dark'
};

export default class Core extends EventEmitter {
	constructor() {
		super();
		this._settings = new Settings(this);
		this._observerDOM = new ObserverDOM(this);
		this._observerNet = new ObserverNet(this);
		this._modules = {};

		window.onfocus = () => {
			this.emit(EVENTS.FOCUS);
		}
	}

	addModule(module) {
		const id = module.id;
		this._modules[id] = new module(this);
	}

	get settings() {
		return this._settings;
	}

	get currentUser() {
		// This returns reference to what Akun is using
		return $(document)['scope']()['currentUser'];
	}

	get theme() {
		return /themeColor=("|%22)?dark("|%22)?/i.test(document.cookie) ? THEMES.DARK : THEMES.LIGHT;
	}

	get EVENTS() {
		return EVENTS;
	}

	get THEMES() {
		return THEMES;
	}
}
