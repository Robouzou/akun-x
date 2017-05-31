'use strict';

import './settings.css';

const LOCAL_STORAGE_KEY = 'akun-x';

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
		this._core.on('dom.added.mainMenu', this._onAddedMainMenu.bind(this));
	}

	addModule(moduleSettings, callback) {
		const moduleId = moduleSettings.id;
		const settings = {};
		for (let settingName in moduleSettings.settings) {
			if (moduleSettings.settings.hasOwnProperty(settingName)) {
				settings[settingName] = moduleSettings.settings[settingName];
				let loadedSettings = this._loadSettings[moduleId] && this._loadSettings[moduleId][settingName];
				// If different types assume module has changed and default should be used
				if (loadedSettings && typeof loadedSettings.value === typeof settings[settingName].value) {
					settingName[settingName].value = loadedSettings.value;
				}
			}
		}
		this._settings[moduleId] = settings;
		this._createModuleHTML(moduleSettings);
		this._moduleCallbacks[moduleId] = callback;
		return settings;
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
				nameNode.textContent = setting.name;
				settingNode.appendChild(nameNode);
				let descriptionNode = document.createElement('div');
				descriptionNode.textContent = setting.description;
				settingNode.appendChild(descriptionNode);
				let valueNode;
				switch (setting.type) {
					case 'boolean':
						valueNode = document.createElement('input');
						valueNode.type = 'checkbox';
						valueNode.dataset.id = settingName;
						valueNode.dataset.type = setting.type;
						valueNode.checked = setting.value;
						settingNode.appendChild(valueNode);
						break;
					case 'array':
						valueNode = document.createElement('textarea');
						valueNode.dataset.id = settingName;
						valueNode.dataset.type = setting.type;
						valueNode.value = setting.value.join('\n');
						settingNode.appendChild(valueNode);
						break;
				}
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
		headerNode.appendChild(exitNode);
		menuNode.appendChild(bodyNode);
		bodyNode.appendChild(moduleListNode);
		bodyNode.appendChild(moduleDetailsContainerNode);

		exitNode.addEventListener('click', this._exitCallback.bind(this));
		moduleListNode.addEventListener('click', this._moduleListCallback.bind(this));
		moduleDetailsContainerNode.addEventListener('click', this._moduleDetailsCallback.bind(this));

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
		// Set settings menu CSS
		// this._menuNode.style.backgroundColor = window.getComputedStyle(document.getElementById('left')).backgroundColor;
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
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this._storageSettings));
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

	_moduleDetailsCallback(e) {
	}
}
