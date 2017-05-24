'use strict';

import EventEmitter from 'eventemitter3';
import ObserverDOM from './observerDOM';
import ObserverNet from './observerNet';

const LOCAL_STORAGE_KEY = 'akun-x';

const EVENTS = {
	FOCUS: 'focus'
};

export default class Core extends EventEmitter {
	constructor() {
		super();
		this._observerDOM = new ObserverDOM(this);
		this._observerNet = new ObserverNet(this);
		this._modules = {};
		this._settings = {};

		this._loadSettings();

		window.onfocus = () => {
			this.emit(EVENTS.FOCUS);
		}
	}

	addModule(module) {
		const id = module.id;
		if (!this._settings[id]) {
			this._settings[id] = {};
		}
		this._modules[id] = new module(this, this._settings[id]);
	}

	_loadSettings() {
		let settings;
		try {
			settings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
		} catch (err) {
			// Don't care
		}
		this._settings = settings || {};
	}

	_saveSettings() {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this._settings));
	}
}
