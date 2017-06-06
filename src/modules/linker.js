'use strict';

import {SETTING_TYPES} from '../core/settings';

const MODULE_ID = 'linker';
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
const videoExtensions = ['webm', 'mp4', 'gifv'];

const SETTING_IDS = {
	ENABLED: 'enabled',
	EMBED_IMAGES: 'embedImages',
	EMBED_VIDEOS: 'embedVideos',
	MEDIA_SITES: 'mediaSites'
};

const DEFAULT_SETTINGS = {
	name: 'Linker',
	id: MODULE_ID,
	settings: {}
};

DEFAULT_SETTINGS.settings[SETTING_IDS.ENABLED] = {
	name: 'Enabled',
	description: 'Turn the Linker module on or off.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS.settings[SETTING_IDS.EMBED_IMAGES] = {
	name: 'Embed Images',
	description: 'Embed links recognised to be images as images instead.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS.settings[SETTING_IDS.EMBED_VIDEOS] = {
	name: 'Embed Videos',
	description: 'Embed links recognised to be videos as images instead.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS.settings[SETTING_IDS.MEDIA_SITES] = {
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
			case SETTING_IDS.EMBED_IMAGES:
				if (this._settings[SETTING_IDS.EMBED_IMAGES].value) {
					this._disable();
					if (this._settings[SETTING_IDS.ENABLED].value) {
						this._enable();
					}
				} else {
					this._disableImages();
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
					this._disableVideos();
					if (this._settings[SETTING_IDS.ENABLED].value) {
						this._enable();
					}
				}
				break;
			case SETTING_IDS.MEDIA_SITES:
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
		this._core.on('dom.added.chatItemMessage', this._onAddedChatItemMessage, this);
		this._core.on('dom.added.chatItemFieldBody', this._onAddedChatItemFieldBody, this);
		this._core.on('dom.added.chapter', this._onAddedChapter, this);
	}

	_disable() {
		this._core.removeListener('dom.added.chatItemMessage', this._onAddedChatItemMessage, this);
		this._core.removeListener('dom.added.chatItemFieldBody', this._onAddedChatItemFieldBody, this);
		this._core.removeListener('dom.added.chapter', this._onAddedChapter, this);
		this._disableLinks();
		this._disableImages();
		this._disableVideos();
	}

	_disableLinks() {
		document.querySelectorAll('.akun-x-linker-link').forEach(node => {
			delete node.parentNode.dataset[Linker.id];
			const textNode = document.createTextNode(node.href);
			node.parentNode.replaceChild(textNode, node);
		});
	}

	_disableImages() {
		document.querySelectorAll('.akun-x-linker-image').forEach(node => {
			delete node.parentNode.dataset[Linker.id];
			const textNode = document.createTextNode(node.src);
			node.parentNode.replaceChild(textNode, node);
		});
	}

	_disableVideos() {
		document.querySelectorAll('.akun-x-linker-video').forEach(node => {
			delete node.parentNode.dataset[Linker.id];
			const textNode = document.createTextNode(node.dataset.src);
			node.parentNode.replaceChild(textNode, node);
		});
	}

	_updateMediaRegex() {
		let mediaSites = this._settings[SETTING_IDS.MEDIA_SITES].value.join('|');
		this._imageRegex = new RegExp(`https?://(${mediaSites})/.+\\.(${imageExtensions.join('|')})($|\\?)`);
		this._videoRegex = new RegExp(`https?://(${mediaSites})/.+\\.(${videoExtensions.join('|')})($|\\?)`);
		this._videoTypeRegex = new RegExp(`\\.(${videoExtensions.join('|')})(?:$|\\?)`);
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
					let urlMatch = /https?:\/\/[A-z0-9\-\._~:\/\?#\[\]@\!\$&'\(\)*\+,;=%]+/.exec(node.nodeValue);
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
			vid.dataset.src = url;
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
		link.textContent = url;
		link.href = url;
		return link;
	}

	isImageUrl(url) {
		return this._imageRegex.test(url);
	}

	isVideoUrl(url) {
		return this._videoRegex.test(url);
	}
}
