'use strict';

import {makeElastic, doesObjectShareValues} from './utils';
import './settings.pcss';

const LOCAL_STORAGE_KEY = 'akun-x';

export const SETTING_TYPES = {
	BOOLEAN: 'boolean',
	ARRAY: 'array',
	KEYBIND: 'keybind'
};

const SETTING_IDS = {
	KEYBIND_OPEN: 'keybind_open',
	KEYBIND_CLOSE: 'keybind_close'
};

const THIS_ID = 'settings';

const DEFAULT_SETTINGS = {
	name: 'Settings',
	id: THIS_ID,
	settings: {
		[SETTING_IDS.KEYBIND_OPEN]: {
			name: 'Open Keybind',
			description: 'The keybind used to open the settings menu.',
			type: SETTING_TYPES.KEYBIND,
			value: { key: 'o' }
		},
		[SETTING_IDS.KEYBIND_CLOSE]: {
			name: 'Close Keybind',
			description: 'The keybind used to close the settings menu.',
			type: SETTING_TYPES.KEYBIND,
			value: { key: 'escape' }
		}
	}
};

/* Modules have default settings. When loading the locally stored settings, these defaults should be overridden where
 *   there are locally stored settings to do so.
 * If there are locally stored settings with no corresponding default these should be presumed to be caused by changes
 *   in setting structure and discarded to avoid bloating the storage.
 * The same is true for when settings stored under a module id don't have a corresponding module added.
 * Also, when storing settings only the key and value should be stored, and other immutable metadata should only be
 *   provided by the default settings.
 */

export default class Settings {
	constructor(core) {
		this._core = core;
		this._styleElement = null;
		this._settings = {};
		this._loadedSettings = {};
		this._loadSettings();
		this._moduleCallbacks = {};
		this._backdropNode = null;
		this._menuNode = null;
		this._moduleListNode = null;
		this._moduleDetailsContainerNode = null;
		this._createMenu();
		this._hideMenu();
		document.body.appendChild(this._backdropNode);
		this._onAddedMainMenu(this._core.dom.node('mainMenu'));
		this._core.on(this._core.EVENTS.DOM.ADDED.MAIN_MENU, this._onAddedMainMenu.bind(this));
		this._core.on(this._core.EVENTS.INPUT.KEYBIND, this._onKeypress, this);
		this.addModule(DEFAULT_SETTINGS, this._onSettingsChanged.bind(this));
	}

	addModule(moduleSettings, callback) {
		const moduleId = moduleSettings.id;
		const settings = {};
		for (let settingName in moduleSettings.settings) {
			if (moduleSettings.settings.hasOwnProperty(settingName)) {
				settings[settingName] = moduleSettings.settings[settingName];
				let loadedSettings = this._loadedSettings[moduleId] && this._loadedSettings[moduleId][settingName];
				// If different types assume module has changed and default should be used
				if (loadedSettings && typeof loadedSettings.value === typeof settings[settingName].value) {
					settings[settingName].value = loadedSettings.value;
				}
			}
		}
		this._settings[moduleId] = settings;
		this._createModuleHTML(moduleSettings);
		this._moduleCallbacks[moduleId] = callback;
		return settings;
	}

	_onSettingsChanged(settingId) {
	}

