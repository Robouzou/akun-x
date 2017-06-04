'use strict';

import {SETTING_TYPES} from '../core/settings';
import './chapterHTMLEditor.css';

const MODULE_ID = 'chapterHtmlEditor';

const SETTING_IDS = {
	ENABLED: 'enabled'
};

const DEFAULT_SETTINGS = {
	name: 'Chapter HTML Editor',
	id: MODULE_ID,
	settings: {}
};

DEFAULT_SETTINGS.settings[SETTING_IDS.ENABLED] = {
	name: 'Enabled',
	description: 'Turn the Chapter HTML Editor module on or off.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

export default class ChapterHTMLEditor {
	constructor(core) {
		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS, this._onSettingsChanged.bind(this));
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
		this._core.on('dom.added.chapter', this._onAddedChapter, this);
		this._core.on('dom.added.chapterButtonControls', this._onAddedChapterButtonControls, this);
	}

	_disable() {
		this._core.removeListener('dom.added.chapter', this._onAddedChapter, this);
		this._core.removeListener('dom.added.chapterButtonControls', this._onAddedChapterButtonControls, this);
	}

	_onAddedChapter(node) {
		const buttonGroupNode = node.querySelector('.chapter-footer .btn-group');
		if (buttonGroupNode) {
			this._addEditButton(buttonGroupNode);
		}
	}

	_onAddedChapterButtonControls(node) {
		this._addEditButton(node.querySelector('.btn-group'));
	}

	_addEditButton(node) {
		if (!node.dataset[ChapterHTMLEditor.id] && !node.classList.contains('choice')) {
			node.dataset[ChapterHTMLEditor.id] = true;
			const htmlEditButtonNode = document.createElement('a');
			htmlEditButtonNode.classList.add('akun-x-chapter-html-editor-edit', 'btn', 'very-dim-font-color', 'hover-font-color');
			htmlEditButtonNode.textContent = 'Edit HTML';
			htmlEditButtonNode.addEventListener('click', this._editButtonCallback.bind(this));
			node.insertBefore(htmlEditButtonNode, node.firstChild);
		}
	}

	_editButtonCallback(e) {
		const chapterNode = e.target.closest('.chapter');
		e.target.parentElement.querySelector('.editChapter').click(); // Trigger native site edit behaviour
		const buttonGroupNode = chapterNode.querySelector('.editChapter .btn-group'); // Grab the newly displayed button group
		const fieldEditorNode = chapterNode.querySelector('.fieldEditor');
		fieldEditorNode.textContent = fieldEditorNode.innerHTML; // Override displayed content
		chapterNode.querySelector('.save').style.display = 'none'; // Remove native save button
		const htmlSaveButtonNode = document.createElement('div');
		htmlSaveButtonNode.classList.add('akun-x-chapter-html-editor-save', 'btn', 'btn-primary');
		htmlSaveButtonNode.textContent = 'Save HTML and close';
		htmlSaveButtonNode.addEventListener('click', this._saveButtonCallback.bind(this));
		buttonGroupNode.appendChild(htmlSaveButtonNode); // Add custom save button
	}

	_saveButtonCallback(e) {
		const chapterNode = e.target.closest('.chapter');
		const buttonGroupNode = chapterNode.querySelector('.editChapter .btn-group');
		buttonGroupNode.classList.add('akun-x-chapter-html-editor-disabled');
		ty.post('anonkun/editChapter', {
			'_id': chapterNode.dataset.id,
			'update[$set][b]': chapterNode.querySelector('.fieldEditor').textContent,
			'update[$set][t]': undefined
		}, response => {
			buttonGroupNode.classList.remove('akun-x-chapter-html-editor-disabled');
			buttonGroupNode.querySelector('.cancel').click();
		});
	}
}
