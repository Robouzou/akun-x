'use strict';

const MODULE_ID = 'anonToggle';

const CSS = `
.akun-x-anon-toggle {
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}

.akun-x-anon-toggle .avatar{
	margin-right: 4px;
	display: inline;
	-webkit-border-radius: 2em;
    -moz-border-radius: 2em;
    -ms-border-radius: 2em;
	border-radius: 2em;
	position: relative;
	top: -1px;
}`;

export default class AnonToggle {
	constructor(core, settings) {
		this._core = core;
		this._settings = settings;
		this._initialiseSettings();
		this._onClickShouldSetToAnon = false;
		this._styleElement = null;
		this._toggleElement = null;
		this._avatarElement = null;
		this._usernameElement = null;
		this._addCSS();
		this._createToggleElement();
		this._core.on('focus', this._onFocus, this);
		this._core.on('dom.added.chatHeader', this._onAddedChatHeader, this);
	}

	static get id() {
		return MODULE_ID;
	}

	_initialiseSettings() {
	}

	_addCSS() {
		this._styleElement = document.createElement('style');
		this._styleElement.id = 'akun-x-anon-toggle-css';
		this._styleElement.textContent = CSS;
		document.querySelector('head').appendChild(this._styleElement);
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
		const currentUser = AnonToggle._getCurrentUser();
		currentUser['profile']['asAnon'] = this._onClickShouldSetToAnon;
		this._updateProfileSettings(currentUser['profile']);
		this._updateToggleElement(currentUser);
	}

	_onFocus() {
		const currentUser = AnonToggle._getCurrentUser();
		const asAnon = localStorage.getItem('akun-x-anon-toggle-as-anon');
		if (asAnon !== null) {
			currentUser['profile']['asAnon'] = asAnon === 'true';
		}
		this._updateToggleElement(currentUser);
	}

	_onAddedChatHeader(node) {
		node.querySelector('.pagination-dropdown').appendChild(this._toggleElement);
		const currentUser = AnonToggle._getCurrentUser();
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

	static _getCurrentUser() {
		// This returns reference to what Akun is using
		return $(document)['scope']()['currentUser'];
	}
}