	_createModuleHTML(moduleSettings) {
		const moduleListItemNode = document.createElement('li');
		moduleListItemNode.textContent = moduleSettings.name;
		moduleListItemNode.dataset.id = moduleSettings.id;
		moduleListItemNode.classList.add('akun-x-settings-module-list-item');
		const moduleDetailsNode = document.createElement('div');
		moduleDetailsNode.dataset.id = moduleSettings.id;
		moduleDetailsNode.classList.add('akun-x-settings-module-details');
		for (let settingName in moduleSettings.settings) {
			if (moduleSettings.settings.hasOwnProperty(settingName)) {
				let setting = moduleSettings.settings[settingName];
				let settingNode = document.createElement('div');
				moduleDetailsNode.appendChild(settingNode);
				let nameNode = document.createElement('div');
				nameNode.classList.add('akun-x-settings-setting-name');
				nameNode.textContent = setting.name;
				settingNode.appendChild(nameNode);
				let descriptionNode = document.createElement('div');
				descriptionNode.textContent = setting.description;
				let valueNode;
				switch (setting.type) {
					case SETTING_TYPES.BOOLEAN:
						valueNode = document.createElement('input');
						valueNode.type = 'checkbox';
						valueNode.dataset.id = settingName;
						valueNode.dataset.type = setting.type;
						valueNode.style.float = 'left';
						settingNode.appendChild(valueNode);
						settingNode.appendChild(descriptionNode);
						break;
					case SETTING_TYPES.ARRAY:
						valueNode = document.createElement('textarea');
						valueNode.dataset.id = settingName;
						valueNode.dataset.type = setting.type;
						settingNode.appendChild(descriptionNode);
						settingNode.appendChild(valueNode);
						makeElastic(valueNode);
						break;
					case SETTING_TYPES.KEYBIND:
						valueNode = document.createElement('button');
						valueNode.dataset.id = settingName;
						valueNode.dataset.type = setting.type;
						valueNode.classList.add('akun-x-settings-keybind-picker-button', 'btn');
						settingNode.appendChild(descriptionNode);
						settingNode.appendChild(valueNode);
						break;
				}
				Settings._setSettingNodeValue(valueNode, setting.type, setting.value);
			}
		}
		this._moduleListNode.appendChild(moduleListItemNode);
		this._moduleDetailsContainerNode.appendChild(moduleDetailsNode);
	}

	_createMenu() {
		const backdropNode = document.createElement('div');
		backdropNode.classList.add('akun-x-settings-backdrop');
		const horizontalAlignNode = document.createElement('div');
		horizontalAlignNode.classList.add('akun-x-settings-horizontal-align');
		const verticalAlignNode = document.createElement('div');
		verticalAlignNode.classList.add('akun-x-settings-vertical-align');
		const menuNode = document.createElement('div');
		menuNode.classList.add('akun-x-settings');
		const headerNode = document.createElement('div');
		headerNode.classList.add('akun-x-settings-header');
		const titleNode = document.createElement('h3');
		titleNode.classList.add('akun-x-settings-header-title');
		titleNode.textContent = 'AkunX';
		const issuesNode = document.createElement('a');
		issuesNode.classList.add('akun-x-settings-header-issues');
		issuesNode.textContent = 'Issues';
		issuesNode.href = 'https://github.com/Fiddlekins/akun-x/issues';
		const exitNode = document.createElement('button');
		exitNode.classList.add('akun-x-settings-header-exit');
		exitNode.type = 'button';
		exitNode.textContent = '×';
		const bodyNode = document.createElement('div');
		bodyNode.classList.add('akun-x-settings-body');
		const moduleListNode = document.createElement('ul');
		moduleListNode.classList.add('akun-x-settings-module-list');
		const moduleDetailsContainerNode = document.createElement('div');
		moduleDetailsContainerNode.classList.add('akun-x-settings-module-details-container');
		backdropNode.appendChild(horizontalAlignNode);
		horizontalAlignNode.appendChild(verticalAlignNode);
		verticalAlignNode.appendChild(menuNode);
		menuNode.appendChild(headerNode);
		headerNode.appendChild(titleNode);
		headerNode.appendChild(issuesNode);
		headerNode.appendChild(exitNode);
		menuNode.appendChild(bodyNode);
		bodyNode.appendChild(moduleListNode);
		bodyNode.appendChild(moduleDetailsContainerNode);

		exitNode.addEventListener('click', this._exitCallback.bind(this));
		moduleListNode.addEventListener('click', this._moduleListCallback.bind(this));
		moduleDetailsContainerNode.addEventListener('change', this._moduleDetailsChangeCallback.bind(this));
		moduleDetailsContainerNode.addEventListener('click', this._moduleDetailsClickCallback.bind(this));

		this._backdropNode = backdropNode;
		this._menuNode = menuNode;
		this._moduleListNode = moduleListNode;
		this._moduleDetailsContainerNode = moduleDetailsContainerNode;

	}

	_showMenu() {
		this._backdropNode.classList.remove('akun-x-settings-hidden');
		this._moduleListNode.childNodes.forEach(node => {
			node.classList.remove('akun-x-settings-selected');
		});
		this._moduleDetailsContainerNode.childNodes.forEach(node => {
			node.classList.add('akun-x-settings-hidden');
		});
		this._moduleListNode.firstChild.classList.add('akun-x-settings-selected');
		this._moduleDetailsContainerNode.firstChild.classList.remove('akun-x-settings-hidden');
	}

	_hideMenu() {
		this._backdropNode.classList.add('akun-x-settings-hidden');
	}

