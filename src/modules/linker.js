'use strict';

import {SETTING_TYPES} from '../core/settings';

const MODULE_ID = 'linker';

const SETTING_IDS = {
	ENABLED: 'enabled',
	STRICT_MODE: 'strictMode',
	EMBED_IMAGES: 'embedImages',
	EMBED_VIDEOS: 'embedVideos',
	MEDIA_SITES: 'mediaSites',
	IMAGE_EXTENSIONS: 'imageExtensions',
	VIDEO_EXTENSIONS: 'videoExtensions'
};

const DEFAULT_SETTINGS = {
	name: 'Linker',
	id: MODULE_ID,
	settings: {
		[SETTING_IDS.ENABLED]: {
			name: 'Enabled',
			description: 'Turn the Linker module on or off.',
			type: SETTING_TYPES.BOOLEAN,
			value: true
		},
		[SETTING_IDS.STRICT_MODE]: {
			name: 'Strict Mode',
			description: 'With Strict Mode enabled the link parsing will only accept URLs comprising of specification compliant characters. Disabling Strict Mode will recognise links as text that looks like it starts as a link and continues until it encounters whitespace.',
			type: SETTING_TYPES.BOOLEAN,
			value: false
		},
		[SETTING_IDS.EMBED_IMAGES]: {
			name: 'Embed Images',
			description: 'Embed links recognised to be images as images instead.',
			type: SETTING_TYPES.BOOLEAN,
			value: true
		},
		[SETTING_IDS.EMBED_VIDEOS]: {
			name: 'Embed Videos',
			description: 'Embed links recognised to be videos as images instead.',
			type: SETTING_TYPES.BOOLEAN,
			value: true
		},
		[SETTING_IDS.MEDIA_SITES]: {
			name: 'Media Sites',
			description: 'Define a list of sites to embed links as media from. Used as a regex pattern.',
			type: SETTING_TYPES.ARRAY,
			value: [
				'puu.sh',
				'i.imgur.com',
				'data.archive.moe',
				'i.4cdn.org',
				'i0.kym-cdn.com',
				'[\\S]*.deviantart.net'
			]
		},
		[SETTING_IDS.IMAGE_EXTENSIONS]: {
			name: 'Image Extensions',
			description: 'Define a list of extensions to recognise as images.',
			type: SETTING_TYPES.ARRAY,
			value: [
				'jpg',
				'jpeg',
				'png',
				'gif'
			]
		},
		[SETTING_IDS.VIDEO_EXTENSIONS]: {
			name: 'Video Extensions',
			description: 'Define a list of extensions to recognise as videos.',
			type: SETTING_TYPES.ARRAY,
			value: [
				'webm',
				'mp4',
				'gifv'
			]
		}
	}
};

