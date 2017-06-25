'use strict';

import ElementPool from './elementPool';
import './restructure.pcss';

/* This handles the restructuring of the native site to be bent into a more convenient shape for our machinations
 */

export default class Restructure {
	constructor(core) {
		this._core = core;
		this._chatHeaderTitlePool = new ElementPool(this._createChatHeaderTitleElement());
		this._chatHeaderFillerPool = new ElementPool(this._createChatHeaderFillerElement());
		this._core.on(this._core.EVENTS.DOM.ADDED.CHAT_HEADER, this._onAddedChatHeader, this);
	}

	_onAddedChatHeader(node) {
		const paginationNode = node.querySelector('.pagination-dropdown');
		const chatModalNode = node.closest('.chatModal');
		if (node.closest('#mainChat')) {
			paginationNode.appendChild(this._chatHeaderTitlePool.getElement());
			paginationNode.appendChild(this._chatHeaderFillerPool.getElement());
		} else if (chatModalNode) {
			paginationNode.appendChild(this._chatHeaderFillerPool.getElement());
			chatModalNode.querySelector('.modal-header').appendChild(node);
		}
	}

	_createChatHeaderTitleElement() {
		const element = document.createElement('div');
		element.classList.add('akun-x-restructure-chat-header-title');
		element.textContent = 'Chat';
		return element;
	}

	_createChatHeaderFillerElement() {
		const element = document.createElement('div');
		element.classList.add('akun-x-restructure-chat-header-filler');
		return element;
	}
}
