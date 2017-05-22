'use strict';

import EventEmitter from 'eventemitter3';
import ObserverDOM from './observerDOM';

class Core extends EventEmitter {
	constructor() {
		super();
		this._observerDOM = new ObserverDOM(this);
		this._modules = {};
	}

	addModule(module){
		this._modules[module.id] = new module(this);
	}
}

export {Core};
