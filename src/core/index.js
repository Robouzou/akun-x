'use strict';

import EventEmitter from 'eventemitter3';
import Settings from './settings';
import ObserverDOM from './observerDOM';
import ObserverNet from './observerNet';

const EVENTS = {
	FOCUS: 'focus'
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
}
