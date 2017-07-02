'use strict';

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

export const EVENTS = {
	DOM: {
		ADDED: {
			CHAT_ITEM: 'dom.added.chatItem',
			CHAT_ITEM_MESSAGE: 'dom.added.chatItemMessage',
			CHAT_ITEM_FIELD_BODY: 'dom.added.chatItemFieldBody',
			CHAT_HEADER: 'dom.added.chatHeader',
			CHAT_INPUT_CONTAINER: 'dom.added.chatInputContainer',
			CHAPTER: 'dom.added.chapter',
			CHAPTER_BUTTON_CONTROLS: 'dom.added.chapterButtonControls',
			STORY: 'dom.added.storyItem',
			CHAT_MODAL: 'dom.added.chatModal',
			MAIN_MENU: 'dom.added.mainMenu'
		}
	}
};

export default class ObserverDOM {
	constructor(eventEmitter) {
		this._eventEmitter = eventEmitter;

		// jQuery already present on page
		$(document).ready(() => {
			this._observeBody();
		});
	}

	node(type) {
		switch (type) {
			case 'mainMenu':
				return document.getElementById('mainMenu');
			default:
				return null;
		}
	}

	nodes(type) {
		switch (type) {
			case 'chapterButtonControls':
				return document.querySelectorAll('.chapter .secondRow');
			case 'chatHeader':
				return document.querySelectorAll('.chatHeader');
			case 'storyItem':
				return document.querySelectorAll('.storyItem');
			case 'chapter':
				return document.querySelectorAll('.chapter');
			case 'logItem':
				return document.querySelectorAll('.logItem');
			case 'message':
				return document.querySelectorAll('.logItem .message');
			case 'mainMenu':
				return [document.getElementById('mainMenu')];
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
						this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_ITEM, node);
						let nodeMessage = node.querySelector('.message');
						if (nodeMessage) {
							this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_ITEM_MESSAGE, nodeMessage);
						}
					}
					if (node.classList.contains('message')) {
						this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_ITEM_MESSAGE, node);
					}
					if (node.classList.contains('jadeRepeat')) {
						node.querySelectorAll('.logItem').forEach(nodeLogItem => {
							this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_ITEM, nodeLogItem);
							let nodeMessage = nodeLogItem.querySelector('.message');
							if (nodeMessage) {
								this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_ITEM_MESSAGE, nodeMessage);
							}
						});
						node.querySelectorAll('.chapter').forEach(nodeChapter => {
							this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAPTER, nodeChapter);
						});
					}
					if (node.classList.contains('chapter')) {
						this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAPTER, node);
					}
					if (node.classList.contains('fieldBody')) {
						this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_ITEM_FIELD_BODY, node);
					}
					if (node.classList.contains('storyItem')) {
						this._eventEmitter.emit(EVENTS.DOM.ADDED.STORY, node);
					}
					if (node.classList.contains('chatContainer')) {
						this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_HEADER, node.querySelector('.chatHeader'));
					}
					if (node.classList.contains('secondRow')) {
						this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAPTER_BUTTON_CONTROLS, node);
					}
					if (node.classList.contains('chatLight')) {
						node.querySelectorAll('.logItem').forEach(nodeLogItem => {
							this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_ITEM, nodeLogItem);
							let nodeMessage = nodeLogItem.querySelector('.message');
							if (nodeMessage) {
								this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_ITEM_MESSAGE, nodeMessage);
							}
						});
					}
					if (node.classList.contains('chatItemDetail')) {
						this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_MODAL, node);
						node.querySelectorAll('.chatHeader').forEach(nodeChatHeader => {
							this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_HEADER, nodeChatHeader);
						});
						node.querySelectorAll('.chatInputContainer').forEach(nodeChatInputContainer => {
							this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_INPUT_CONTAINER, nodeChatInputContainer);
						});
					}
					if (node.classList.contains('choiceReply')) {
						node.querySelectorAll('.chatHeader').forEach(nodeChatHeader => {
							this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_HEADER, nodeChatHeader);
						});
					}
					if (node.classList.contains('privateChat')) {
						node.querySelectorAll('.chatHeader').forEach(nodeChatHeader => {
							this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_HEADER, nodeChatHeader);
						});
					}
					if (node.classList.contains('chatInputContainer')) {
						this._eventEmitter.emit(EVENTS.DOM.ADDED.CHAT_INPUT_CONTAINER, node);
					}
				}
			}
		}
	}
}
