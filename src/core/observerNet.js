'use strict';

export const EVENTS = {
	NET: {
		RECEIVED: {
			LIVE_STORIES: 'net.received.liveStories',
			BOARDS: 'net.received.boards',
			FOLLOWING_LIST: 'net.received.followingList',
			USER_COLLECTIONS: 'net.received.userCollections',
			SAVES: 'net.received.saves',
			REF_LATEST: 'net.received.refLatest',
			REVIEW_PREVIEW: 'net.received.reviewPreview',
			CHAPTER_THREADS: 'net.received.chapterThreads',
			THREAD_PAGES: 'net.received.threadPages',
			THREAD_MESSAGES: 'net.received.threadMessages'
		},
		POSTED: {
			CHAPTER: 'net.posted.chapter',
			NODE: 'net.posted.node'
		}
	}
};

export default class ObserverNet {
	constructor(eventEmitter) {
		this._eventEmitter = eventEmitter;

		// jQuery already present on page
		$(document).ajaxComplete(this._onAjaxComplete.bind(this));
	}

	static _observe(node, callback, config) {
		const observer = new MutationObserver(callback);
		observer.observe(node, config);
	}

	_onAjaxComplete(event, request, settings) {
		const urlFragments = settings.url.split('/');
		urlFragments.shift(); // Remove initial empty element
		switch (urlFragments[0]) {
			case 'api':
				switch (urlFragments[1]) {
					case 'anonkun':
						switch (urlFragments[2]) {
							case 'board':
								if (urlFragments[3] === 'live') {
									this._eventEmitter.emit(EVENTS.NET.RECEIVED.LIVE_STORIES, request.responseJSON);
								} else {
									console.log(`Unhandled network request: ${settings.url}`);
								}
								break;
							case 'boards':
								this._eventEmitter.emit(EVENTS.NET.RECEIVED.BOARDS, request.responseJSON, parseInt(urlFragments[3], 10));
								break;
							case 'chapter':
								this._eventEmitter.emit(EVENTS.NET.POSTED.CHAPTER, request.responseJSON);
								break;
							case 'chapterThreads':
								this._eventEmitter.emit(EVENTS.NET.RECEIVED.CHAPTER_THREADS, request.responseJSON);
								break;
							case 'following':
								this._eventEmitter.emit(EVENTS.NET.RECEIVED.FOLLOWING_LIST, request.responseJSON, urlFragments[3]);
								break;
							case 'refLatest':
								this._eventEmitter.emit(EVENTS.NET.RECEIVED.REF_LATEST, request.responseJSON, urlFragments[3]);
								break;
							case 'review':
								if (urlFragments[4] === 'preview') {
									this._eventEmitter.emit(EVENTS.NET.RECEIVED.REVIEW_PREVIEW, request.responseJSON, urlFragments[3]);
								} else {
									console.log(`Unhandled network request: ${settings.url}`);
								}
								break;
							case 'saves':
								this._eventEmitter.emit(EVENTS.NET.RECEIVED.SAVES, request.responseJSON, urlFragments[3]);
								break;
							case 'userCollections':
								this._eventEmitter.emit(EVENTS.NET.RECEIVED.USER_COLLECTIONS, request.responseJSON, urlFragments[3]);
								break;
							default:
								console.log(`Unhandled network request: ${settings.url}`);
						}
						break;
					case 'node':
						this._eventEmitter.emit(EVENTS.NET.POSTED.NODE, request.responseJSON);
						break;
					case 'thread':
						if (urlFragments[3] === 'pages') {
							this._eventEmitter.emit(EVENTS.NET.RECEIVED.THREAD_PAGES, request.responseJSON, urlFragments[2]);
						} else {
							this._eventEmitter.emit(EVENTS.NET.RECEIVED.THREAD_MESSAGES, request.responseJSON, urlFragments[2], urlFragments[3], urlFragments[4]);
						}
						break;
					default:
						console.log(`Unhandled network request: ${settings.url}`);
				}
				break;
			default:
				console.log(`Unhandled network request: ${settings.url}`);
		}
	}
}
