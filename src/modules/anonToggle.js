'use strict';

import {SETTING_TYPES} from '../core/settings';
import './anonToggle.css';

const MODULE_ID = 'anonToggle';

const SETTING_IDS = {
	ENABLED: 'enabled'
};

const DEFAULT_SETTINGS = {
	name: 'Anon Toggle',
	id: MODULE_ID,
	settings: {}
};

DEFAULT_SETTINGS.settings[SETTING_IDS.ENABLED] = {
	name: 'Enabled',
	description: 'Turn the Anon Toggle module on or off.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

export default class AnonToggle {
	constructor(core) {
		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS, this._onSettingsChanged.bind(this));
		this._onClickShouldSetToAnon = false;
		this._toggleElement = null;
		this._avatarElement = null;
		this._usernameElement = null;
		this._createToggleElement();
		this._toggleElementPool = new Set();
		if (this._settings[SETTING_IDS.ENABLED].value) {
			this._enable();
		}
		this._boundToggleClickCallback = this._toggleClickCallback.bind(this);
	}

	static get id() {
		return MODULE_ID;
	}

	_onSettingsChanged(settingId) {
		switch (settingId) {
			case SETTING_IDS.ENABLED:
				if (this._settings[SETTING_IDS.ENABLED].value) {
					this._enable();
				} else {
					this._disable();
				}
				break;
		}
	}

	_enable() {
		// Don't do anything if the user isn't logged in (and thus doesn't have any settings available)
		if (this._core.currentUser) {
			this._core.dom.nodes('chatHeader').forEach(this._onAddedChatHeader, this);
			this._core.on(this._core.EVENTS.FOCUS, this._onFocus, this);
			this._core.on(this._core.EVENTS.DOM.ADDED.CHAT_HEADER, this._onAddedChatHeader, this);
		}
	}

	_disable() {
		this._core.removeListener(this._core.EVENTS.FOCUS, this._onFocus, this);
		this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAT_HEADER, this._onAddedChatHeader, this);
		document.querySelectorAll('.akun-x-anon-toggle').forEach(node => {
			delete node.parentNode.dataset[AnonToggle.id];
			node.parentNode.removeChild(node);
		});
	}

	_createToggleElement() {
		const toggleElement = document.createElement('div');
		toggleElement.classList.add('akun-x-anon-toggle', 'noselect', 'btn', 'dim-font-color', 'hover-font-color');
		const avatarElement = document.createElement('img');
		avatarElement.classList.add('avatar');
		const usernameElement = document.createElement('span');
		usernameElement.classList.add('username');
		toggleElement.appendChild(avatarElement);
		toggleElement.appendChild(usernameElement);
		this._toggleElement = toggleElement;
		this._avatarElement = avatarElement;
		this._usernameElement = usernameElement;
	}

	_getToggleElement() {
		for (let toggleElement of this._toggleElementPool) {
			// Check if the node is a descendant of the document
			if (!document.contains(toggleElement)) {
				// If it isn't then recycle it
				return toggleElement;
			}
		}
		const toggleElement = this._toggleElement.cloneNode(true);
		toggleElement.addEventListener('click', this._boundToggleClickCallback);
		this._toggleElementPool.add(toggleElement);
		return toggleElement;
	}

	_toggleClickCallback(e) {
		const currentUser = this._core.currentUser;
		currentUser['profile']['asAnon'] = this._onClickShouldSetToAnon;
		this._updateProfileSettings(currentUser['profile']);
		this._updateToggleElement(currentUser);
	}

	_onFocus() {
		const currentUser = this._core.currentUser;
		const asAnon = localStorage.getItem('akun-x-anon-toggle-as-anon');
		if (asAnon !== null) {
			currentUser['profile']['asAnon'] = asAnon === 'true';
		}
		this._updateToggleElement(currentUser);
	}

	_onAddedChatHeader(node) {
		node.querySelector('.pagination-dropdown').appendChild(this._getToggleElement());
		const currentUser = this._core.currentUser;
		this._updateToggleElement(currentUser);
	}

	_updateProfileSettings(profile) {
		localStorage.setItem('akun-x-anon-toggle-as-anon', profile['asAnon']);
		ty.put('user', profile);
	}

	_updateToggleElement(currentUser) {
		if (currentUser['profile']['asAnon']) {
			this._onClickShouldSetToAnon = false;
			this._usernameElement.textContent = 'Anon';
			this._avatarElement.style.display = 'none';
			for (let toggleElement of this._toggleElementPool) {
				toggleElement.querySelector('.username').textContent = 'Anon';
				toggleElement.querySelector('.avatar').style.display = 'none';
			}
		} else {
			this._onClickShouldSetToAnon = true;
			this._usernameElement.textContent = currentUser['username'];
			this._avatarElement.style.display = 'inline';
			let avatarSrc = currentUser['profile']['image'];
			if (/cloudfront\.net/.test(avatarSrc)) {
				const match = avatarSrc.match(/cloudfront.net\/images\/([A-z0-9_\.]+)/);
				avatarSrc = `https://cdn.fiction.live/h16-w16-cfill/images/${match && match[1]}`;
			} else if (/filepicker\.io/.test(avatarSrc)) {
				avatarSrc += '/convert?w=16&h=16&fit=crop&cache=true';
			}
			this._avatarElement.src = avatarSrc;
			for (let toggleElement of this._toggleElementPool) {
				toggleElement.querySelector('.username').textContent = currentUser['username'];
				const avatarNode = toggleElement.querySelector('.avatar');
				avatarNode.style.display = 'inline';
				avatarNode.src = avatarSrc;
			}
		}
	}
}
