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
		if (this._settings[SETTING_IDS.ENABLED].value) {
			this._enable();
		}
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
		this._core.on('focus', this._onFocus, this);
		this._core.on('dom.added.chatHeader', this._onAddedChatHeader, this);
	}

	_disable() {
		this._core.removeListener('focus', this._onFocus, this);
		this._core.removeListener('dom.added.chatHeader', this._onAddedChatHeader, this);
	}

	_createToggleElement() {
		const toggleElement = document.createElement('div');
		toggleElement.classList.add('akun-x-anon-toggle', 'noselect', 'btn', 'dim-font-color', 'hover-font-color');
		toggleElement.addEventListener('click', this._toggleClickCallback.bind(this));
		const avatarElement = document.createElement('img');
		avatarElement.classList.add('avatar');
		const usernameElement = document.createElement('span');
		toggleElement.appendChild(avatarElement);
		toggleElement.appendChild(usernameElement);
		this._toggleElement = toggleElement;
		this._avatarElement = avatarElement;
		this._usernameElement = usernameElement;
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
		node.querySelector('.pagination-dropdown').appendChild(this._toggleElement);
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
		} else {
			this._onClickShouldSetToAnon = true;
			this._usernameElement.textContent = currentUser['username'];
			this._avatarElement.style.display = 'inline';
			this._avatarElement.src = `${currentUser['profile']['image']}/convert?w=16&h=16&fit=crop&cache=true`;
		}
	}
}