	_loadSettings() {
		let settings;
		try {
			settings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
		} catch (err) {
			// Don't care
		}
		this._loadedSettings = settings || {};
	}

	_saveSettings() {
		const storageSettings = {};
		for (let moduleId in this._settings) {
			if (this._settings.hasOwnProperty(moduleId)) {
				storageSettings[moduleId] = {};
				for (let settingId in this._settings[moduleId]) {
					if (this._settings[moduleId].hasOwnProperty(settingId)) {
						storageSettings[moduleId][settingId] = {
							value: this._settings[moduleId][settingId].value
						};
					}
				}
			}
		}
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storageSettings));
	}

	_onAddedMainMenu(node) {
		const liNode = document.createElement('li');
		const aNode = document.createElement('a');
		aNode.textContent = 'AkunX';
		liNode.appendChild(aNode);
		liNode.addEventListener('click', this._menuButtonCallback.bind(this));
		node.querySelector('.boardsList').firstChild.appendChild(liNode);
	}

	_menuButtonCallback(e) {
		this._showMenu();
	}

	_exitCallback(e) {
		this._hideMenu();
	}

	_moduleListCallback(e) {
		if (e.target.classList.contains('akun-x-settings-module-list-item')) {
			const moduleId = e.target.dataset.id;
			this._moduleListNode.childNodes.forEach(node => {
				if (node.dataset.id === moduleId) {
					node.classList.add('akun-x-settings-selected');
				} else {
					node.classList.remove('akun-x-settings-selected');
				}
			});
			this._moduleDetailsContainerNode.childNodes.forEach(node => {
				if (node.dataset.id === moduleId) {
					node.classList.remove('akun-x-settings-hidden');
				} else {
					node.classList.add('akun-x-settings-hidden');
				}
			});
		}
	}

	_moduleDetailsChangeCallback(e) {
		const type = e.target.dataset.type;
		const settingId = e.target.dataset.id;
		const moduleId = e.target.closest('.akun-x-settings-module-details').dataset.id;
		let newValue;
		switch (type) {
			case SETTING_TYPES.BOOLEAN:
				newValue = e.target.checked;
				break;
			case SETTING_TYPES.ARRAY:
				newValue = e.target.value.split('\n');
				break;
		}
		this.setSetting(moduleId, settingId, newValue);
	}

	setSetting(moduleId, settingId, value) {
		const valueNode = this._moduleDetailsContainerNode.querySelector(`[data-id="${moduleId}"] [data-id="${settingId}"]`);
		const type = this._settings[moduleId][settingId].type;
		Settings._setSettingNodeValue(valueNode, type, value);
		this._settings[moduleId][settingId].value = value;
		this._moduleCallbacks[moduleId](settingId);
		this._saveSettings();
	}

	static _setSettingNodeValue(node, type, value) {
		switch (type) {
			case SETTING_TYPES.BOOLEAN:
				node.checked = value;
				break;
			case SETTING_TYPES.ARRAY:
				node.value = value.join('\n');
				break;
			case SETTING_TYPES.KEYBIND:
				node.textContent = Settings._getKeybindButtonText(value);
				break;
		}
	}

	_moduleDetailsClickCallback(e) {
		if (e.target.classList.contains('akun-x-settings-keybind-picker-button')) {
			const keybindButton = e.target;
			keybindButton.textContent = 'Please press new keybind';
			const settingId = keybindButton.dataset.id;
			const moduleId = keybindButton.closest('.akun-x-settings-module-details').dataset.id;
			this._core.once(this._core.EVENTS.INPUT.KEYBIND, (keybind) => {
				this.setSetting(moduleId, settingId, keybind);
			});
		}
	}

	static _getKeybindButtonText(keybind) {
		let keys = [];
		if (keybind.ctrl) keys.push('ctrl');
		if (keybind.shift) keys.push('shift');
		if (keybind.alt) keys.push('alt');
		if (keybind.meta) keys.push('meta');
		keys.push(keybind.key.toUpperCase());
		return keys.join(' + ');
	}

	_onKeypress(keybind, e) {
		if (doesObjectShareValues(keybind, this._settings[THIS_ID][SETTING_IDS.KEYBIND_OPEN].value)) {
			this._showMenu();
		}
		if (doesObjectShareValues(keybind, this._settings[THIS_ID][SETTING_IDS.KEYBIND_CLOSE].value)) {
			this._hideMenu();
		}
	}
}
