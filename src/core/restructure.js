'use strict';

import ElementPool from './elementPool';
import './restructure.pcss';

/* This handles the restructuring of the native site to be bent into a more convenient shape for our machinations
 */

export default class Restructure {
	constructor(core) {
		this._core = core;
		this._chatHeaderTitlePool = new ElementPool(this._createChatHeaderTitleElement());
		this._core.on(this._core.EVENTS.DOM.ADDED.CHAT_HEADER, this._onAddedChatHeader, this);
	}

	_onAddedChatHeader(node) {
		if (node.closest('#mainChat')) {
			node.appendChild(this._chatHeaderTitlePool.getElement());
			return;
		}
		const chatModalNode = node.closest('.chatModal');
		if (chatModalNode) {
			const modalHeaderNode = chatModalNode.querySelector('.modal-header');
			modalHeaderNode.appendChild(node);
			const closeNode = chatModalNode.querySelector('.close');
			modalHeaderNode.appendChild(closeNode);
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
