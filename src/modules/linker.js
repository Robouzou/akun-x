'use strict';

const MODULE_ID = 'linker';
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
const videoExtensions = ['webm', 'mp4', 'gifv'];

export default class Linker {
	constructor(core, settings) {
		this._core = core;
		this._settings = settings;
		this._initialiseSettings();
		this._imageRegex = null;
		this._videoRegex = null;
		this._videoTypeRegex = null;
		this._updateMediaRegex();
		this._core.on('dom.added.chatItemMessage', this._onAddedChatItemMessage, this);
		this._core.on('dom.added.chatItemFieldBody', this._onAddedChatItemFieldBody, this);
		this._core.on('dom.added.chapter', this._onAddedChapter, this);
	}

	static get id() {
		return MODULE_ID;
	}

	_initialiseSettings() {
		if (!this._settings.embedImages) {
			this._settings.embedImages = {
				name: 'Embed Images',
				type: 'boolean',
				value: true
			}
		}
		if (!this._settings.embedVideos) {
			this._settings.embedVideos = {
				name: 'Embed Videos',
				type: 'boolean',
				value: true
			}
		}
		if (!this._settings.mediaSites) {
			this._settings.mediaSites = {
				name: 'Embed Videos',
				type: 'array',
				value: [
					'puu.sh',
					'i.imgur.com',
					'data.archive.moe',
					'i.4cdn.org',
					'i0.kym-cdn.com',
					'[\\S]*.deviantart.net'
				]
			}
		}
	}

	_updateMediaRegex() {
		let mediaSites = this._settings.mediaSites.value.join('|');
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
		if (this._settings.embedImages.value && this.isImageUrl(url)) {
			let img = document.createElement('img');
			img.src = url.replace(/^https?:\/\//, 'https://'); // Make it https
			img.onerror = function () {
				this.onerror = null;
				this.src = url;
			}; // Fallback to http if https fails
			return img;
		}

		if (this._settings.embedVideos.value && this.isVideoUrl(url)) {
			let type = this._videoTypeRegex.exec(url);
			type = type && type[1];
			if (type === 'gifv') {
				url = url.replace(/\.gifv/, '.webm'); // Works for imgur stuff
			}
			let vid = document.createElement('video');
			vid.setAttribute('controls', 'controls');
			let source = document.createElement('source');
			source.type = `video/${type}`;
			source.src = url;
			vid.appendChild(source);
			return vid;
		}

		let link = document.createElement('a');
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
