'use strict';

import {SETTING_TYPES} from '../core/settings';
import ElementPool from '../core/elementPool';

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

		this._buttonPool = new ElementPool(this._createButtonElement());
		this._buttonPool.addEventListener('click', () => this._core.dom.nodes('chapter').forEach(this._onAddedChapter, this));
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

		this._core.dom.nodes('chapter').forEach(node => {
			if (!node.classList.contains('choice')) {
				return;
			}

			let tbody = node.getElementsByClassName('poll')[0].firstChild
			delete tbody.dataset.sorted;

			let choices = [];
			tbody.getElementsByClassName('choiceItem').forEach(choiceItem => {
				choices.push(choiceItem.cloneNode(true));
				choiceItem.parentNode.removeChild(choiceItem)
			});

			choices.sort((a, b) => {
				if (parseInt(a.dataset.prevPosition) > parseInt(b.dataset.prevPosition)) {
					return 1;
				}
				if (parseInt(a.dataset.prevPosition) < parseInt(b.dataset.prevPosition)) {
					return -1;
				}
				return 0;
			});

			choices.forEach(choiceItem => {
				tbody.append(choiceItem);
			});

			tbody.getElementsByClassName('result').forEach(result => {
				result.childNodes.forEach(total => {
					if (!total.classList.contains('userVote')) {
						delete result.parentNode.dataset.prevPosition;
						delete result.parentNode.dataset.voteCount;
					}
				});
			});
		}, this);
	}

	_onAddedChatHeader(node) {
		node.querySelector('.pagination-dropdown').appendChild(this._buttonPool.getElement());
	}

	_onAddedChapter(node) {
		if (node.classList.contains('choice')) {
			try {
				this.reorderChoices(node.getElementsByClassName('poll')[0].firstChild);
			} catch (e) {
				console.log(e);
			}
		}
	}

	_createButtonElement() {
		const buttonElement = document.createElement('div');
		buttonElement.classList.add('noselect', 'btn', 'dim-font-color', 'hover-font-color');
		buttonElement.id = ChoiceReorder.id + "-sortButton";

		const textElement = document.createElement('span');
		textElement.innerHTML = "Sort";

		buttonElement.appendChild(textElement);
		return buttonElement;
	}

	reorderChoices(tbody) {
		if (tbody.dataset.sorted) {
			return;
		}

		// Mark all choices with their vote count to make it simpler to sort them
		// Also mark them with their previous index in the poll to allow disabling the module to fully undo its changes
		let position = 0;
		[].forEach.call(tbody.getElementsByClassName('result'), result => {
			result.childNodes.forEach(node => {
				if (node.dataset.hint === "Total Votes") {
					result.parentNode.dataset.voteCount = node.textContent;
					result.parentNode.dataset.prevPosition = position++;
				}
			});
		});
		// Make sure crossed out options go to the bottom
		[].forEach.call(tbody.getElementsByClassName('xOut'), xOut => {
			xOut.dataset.voteCount = -1;
		});


		let choices = [];
		while (tbody.childNodes.length > 1) {
			choices.push(tbody.childNodes[1]);
			tbody.removeChild(tbody.childNodes[1]);
		}

		choices.sort((a, b) => {
			return b.dataset.voteCount - a.dataset.voteCount;
		});

		choices.forEach(choiceItem => {
			tbody.append(choiceItem);
		});

		tbody.dataset.sorted = true;
	}
}
