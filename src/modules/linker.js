'use strict';

export default class Linker {
	constructor(core) {
		this._core = core;
		this._core.on('dom.added.chatItemMessage', this._onAddedChatItemMessage, this);
		this._core.on('dom.added.chatItemFieldBody', this._onAddedChatItemFieldBody, this);
		this._core.on('dom.added.chapter', this._onAddedChapter, this);
	}

	static get id() {
		return 'linker';
	}

	_onAddedChatItemMessage(node) {
		let contentNode = node.querySelector('.fieldBody');
		if (contentNode) {
			this._linkify(contentNode);
		}
	}

	_onAddedChatItemFieldBody(node) {
		this._linkify(node);
	}

	_onAddedChapter(node) {
		let contentNode = node.querySelector('.fieldBody');
		if (contentNode) {
			this._linkify(contentNode);
			contentNode.querySelectorAll('p').forEach(this._linkify);
		}
	}

	_linkify(contentNode) {
		if (!contentNode.dataset[Linker.id]) {
			contentNode.dataset[Linker.id] = true;
			for (let node of contentNode.childNodes) {
				if (node.nodeType === Node.TEXT_NODE) {
					// Only touch text nodes to avoid interfering with any HTML
					let urlMatch = /https?:\/\/[A-z0-9\-\._~:\/\?#\[\]@\!\$&'\(\)*\+,;=%]+/.exec(node.nodeValue);
					if (urlMatch) {
						let newLink = document.createElement('a');
						let range = new Range();
						range.setStart(node, urlMatch.index);
						range.setEnd(node, urlMatch.index + urlMatch[0].length);
						range.surroundContents(newLink);
						newLink.href = urlMatch[0];
					}
				}
			}
		}
	}
}
