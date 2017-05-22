'use strict';

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

const EVENTS = {
	CHAT_NODE_ADDED: 'dom.added.chatItem',
	CHAT_NODE_MESSAGE_ADDED: 'dom.added.chatItemMessage'
};

export default class ObserverDOM {
	constructor(eventEmitter) {
		this._eventEmitter = eventEmitter;

		// jQuery already present on page
		$(document).ready(() => {
			this._observeBody();
			document.querySelectorAll('.logItem').forEach(nodeLogItem => {
				this._eventEmitter.emit(EVENTS.CHAT_NODE_ADDED, nodeLogItem);
				let nodeMessage = nodeLogItem.querySelector('.message');
				if (nodeMessage) {
					this._eventEmitter.emit(EVENTS.CHAT_NODE_MESSAGE_ADDED, nodeMessage);
				}
			});
		});
	}

	static _observe(node, callback, config) {
		const observer = new MutationObserver(callback);
		observer.observe(node, config);
	}

	_observeBody() {
		ObserverDOM._observe(document.body, this._observerBodyFunction.bind(this), {
			childList: true,
			subtree: true
		});
	}

	_observerBodyFunction(mutations) {
		console.log(mutations);
		for (let mutation of mutations) {
			for (let node of mutation.addedNodes) {
				if (node.classList) {
					if (node.classList.contains('logItem')) {
						this._eventEmitter.emit(EVENTS.CHAT_NODE_ADDED, node);
					}
					if (node.classList.contains('message')) {
						this._eventEmitter.emit(EVENTS.CHAT_NODE_MESSAGE_ADDED, node);
					}
					if (node.classList.contains('jadeRepeat')) {
						node.querySelectorAll('.logItem').forEach(nodeLogItem => {
							this._eventEmitter.emit(EVENTS.CHAT_NODE_ADDED, nodeLogItem);
							let nodeMessage = nodeLogItem.querySelector('.message');
							if (nodeMessage) {
								this._eventEmitter.emit(EVENTS.CHAT_NODE_MESSAGE_ADDED, nodeMessage);
							}
						});
					}
				}
			}
		}
	}
}
