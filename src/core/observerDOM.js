'use strict';

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

const EVENTS = {
	CHAT_NODE_ADDED: 'dom.added.chatItem',
	CHAT_NODE_MESSAGE_ADDED: 'dom.added.chatItemMessage',
	CHAT_NODE_FIELD_BODY_ADDED: 'dom.added.chatItemFieldBody',
	CHAPTER_NODE_ADDED: 'dom.added.chapter',
	STORY_NODE_ADDED: 'dom.added.storyItem'
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
			document.querySelectorAll('.chapter').forEach(nodeChapter => {
				this._eventEmitter.emit(EVENTS.CHAPTER_NODE_ADDED, nodeChapter);
			});
			document.querySelectorAll('.storyItem').forEach(nodeStoryItem => {
				this._eventEmitter.emit(EVENTS.STORY_NODE_ADDED, nodeStoryItem);
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
						node.querySelectorAll('.chapter').forEach(nodeChapter => {
							this._eventEmitter.emit(EVENTS.CHAPTER_NODE_ADDED, nodeChapter);
						});
					}
					if (node.classList.contains('chapter')) {
						this._eventEmitter.emit(EVENTS.CHAPTER_NODE_ADDED, node);
					}
					if (node.classList.contains('fieldBody')) {
						this._eventEmitter.emit(EVENTS.CHAT_NODE_FIELD_BODY_ADDED, node);
					}
					if (node.classList.contains('storyItem')) {
						this._eventEmitter.emit(EVENTS.STORY_NODE_ADDED, node);
					}
				}
			}
		}
	}
}
