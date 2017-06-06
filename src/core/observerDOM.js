'use strict';

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

const EVENTS = {
	CHAT_NODE_ADDED: 'dom.added.chatItem',
	CHAT_NODE_MESSAGE_ADDED: 'dom.added.chatItemMessage',
	CHAT_NODE_FIELD_BODY_ADDED: 'dom.added.chatItemFieldBody',
	CHAT_HEADER_ADDED: 'dom.added.chatHeader',
	CHAPTER_NODE_ADDED: 'dom.added.chapter',
	CHAPTER_BUTTON_CONTROLS_ADDED: 'dom.added.chapterButtonControls',
	STORY_NODE_ADDED: 'dom.added.storyItem',
	MODAL_NODE_ADDED: 'dom.added.chatModal',
	MAIN_MENU_ADDED: 'dom.added.mainMenu'
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
			this._eventEmitter.emit(EVENTS.MAIN_MENU_ADDED, document.getElementById('mainMenu'));
		});
	}

	nodes(type) {
		switch (type) {
			case 'chapterButtonControls':
				return document.querySelectorAll('.chapter .secondRow');
			case 'chatHeader':
				return document.querySelectorAll('.chatHeader');
			default:
				return [];
		}
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
		for (let mutation of mutations) {
			for (let node of mutation.addedNodes) {
				// console.log(node);
				if (node.classList) {
					if (node.classList.contains('logItem')) {
						this._eventEmitter.emit(EVENTS.CHAT_NODE_ADDED, node);
						let nodeMessage = node.querySelector('.message');
						if (nodeMessage) {
							this._eventEmitter.emit(EVENTS.CHAT_NODE_MESSAGE_ADDED, nodeMessage);
						}
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
					if (node.classList.contains('chatContainer')) {
						this._eventEmitter.emit(EVENTS.CHAT_HEADER_ADDED, node.querySelector('.chatHeader'));
					}
					if (node.classList.contains('secondRow')) {
						this._eventEmitter.emit(EVENTS.CHAPTER_BUTTON_CONTROLS_ADDED, node);
					}
					if (node.classList.contains('chatLight')) {
						node.querySelectorAll('.logItem').forEach(nodeLogItem => {
							this._eventEmitter.emit(EVENTS.CHAT_NODE_ADDED, nodeLogItem);
							let nodeMessage = nodeLogItem.querySelector('.message');
							if (nodeMessage) {
								this._eventEmitter.emit(EVENTS.CHAT_NODE_MESSAGE_ADDED, nodeMessage);
							}
						});
					}
					if (node.classList.contains('chatItemDetail')) {
						this._eventEmitter.emit(EVENTS.MODAL_NODE_ADDED, node);
						node.querySelectorAll('.chatHeader').forEach(nodeChatHeader => {
							this._eventEmitter.emit(EVENTS.CHAT_HEADER_ADDED, nodeChatHeader);
						})
					}
				}
			}
		}
	}
}
