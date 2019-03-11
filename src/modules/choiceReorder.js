'use strict';

import {SETTING_TYPES} from '../core/settings';

const MODULE_ID = 'choiceReorder';

const SETTING_IDS = {
	ENABLED: 'enabled'
};

const DEFAULT_SETTINGS = {
	name: 'Choice Reorder',
	id: MODULE_ID,
	settings: {
		[SETTING_IDS.ENABLED]: {
			name: 'Enabled',
			description: 'Enable sorting of polls where the results were hidden',
			type: SETTING_TYPES.BOOLEAN,
			value: true
		}
	}
};

export default class ChoiceReorder {
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

	static _insertAfter(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}

	static _parseVoteCount(resultNode) {
		const totalVotesNode = resultNode.querySelector('[data-hint="Total Votes"]');
		if (totalVotesNode) {
			return parseInt(totalVotesNode.innerText, 10);
		} else {
			return parseInt(resultNode.innerText, 10);
		}
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
		this._core.on(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
		this._core.on(this._core.EVENTS.REALTIME.CHILD_CHANGED, this._onChildChanged, this);

		this._core.dom.nodes('choice').forEach(this._applyOrder, this);
	}

	_disable() {
		this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
		this._core.removeListener(this._core.EVENTS.REALTIME.CHILD_CHANGED, this._onChildChanged, this);

		this._core.dom.nodes('choice').forEach(this._applyChaos, this);
	}

	_onAddedChapter(node) {
		if (node.classList.contains('choice')) {
			this._applyOrder(node);
		}
	}

	_onChildChanged(json) {
		if (json['nt'] && json['nt'] === 'choice') {
			if (json['closed']) {
				// Make sure that we're not trying to apply changes before the native site does
				setImmediate(() => {
					this._applyOrder(document.querySelector(`article[data-id="${json['_id']}"]`));
				});
			}
		}
	}

	_applyOrder(chapterNode) {
		const tableNode = chapterNode.querySelector('.poll');
		if (tableNode.dataset.xkunXChoiceReorderApplied) {
			return;
		}
		const optionData = [];
		const headerNode = tableNode.rows[0];
		for (let rowIndex = 1; rowIndex < tableNode.rows.length; rowIndex++) {
			const row = tableNode.rows[rowIndex];
			row.dataset.originalIndex = rowIndex;
			const voteCount = row.classList.contains('xOut') ? -1 : ChoiceReorder._parseVoteCount(row.querySelector('.result'));
			optionData.push({
				row,
				voteCount
			});
		}
		optionData.sort((a, b) => a.voteCount - b.voteCount);
		for (const { row } of optionData) {
			ChoiceReorder._insertAfter(row, headerNode);
		}
		tableNode.dataset.xkunXChoiceReorderApplied = true;
	}

	_applyChaos(chapterNode) {
		const tableNode = chapterNode.querySelector('.poll');
		if (!tableNode.dataset.xkunXChoiceReorderApplied) {
			return;
		}
		const optionData = [];
		const headerNode = tableNode.rows[0];
		for (let rowIndex = 1; rowIndex < tableNode.rows.length; rowIndex++) {
			const row = tableNode.rows[rowIndex];
			optionData.push({
				row,
				originalIndex: parseInt(row.dataset.originalIndex, 10)
			});
			delete row.dataset.originalIndex
		}
		optionData.sort((a, b) => b.originalIndex - a.originalIndex);
		for (const { row } of optionData) {
			ChoiceReorder._insertAfter(row, headerNode);
		}
		delete tableNode.dataset.xkunXChoiceReorderApplied;
	}
}
