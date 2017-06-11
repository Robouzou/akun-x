'use strict';

import EventEmitter from 'eventemitter3';
import Settings from './settings';
import {default as ObserverDOM, EVENTS as DOM_EVENTS} from './observerDOM';
import {default as ObserverInput, EVENTS as INPUT_EVENTS} from './observerInput';
import {default as ObserverNet, EVENTS as NET_EVENTS} from './observerNet';

const EVENTS = {
	FOCUS: 'focus'
};
Object.assign(EVENTS, DOM_EVENTS, INPUT_EVENTS, NET_EVENTS);

const THEMES = {
	LIGHT: 'snowdrift',
	DARK: 'dark'
};

export default class Core extends EventEmitter {
	constructor() {
		super();
		this._observerDOM = new ObserverDOM(this);
		this._observerInput = new ObserverInput(this);
		this._observerNet = new ObserverNet(this);
		this._settings = new Settings(this);
		this._modules = {};

		window.onfocus = () => {
			this.emit(EVENTS.FOCUS);
		};
	}

	addModule(module) {
		const id = module.id;
		this._modules[id] = new module(this);
	}

	get settings() {
		return this._settings;
	}

	get dom() {
		return this._observerDOM;
	}

	get input() {
		return this._observerInput;
	}

	get net() {
		return this._observerNet;
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

	get isAuthor() {
		return new Promise((resolve, reject) => {
			const poll = () => {
				const isAuthor = $(document)['scope']()['isAuthor'];
				if (isAuthor === undefined) {
					setTimeout(poll, 10);
				} else {
					resolve(isAuthor);
				}
			};
			poll();
		});
	}
}
