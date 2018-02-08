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
		this._core.dom.nodes('chapter').forEach(this._onAddedChapter, this);
		this._core.on(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
	}

	_disable() {
		this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
	}

	_onAddedChapter(node) {
		if (!node.classList.contains('choice')) {
			return;
		}
		this.reorderChoices(node.getElementsByClassName('poll')[0].firstChild);
	}

	reorderChoices(tbody) {
		[].forEach.call(tbody.getElementsByClassName('result'), function(result) {
				Array.from(result.childNodes).forEach(function(total) {
					if (!total.classList.contains('userVote')) {
						result.parentNode.dataset.index = total.textContent;
					}
				});
		});
		[].forEach.call(tbody.getElementsByClassName('xOut'), function(xOut) {
			xOut.dataset.index = -1;
		});

		let choices = [];
		Array.from(tbody.getElementsByClassName('choiceItem')).forEach(function(choiceItem) {
			choices.push(choiceItem.cloneNode(true));
			choiceItem.parentNode.removeChild(choiceItem)
		});
		choices.sort(function(a, b) {
			if (a.dataset)
			if (parseInt(a.dataset.index) < parseInt(b.dataset.index)) return 1;
			if (parseInt(a.dataset.index) > parseInt(b.dataset.index)) return -1;
			return 0;
		});

		choices.forEach(function(choiceItem) {
			tbody.append(choiceItem);
		});
	}
}
