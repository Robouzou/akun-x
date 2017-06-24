'use strict';

import {SETTING_TYPES} from '../core/settings';

const MODULE_ID = 'liveImages';

const SETTING_IDS = {
	ENABLED: 'enabled'
};

const DEFAULT_SETTINGS = {
	name: 'Live Images',
	id: MODULE_ID,
	settings: {
		[SETTING_IDS.ENABLED]: {
			name: 'Enabled',
			description: 'Turn the Live Images module on or off.',
			type: SETTING_TYPES.BOOLEAN,
			value: true
		}
	}
};

const PLACEHOLDER_IMAGE_URL = '//placekitten.com/g/320/180';

export default class LiveImages {
	constructor(core) {
		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS, this._onSettingsChanged.bind(this));
		this._storyIdToImageMap = new Map();
		if (this._settings[SETTING_IDS.ENABLED].value) {
			this._enable();
		}
	}

	static get id() {
		return MODULE_ID;
	}

	_onSettingsChanged(settingId) {
		switch (settingId) {
			case SETTING_IDS.ENABLED:
				if (this._settings[SETTING_IDS.ENABLED].value) {
					this._enable();
				} else {
					this._disable();
				}
				break;
		}
	}

	_enable() {
		this._core.dom.nodes('storyItem').forEach(this._onAddedStoryItem, this);
		this._core.on(this._core.EVENTS.NET.RECEIVED.LIVE_STORIES, this._onLiveStories, this);
		this._core.on(this._core.EVENTS.DOM.ADDED.STORY, this._onAddedStoryItem, this);
	}

	_disable() {
		this._core.removeListener(this._core.EVENTS.NET.RECEIVED.LIVE_STORIES, this._onLiveStories, this);
		this._core.removeListener(this._core.EVENTS.DOM.ADDED.STORY, this._onAddedStoryItem, this);
		document.querySelectorAll('.akun-x-live-images').forEach(node => {
			delete node.closest('.storyItem').dataset[LiveImages.id];
			node.parentNode.removeChild(node);
		});
	}

	_fetchLiveData() {
		fetch('/api/anonkun/board/live').then(response => {
			return response.json();
		}).then(json => {
		}).catch(console.error);
	}

	_onLiveStories(json) {
		if (json && json['stories']) {
			for (let story of json['stories']) {
				let imageUrl = story['i'] && story['i'][0];
				this._storyIdToImageMap.set(story['_id'], imageUrl);
			}
			document.querySelectorAll('.storyItem').forEach(nodeStoryItem => {
				this._addImageToNode(nodeStoryItem);
			});
		}
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