export default class Linker {
	constructor(core) {
		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS, this._onSettingsChanged.bind(this));
		this._imageRegex = null;
		this._videoRegex = null;
		this._videoTypeRegex = null;
		this._updateMediaRegex();
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
			case SETTING_IDS.STRICT_MODE:
				if (this._settings[SETTING_IDS.ENABLED].value) {
					this._disable();
					this._enable();
				}
				break;
			case SETTING_IDS.EMBED_IMAGES:
				if (this._settings[SETTING_IDS.EMBED_IMAGES].value) {
					this._disable();
					if (this._settings[SETTING_IDS.ENABLED].value) {
						this._enable();
					}
				} else {
					Linker._disableImages();
					if (this._settings[SETTING_IDS.ENABLED].value) {
						this._enable();
					}
				}
				break;
			case SETTING_IDS.EMBED_VIDEOS:
				if (this._settings[SETTING_IDS.EMBED_VIDEOS].value) {
					this._disable();
					if (this._settings[SETTING_IDS.ENABLED].value) {
						this._enable();
					}
				} else {
					Linker._disableVideos();
					if (this._settings[SETTING_IDS.ENABLED].value) {
						this._enable();
					}
				}
				break;
			case SETTING_IDS.MEDIA_SITES:
			case SETTING_IDS.IMAGE_EXTENSIONS:
			case SETTING_IDS.VIDEO_EXTENSIONS:
				this._updateMediaRegex();
				if (this._settings[SETTING_IDS.ENABLED].value) {
					this._disable();
					this._enable();
				}
				break;
		}
	}

	_enable() {
		this._core.dom.nodes('message').forEach(this._onAddedChatItemMessage, this);
		this._core.dom.nodes('chapter').forEach(this._onAddedChapter, this);
		this._core.on(this._core.EVENTS.DOM.ADDED.CHAT_ITEM_MESSAGE, this._onAddedChatItemMessage, this);
		this._core.on(this._core.EVENTS.DOM.ADDED.CHAT_ITEM_FIELD_BODY, this._onAddedChatItemFieldBody, this);
		this._core.on(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
	}

	_disable() {
		this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAT_ITEM_MESSAGE, this._onAddedChatItemMessage, this);
		this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAT_ITEM_FIELD_BODY, this._onAddedChatItemFieldBody, this);
		this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
		Linker._disableLinks();
		Linker._disableImages();
		Linker._disableVideos();
	}

	static _disableLinks() {
		document.querySelectorAll('.akun-x-linker-link').forEach(Linker._disableNode);
	}

	static _disableImages() {
		document.querySelectorAll('.akun-x-linker-image').forEach(Linker._disableNode);
	}

	static _disableVideos() {
		document.querySelectorAll('.akun-x-linker-video').forEach(Linker._disableNode);
	}

	static _disableNode(node) {
		delete node.parentNode.dataset[Linker.id];
		const textNode = document.createTextNode(node.dataset.url);
		const parentNode = node.parentNode;
		parentNode.replaceChild(textNode, node);
		parentNode.normalize(); // Tidy up those fragmented text nodes
	}

	_updateMediaRegex() {
		const mediaSites = this._settings[SETTING_IDS.MEDIA_SITES].value.join('|');
		const imageExtensions = this._settings[SETTING_IDS.IMAGE_EXTENSIONS].value.join('|');
		const videoExtensions = this._settings[SETTING_IDS.VIDEO_EXTENSIONS].value.join('|');
		this._imageRegex = new RegExp(`https?://(${mediaSites})/.+\\.(${imageExtensions})($|\\?)`);
		this._videoRegex = new RegExp(`https?://(${mediaSites})/.+\\.(${videoExtensions})($|\\?)`);
		this._videoTypeRegex = new RegExp(`\\.(${videoExtensions})(?:$|\\?)`);
	}

	_onAddedChatItemMessage(node) {
		let contentNode = node.querySelector('.fieldBody');
		if (contentNode) {
			this._linkify(contentNode);
		}
	}

	_onAddedChatItemFieldBody(node) {
		this._linkify(node);
		if (node.classList.contains('angular-medium-editor')) {
			// When viewing a topic in its own tab the first post comes through as this, and can contain HTML elements
			//   if it is the topic OP
			node.querySelectorAll('p, span').forEach(this._linkify, this);
		}
	}

	_onAddedChapter(node) {
		let contentNode = node.querySelector('.fieldBody');
		if (contentNode) {
			this._linkify(contentNode);
			contentNode.querySelectorAll('p, span').forEach(this._linkify, this);
		}
	}

	_linkify(contentNode) {
		if (!contentNode.dataset[Linker.id]) {
			contentNode.dataset[Linker.id] = true;
			for (let node of contentNode.childNodes) {
				if (node.nodeType === Node.TEXT_NODE) {
					// Only touch text nodes to avoid interfering with any HTML
					let urlMatch = this._getURLRegex().exec(node.nodeValue);
					if (urlMatch) {
						let url = urlMatch[0];
						let newLink = this._getWrappedLink(url);
						let range = new Range();
						range.setStart(node, urlMatch.index);
						range.setEnd(node, urlMatch.index + url.length);
						range.deleteContents();
						range.insertNode(newLink);
					}
				}
			}
		}
	}

	_getWrappedLink(url) {
		if (this._settings[SETTING_IDS.EMBED_IMAGES].value && this.isImageUrl(url)) {
			let img = document.createElement('img');
			img.classList.add('akun-x-linker-image');
			img.dataset.url = url;
			img.src = url.replace(/^https?:\/\//, 'https://'); // Make it https
			img.onerror = function () {
				this.onerror = null;
				this.src = url;
			}; // Fallback to http if https fails
			return img;
		}

		if (this._settings[SETTING_IDS.EMBED_VIDEOS].value && this.isVideoUrl(url)) {
			let type = this._videoTypeRegex.exec(url);
			type = type && type[1];
			let vid = document.createElement('video');
			vid.classList.add('akun-x-linker-video');
			vid.dataset.url = url;
			vid.setAttribute('controls', 'controls');
			if (type === 'gifv') {
				// Handle Imgur's dumb idea
				let sourceWebm = document.createElement('source');
				sourceWebm.type = `video/webm`;
				sourceWebm.src = url.replace(/\.gifv/, '.webm');
				let sourceMp4 = document.createElement('source');
				sourceMp4.type = `video/mp4`;
				sourceMp4.src = url.replace(/\.gifv/, '.mp4');
				vid.appendChild(sourceWebm);
				vid.appendChild(sourceMp4);
			} else {
				let source = document.createElement('source');
				source.type = `video/${type}`;
				source.src = url;
				vid.appendChild(source);
			}
			return vid;
		}

		let link = document.createElement('a');
		link.classList.add('akun-x-linker-link');
		link.dataset.url = url;
		link.textContent = url;
		link.href = url;
		return link;
	}

	_getURLRegex() {
		if (this._settings[SETTING_IDS.STRICT_MODE].value) {
			return /https?:\/\/[A-z0-9\-\._~:\/\?#\[\]@\!\$&'\(\)*\+,;=%]+/;
		} else {
			return /https?:\/\/[^\s]+/;
		}
	}

	isImageUrl(url) {
		return this._imageRegex.test(url);
	}

	isVideoUrl(url) {
		return this._videoRegex.test(url);
	}
}
