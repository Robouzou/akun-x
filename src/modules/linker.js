'use strict';

const MODULE_ID = 'linker';
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
const videoExtensions = ['webm', 'mp4', 'gifv'];

const DEFAULT_SETTINGS = {
	name: 'Linker',
	id: MODULE_ID,
	settings: {
		enabled: {
			name: 'Enabled',
			description:'Turn the Linker module on or off.',
			type: 'boolean',
			value: true
		},
		embedImages: {
			name: 'Embed Images',
			description:'Embed links recognised to be images as images instead.',
			type: 'boolean',
			value: true
		},
		embedVideos: {
			name: 'Embed Videos',
			description:'Embed links recognised to be videos as images instead.',
			type: 'boolean',
			value: true
		},
		mediaSites: {
			name: 'Media Sites',
			description:'Define a list of sites to embed links as media from. Used as a regex pattern.',
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
};

export default class Linker {
	constructor(core) {
		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS, this._onSettingsChanged.bind(this));
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

	_onSettingsChanged() {
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
			let vid = document.createElement('video');
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
