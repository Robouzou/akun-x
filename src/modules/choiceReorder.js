'use strict';

import {SETTING_TYPES} from '../core/settings';
import ElementPool from '../core/elementPool';
import './sortPolls.pcss';

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
		this._buttonPool = new ElementPool(this._createButtonElement());
		if (this._settings[SETTING_IDS.ENABLED].value) {
			this._enable();
		}
		this._boundSortAll = this.sortAllCallBack.bind(this);
		this._buttonPool.addEventListener('click', this._boundSortAll);
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
		this._core.dom.nodes('chatHeader').forEach(this._onAddedChatHeader, this);
		this._core.dom.nodes('chapter').forEach(this._onAddedChapter, this);
		this._core.on(this._core.EVENTS.DOM.ADDED.CHAT_HEADER, this._onAddedChatHeader, this);
		this._core.on(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
	}

	_disable() {
		this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
		this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAT_HEADER, this._onAddedChatHeader, this);
		document.querySelectorAll('.akun-x-sort-button').forEach(node => {
			delete node.parentNode.dataset[ChoiceReorder.id];
			node.parentNode.removeChild(node);
		});

		this._core.dom.nodes('chapter').forEach(function(node) {
			if (!node.classList.contains('choice')) {
				return;
			}
			let tbody = node.getElementsByClassName('poll')[0].firstChild
			delete tbody.dataset.sorted;

			let choices = [];
			Array.from(tbody.getElementsByClassName('choiceItem')).forEach(function(choiceItem) {
				choices.push(choiceItem.cloneNode(true));
				choiceItem.parentNode.removeChild(choiceItem)
			});
			choices.sort(function(a, b) {
				if (parseInt(a.dataset.prevPosition) > parseInt(b.dataset.prevPosition)) {
					return 1;
				}
				if (parseInt(a.dataset.prevPosition) < parseInt(b.dataset.prevPosition)) {
					return -1;
				}
				return 0;
			});

			choices.forEach(function(choiceItem) {
				tbody.append(choiceItem);
			});
			[].forEach.call(tbody.getElementsByClassName('result'), function(result) {
				Array.from(result.childNodes).forEach(function(total) {
					if (!total.classList.contains('userVote')) {
						delete result.parentNode.dataset.prevPosition;
						delete result.parentNode.dataset.voteCount;
					}
				});
			});
		}, this);
	}

	sortAllCallBack(e) {
		this._core.dom.nodes('chapter').forEach(this._onAddedChapter, this);
	}

	_onAddedChatHeader(node) {
		node.querySelector('.pagination-dropdown').appendChild(this._buttonPool.getElement());
	}

	_onAddedChapter(node) {
		if (node.classList.contains('choice')) {
			try {
				this.reorderChoices(node.getElementsByClassName('poll')[0].firstChild);
			} catch (e) {
				console.log("Can't sort polls where vote count is currently hidden");
			}
		}
	}

	_createButtonElement() {
		const buttonElement = document.createElement('div');
		buttonElement.classList.add('akun-x-sort-button', 'noselect', 'btn', 'dim-font-color', 'hover-font-color');
		const textElement = document.createElement('span');
		textElement.innerHTML = "Sort";
		textElement.classList.add('button-text');
		buttonElement.appendChild(textElement);
		return buttonElement;
	}

	reorderChoices(tbody) {
		if (tbody.dataset.sorted) {
			return;
		}
		let position = 0;
		[].forEach.call(tbody.getElementsByClassName('result'), function(result) {
			Array.from(result.childNodes).forEach(function(total) {
				if (!total.classList.contains('userVote')) {
					result.parentNode.dataset.voteCount = total.textContent;
					result.parentNode.dataset.prevPosition = position++;
				}
			});
		});
		[].forEach.call(tbody.getElementsByClassName('xOut'), function(xOut) {
			xOut.dataset.voteCount = -1;
		});

		let choices = [];
		Array.from(tbody.getElementsByClassName('choiceItem')).forEach(function(choiceItem) {
			choices.push(choiceItem.cloneNode(true));
			choiceItem.parentNode.removeChild(choiceItem)
		});
		choices.sort(function(a, b) {
			if (parseInt(a.dataset.voteCount) < parseInt(b.dataset.voteCount)) {
				return 1;
			}
			if (parseInt(a.dataset.voteCount) > parseInt(b.dataset.voteCount)) {
				return -1;
			}
			return 0;
		});

		choices.forEach(function(choiceItem) {
			tbody.append(choiceItem);
		});
		tbody.dataset.sorted = true;
	}
}
