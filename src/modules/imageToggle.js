'use strict';

import {SETTING_TYPES} from '../core/settings';

const MODULE_ID = 'imageToggle';

const SETTING_IDS = {
	ENABLED: 'enabled',
	ALL: 'all',
	STORY_COVERS: 'STORY_COVERS',
	STORY_BODY: 'story_body',
	CHAT_MESSAGES: 'chat_messages',
	CHAT_MODALS: 'chat_modals',
	TOPIC_COVERS: 'TOPIC_COVERS',
	TOPIC_OP: 'topic_op',
	PROFILE_AVATARS: 'profile_avatars',
	LIVE_STORIES: 'live_stories'
};

const DEFAULT_SETTINGS = {
	name: 'Image Toggle',
	id: MODULE_ID,
	settings: {}
};

DEFAULT_SETTINGS.settings[SETTING_IDS.ENABLED] = {
	name: 'Enabled',
	description: 'Turn the Image Toggle module on or off.',
	type: SETTING_TYPES.BOOLEAN,
	value: false
};

DEFAULT_SETTINGS.settings[SETTING_IDS.ALL] = {
	name: 'All Images',
	description: 'Every image on the site disappears. Has the potential to hide things you don\'t want hidden.',
	type: SETTING_TYPES.BOOLEAN,
	value: false
};

DEFAULT_SETTINGS.settings[SETTING_IDS.STORY_COVERS] = {
	name: 'Story Covers',
	description: 'Hide the cover image for stories.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS.settings[SETTING_IDS.STORY_BODY] = {
	name: 'Story Body',
	description: 'Hide any images that are in story chapters.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS.settings[SETTING_IDS.CHAT_MESSAGES] = {
	name: 'Chat Messages',
	description: 'Hide images in chat.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS.settings[SETTING_IDS.CHAT_MODALS] = {
	name: 'Chat Modals',
	description: 'Hide images in the popout chat modals.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS.settings[SETTING_IDS.TOPIC_COVERS] = {
	name: 'Topic Covers',
	description: 'Hide the topic cover images.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS.settings[SETTING_IDS.TOPIC_OP] = {
	name: 'Topic Opening Post',
	description: 'Hide any images within the topic\'s opening post.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS.settings[SETTING_IDS.PROFILE_AVATARS] = {
	name: 'Profile Avatar',
	description: 'Hides the large avatar image displayed on a user\'s profile page.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS.settings[SETTING_IDS.LIVE_STORIES] = {
	name: 'Live Story List',
	description: 'Hides story cover images for stories listed in the live story list. Only has effect if you\'re using the Live Images AkunX module.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

export default class ImageToggle {
	constructor(core) {
		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS, this._onSettingsChanged.bind(this));
		this._styleElement = document.createElement('style');
		this._styleElement.id = 'akun-x-image-toggle';
		document.head.appendChild(this._styleElement);
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
			default:
				if (this._settings[SETTING_IDS.ENABLED].value) {
					this._regenerateCurrentStyling();
				}
		}
	}

	_enable() {
		this._regenerateCurrentStyling();
	}

	_disable() {
		this._styleElement.innerHTML = '';
	}

	_regenerateCurrentStyling() {
		let css = '';
		if (this._settings[SETTING_IDS.ALL].value) {
			css += 'img {display: none!important;}';
		} else {
			if (this._settings[SETTING_IDS.STORY_COVERS].value) {
				css += '.storyImg, .imgWithBackground, .authorOf img, .storyListItem .imgContainer img {display: none!important;}';
				css += '.storyImgContainer {min-height: 2em;}';
				css += '.authorOf .storyListItem {height: inherit!important;}';
			}
			if (this._settings[SETTING_IDS.STORY_BODY].value) {
				css += '#storyPosts img {display: none!important;}';
			}
			if (this._settings[SETTING_IDS.CHAT_MESSAGES].value) {
				css += '#mainChat .message img, #page-body .message img {display: none!important;}';
			}
			if (this._settings[SETTING_IDS.CHAT_MODALS].value) {
				css += '.chatModal .message img, .chatModal .postBody img {display: none!important;}';
			}
			if (this._settings[SETTING_IDS.TOPIC_COVERS].value) {
				css += '#threads td:not(:last-child) img, .newsFeed img {display: none!important;}';
			}
			if (this._settings[SETTING_IDS.TOPIC_OP].value) {
				css += '.page-head-body #page-body img {display: none!important;}';
			}
			if (this._settings[SETTING_IDS.PROFILE_AVATARS].value) {
				css += '#userProfile .avatar img {display: none!important;}';
			}
			if (this._settings[SETTING_IDS.LIVE_STORIES].value) {
				css += '.liveStories img {display: none!important;}';
			}
		}
		this._styleElement.innerHTML = css;
	}
}