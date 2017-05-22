'use strict';

const MODULE_ID = 'liveImages';

const PLACEHOLDER_IMAGE_URL = 'https://cdn.fiction.live/h180-w320-cfill/images/1bfbkfv80_Feline_Heart.jpg';

export default class LiveImages {
	constructor(core, settings) {
		this._core = core;
		this._settings = settings;
		this._initialiseSettings();
		this._storyIdToImageMap = new Map();
		this._core.on('net.received.liveStories', this._onLiveStories, this);
		this._core.on('dom.added.storyItem', this._onAddedStoryItem, this);
	}

	static get id() {
		return MODULE_ID;
	}

	_initialiseSettings() {
	}

	_fetchLiveData() {
		fetch('/api/anonkun/board/live').then(response => {
			return response.json();
		}).then(json => {
		}).catch(console.error);
	}

	_onLiveStories(json) {
		for (let story of json['stories']) {
			let imageUrl = story['i'] && story['i'][0];
			this._storyIdToImageMap.set(story['_id'], imageUrl);
		}
		document.querySelectorAll('.storyItem').forEach(nodeStoryItem => {
			this._addImageToNode(nodeStoryItem);
		});
	}

	_onAddedStoryItem(node) {
		this._addImageToNode(node);
	}

	_addImageToNode(node) {
		if (!node.dataset[LiveImages.id]) {
			node.dataset[LiveImages.id] = true;
			const storyId = node.href.split('/')[5];
			const imageUrl = this._storyIdToImageMap.get(storyId) || PLACEHOLDER_IMAGE_URL;
			const imageNode = document.createElement('img');
			imageNode.classList.add('akun-x-live-images');
			imageNode.dataset.storyId = storyId;
			imageNode.src = imageUrl;
			node.querySelector('.container').appendChild(imageNode);
		} else {
			const imageNode = node.querySelector('.akun-x-live-images');
			const storyId = imageNode.dataset.storyId;
			imageNode.src = this._storyIdToImageMap.get(storyId) || PLACEHOLDER_IMAGE_URL;
		}
	}
}
