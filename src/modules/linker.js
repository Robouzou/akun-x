'use strict';

export default class Linker {
	constructor(core) {
		this._core = core;
		this._core.on('dom.added.chatItemMessage', this._onAddedChatItem, this);
	}

	static get id() {
		return 'linker';
	}

	_onAddedChatItem(node) {
		this._linkify(node);
	}

	_linkify(node) {
		if (!node.dataset[Linker.id]) {
			node.dataset[Linker.id] = true;
			let contentNode = node.querySelector('.fieldBody');
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
