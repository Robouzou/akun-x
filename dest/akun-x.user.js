// ==UserScript==
// @name          AkunX
// @description   Extends the functionality of Akun to enhance the experience
// @author        Fiddlekins
// @version       1.0.0
// @namespace     https://github.com/Fiddlekins/akun-x
// @include       https://anonkun.com/*
// @include       http://anonkun.com/*
// @include       https://fiction.live/*
// @include       http://fiction.live/*
// @grant         none
// @updateURL     https://github.com/Fiddlekins/akun-x/raw/master/dest/akun-x.meta.js
// @downloadURL   https://github.com/Fiddlekins/akun-x/raw/master/dest/akun-x.user.js
// @icon          https://avatars2.githubusercontent.com/u/11947488
// ==/UserScript==

(function () {
'use strict';

function __$styleInject(css, returnValue) {
  if (typeof document === 'undefined') {
    return returnValue;
  }
  css = css || '';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
  return returnValue;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index = createCommonjsModule(function (module) {
  'use strict';

  var has = Object.prototype.hasOwnProperty,
      prefix = '~';

  /**
   * Constructor to create a storage for our `EE` objects.
   * An `Events` instance is a plain object whose properties are event names.
   *
   * @constructor
   * @api private
   */
  function Events() {}

  //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //
  if (Object.create) {
    Events.prototype = Object.create(null);

    //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //
    if (!new Events().__proto__) prefix = false;
  }

  /**
   * Representation of a single event listener.
   *
   * @param {Function} fn The listener function.
   * @param {Mixed} context The context to invoke the listener with.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   * @constructor
   * @api private
   */
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }

  /**
   * Minimal `EventEmitter` interface that is molded against the Node.js
   * `EventEmitter` interface.
   *
   * @constructor
   * @api public
   */
  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @api public
   */
  EventEmitter.prototype.eventNames = function eventNames() {
    var names = [],
        events,
        name;

    if (this._eventsCount === 0) return names;

    for (name in events = this._events) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
  };

  /**
   * Return the listeners registered for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Boolean} exists Only check if there are listeners.
   * @returns {Array|Boolean}
   * @api public
   */
  EventEmitter.prototype.listeners = function listeners(event, exists) {
    var evt = prefix ? prefix + event : event,
        available = this._events[evt];

    if (exists) return !!available;
    if (!available) return [];
    if (available.fn) return [available.fn];

    for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
      ee[i] = available[i].fn;
    }

    return ee;
  };

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @api public
   */
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return false;

    var listeners = this._events[evt],
        len = arguments.length,
        args,
        i;

    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length,
          j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);break;
          case 2:
            listeners[i].fn.call(listeners[i].context, a1);break;
          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);break;
          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);break;
          default:
            if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
              args[j - 1] = arguments[j];
            }

            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }

    return true;
  };

  /**
   * Add a listener for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Function} fn The listener function.
   * @param {Mixed} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.on = function on(event, fn, context) {
    var listener = new EE(fn, context || this),
        evt = prefix ? prefix + event : event;

    if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;else if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];

    return this;
  };

  /**
   * Add a one-time listener for a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Function} fn The listener function.
   * @param {Mixed} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.once = function once(event, fn, context) {
    var listener = new EE(fn, context || this, true),
        evt = prefix ? prefix + event : event;

    if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;else if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];

    return this;
  };

  /**
   * Remove the listeners of a given event.
   *
   * @param {String|Symbol} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {Mixed} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return this;
    if (!fn) {
      if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
      return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }

      //
      // Reset the array, or remove it completely if we have no more listeners.
      //
      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
    }

    return this;
  };

  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {String|Symbol} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @api public
   */
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) {
        if (--this._eventsCount === 0) this._events = new Events();else delete this._events[evt];
      }
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }

    return this;
  };

  //
  // Alias methods names because people roll like that.
  //
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  //
  // This function doesn't apply anymore.
  //
  EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
    return this;
  };

  //
  // Expose the prefix.
  //
  EventEmitter.prefixed = prefix;

  //
  // Allow `EventEmitter` to be imported as module namespace.
  //
  EventEmitter.EventEmitter = EventEmitter;

  //
  // Expose the module.
  //
  {
    module.exports = EventEmitter;
  }
});

var makeElastic = function makeElastic(node) {
	function resize() {
		// Gotta do this the long way since scrollHeight and it's kin are 0 if this is done when the element isn't visible
		var computedStyle = window.getComputedStyle(node);
		var lineCount = node.value.split('\n').length;
		var lineHeight = parseInt(computedStyle.lineHeight, 10);
		var borderTop = parseInt(computedStyle.borderTopWidth, 10);
		var borderBottom = parseInt(computedStyle.borderBottomWidth, 10);
		var paddingTop = parseInt(computedStyle.paddingTop, 10);
		var paddingBottom = parseInt(computedStyle.paddingBottom, 10);
		var height = lineCount * lineHeight + borderTop + paddingTop + paddingBottom + borderBottom;
		node.style.height = 'auto';
		node.style.height = height + 'px';
	}

	// 0-timeout to get the already changed text
	function delayedResize() {
		window.setTimeout(resize, 0);
	}

	node.addEventListener('change', resize, false);
	node.addEventListener('cut', delayedResize, false);
	node.addEventListener('paste', delayedResize, false);
	node.addEventListener('drop', delayedResize, false);
	node.addEventListener('keydown', delayedResize, false);

	node.focus();
	node.select();
	delayedResize();
};

__$styleInject(".akun-x-settings-backdrop{position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background-color:rgba(0,0,0,.5)}.akun-x-settings-horizontal-align{width:100%;height:100%}.akun-x-settings-horizontal-align,.akun-x-settings-vertical-align{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.akun-x-settings-vertical-align{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;width:40%;min-width:700px}.akun-x-settings-theme-light .akun-x-settings{background:#fff;border-color:#f7f9fa;box-shadow:0 3px 7px rgba(0,0,0,.3)}.akun-x-settings-theme-light .akun-x-settings-header{border-color:#f7f9fa}.akun-x-settings-theme-light .akun-x-settings-header-exit:hover{background:#f7f9fa}.akun-x-settings-theme-light .akun-x-settings-module-list{border-color:#f7f9fa}.akun-x-settings-theme-light .akun-x-settings-module-list-item:hover{background-color:#eaeced}.akun-x-settings-theme-light .akun-x-settings-selected{background-color:#f7f9fa}.akun-x-settings-theme-light .akun-x-settings-header-exit{color:#272727;text-shadow:0 1px 0 #fff}.akun-x-settings-theme-dark .akun-x-settings{background:#2a2c3b;border-color:#323448;box-shadow:0 3px 7px rgba(0,0,0,.3)}.akun-x-settings-theme-dark .akun-x-settings-header{border-color:#323448}.akun-x-settings-theme-dark .akun-x-settings-header-exit:hover{background:#323448}.akun-x-settings-theme-dark .akun-x-settings-module-list{border-color:#323448}.akun-x-settings-theme-dark .akun-x-settings-module-list-item:hover{background-color:#4c4f6d}.akun-x-settings-theme-dark .akun-x-settings-selected{background-color:#323448}.akun-x-settings-theme-dark .akun-x-settings-header-exit{color:#d4d5d9;text-shadow:0 1px 0 #fff}.akun-x-settings{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;height:50%;min-height:500px;border-radius:0;border-width:1px;border-style:solid;outline:0}.akun-x-settings,.akun-x-settings-header{display:-webkit-box;display:-ms-flexbox;display:flex}.akun-x-settings-header{-ms-flex-negative:0;flex-shrink:0;border-bottom-width:1px;border-style:solid}.akun-x-settings-header-title{margin:0;-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1}.akun-x-settings-header-issues,.akun-x-settings-header-title{vertical-align:middle;padding:0 16px;line-height:50px}.akun-x-settings-header-exit{height:50px;width:50px;padding:0;border:0;margin:0;opacity:.2;background:transparent;cursor:pointer;font-size:20px;font-weight:700;line-height:20px;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;-webkit-appearance:none;vertical-align:middle;box-sizing:border-box;-webkit-box-align:start;-ms-flex-align:start;align-items:flex-start;text-align:center;text-rendering:auto;letter-spacing:normal;word-spacing:normal;text-transform:none;text-indent:0;display:inline-block}.akun-x-settings-header-exit:hover{opacity:.4}.akun-x-settings-body{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;-webkit-box-align:stretch;-ms-flex-align:stretch;align-items:stretch}.akun-x-settings-module-list{overflow-y:auto;border-right-width:1px;border-style:solid}.akun-x-settings-module-list-item{padding:5px 16px;cursor:pointer}.akun-x-settings-module-details-container{-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;overflow-y:auto;padding:15px}.akun-x-settings-module-details>div{padding-bottom:10px}.akun-x-settings-setting-name{font-weight:700}.akun-x-settings-hidden{display:none!important}", undefined);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var LOCAL_STORAGE_KEY = 'akun-x';

var THEME_CLASS = {
	LIGHT: 'akun-x-settings-theme-light',
	DARK: 'akun-x-settings-theme-dark'
};

var SETTING_TYPES = {
	BOOLEAN: 'boolean',
	ARRAY: 'array'
};

/* Modules have default settings. When loading the locally stored settings, these defaults should be overridden where
 *   there are locally stored settings to do so.
 * If there are locally stored settings with no corresponding default these should be presumed to be caused by changes
 *   in setting structure and discarded to avoid bloating the storage.
 * The same is true for when settings stored under a module id don't have a corresponding module added.
 * Also, when storing settings only the key and value should be stored, and other immutable metadata should only be
 *   provided by the default settings.
 */

var Settings = function () {
	function Settings(core) {
		classCallCheck(this, Settings);

		this._core = core;
		this._styleElement = null;
		this._settings = {};
		this._loadedSettings = {};
		this._loadSettings();
		this._moduleCallbacks = {};
		this._backdropNode = null;
		this._menuNode = null;
		this._moduleListNode = null;
		this._moduleDetailsContainerNode = null;
		this._createMenu();
		this._hideMenu();
		document.body.appendChild(this._backdropNode);
		this._core.on('dom.added.mainMenu', this._onAddedMainMenu.bind(this));
	}

	createClass(Settings, [{
		key: 'addModule',
		value: function addModule(moduleSettings, callback) {
			var moduleId = moduleSettings.id;
			var settings = {};
			for (var settingName in moduleSettings.settings) {
				if (moduleSettings.settings.hasOwnProperty(settingName)) {
					settings[settingName] = moduleSettings.settings[settingName];
					var loadedSettings = this._loadedSettings[moduleId] && this._loadedSettings[moduleId][settingName];
					// If different types assume module has changed and default should be used
					if (loadedSettings && _typeof(loadedSettings.value) === _typeof(settings[settingName].value)) {
						settings[settingName].value = loadedSettings.value;
					}
				}
			}
			this._settings[moduleId] = settings;
			this._createModuleHTML(moduleSettings);
			this._moduleCallbacks[moduleId] = callback;
			return settings;
		}
	}, {
		key: '_createModuleHTML',
		value: function _createModuleHTML(moduleSettings) {
			var moduleListItemNode = document.createElement('li');
			moduleListItemNode.textContent = moduleSettings.name;
			moduleListItemNode.dataset.id = moduleSettings.id;
			moduleListItemNode.classList.add('akun-x-settings-module-list-item');
			var moduleDetailsNode = document.createElement('div');
			moduleDetailsNode.dataset.id = moduleSettings.id;
			moduleDetailsNode.classList.add('akun-x-settings-module-details');
			for (var settingName in moduleSettings.settings) {
				if (moduleSettings.settings.hasOwnProperty(settingName)) {
					var setting = moduleSettings.settings[settingName];
					var settingNode = document.createElement('div');
					moduleDetailsNode.appendChild(settingNode);
					var nameNode = document.createElement('div');
					nameNode.classList.add('akun-x-settings-setting-name');
					nameNode.textContent = setting.name;
					settingNode.appendChild(nameNode);
					var descriptionNode = document.createElement('div');
					descriptionNode.textContent = setting.description;
					var valueNode = void 0;
					switch (setting.type) {
						case SETTING_TYPES.BOOLEAN:
							valueNode = document.createElement('input');
							valueNode.type = 'checkbox';
							valueNode.dataset.id = settingName;
							valueNode.dataset.type = setting.type;
							valueNode.checked = setting.value;
							valueNode.style.float = 'left';
							settingNode.appendChild(valueNode);
							settingNode.appendChild(descriptionNode);
							break;
						case SETTING_TYPES.ARRAY:
							valueNode = document.createElement('textarea');
							valueNode.dataset.id = settingName;
							valueNode.dataset.type = setting.type;
							valueNode.value = setting.value.join('\n');
							settingNode.appendChild(descriptionNode);
							settingNode.appendChild(valueNode);
							makeElastic(valueNode);
							break;
					}
				}
			}
			this._moduleListNode.appendChild(moduleListItemNode);
			this._moduleDetailsContainerNode.appendChild(moduleDetailsNode);
		}
	}, {
		key: '_createMenu',
		value: function _createMenu() {
			var themeClass = this._core.theme === this._core.THEMES.DARK ? THEME_CLASS.DARK : THEME_CLASS.LIGHT;
			var backdropNode = document.createElement('div');
			backdropNode.classList.add('akun-x-settings-backdrop', themeClass);
			var horizontalAlignNode = document.createElement('div');
			horizontalAlignNode.classList.add('akun-x-settings-horizontal-align');
			var verticalAlignNode = document.createElement('div');
			verticalAlignNode.classList.add('akun-x-settings-vertical-align');
			var menuNode = document.createElement('div');
			menuNode.classList.add('akun-x-settings');
			var headerNode = document.createElement('div');
			headerNode.classList.add('akun-x-settings-header');
			var titleNode = document.createElement('h3');
			titleNode.classList.add('akun-x-settings-header-title');
			titleNode.textContent = 'AkunX';
			var issuesNode = document.createElement('a');
			issuesNode.classList.add('akun-x-settings-header-issues');
			issuesNode.textContent = 'Issues';
			issuesNode.href = 'https://github.com/Fiddlekins/akun-x/issues';
			var exitNode = document.createElement('button');
			exitNode.classList.add('akun-x-settings-header-exit');
			exitNode.type = 'button';
			exitNode.textContent = '×';
			var bodyNode = document.createElement('div');
			bodyNode.classList.add('akun-x-settings-body');
			var moduleListNode = document.createElement('ul');
			moduleListNode.classList.add('akun-x-settings-module-list');
			var moduleDetailsContainerNode = document.createElement('div');
			moduleDetailsContainerNode.classList.add('akun-x-settings-module-details-container');
			backdropNode.appendChild(horizontalAlignNode);
			horizontalAlignNode.appendChild(verticalAlignNode);
			verticalAlignNode.appendChild(menuNode);
			menuNode.appendChild(headerNode);
			headerNode.appendChild(titleNode);
			headerNode.appendChild(issuesNode);
			headerNode.appendChild(exitNode);
			menuNode.appendChild(bodyNode);
			bodyNode.appendChild(moduleListNode);
			bodyNode.appendChild(moduleDetailsContainerNode);

			exitNode.addEventListener('click', this._exitCallback.bind(this));
			moduleListNode.addEventListener('click', this._moduleListCallback.bind(this));
			moduleDetailsContainerNode.addEventListener('change', this._moduleDetailsCallback.bind(this));

			this._backdropNode = backdropNode;
			this._menuNode = menuNode;
			this._moduleListNode = moduleListNode;
			this._moduleDetailsContainerNode = moduleDetailsContainerNode;
		}
	}, {
		key: '_showMenu',
		value: function _showMenu() {
			this._backdropNode.classList.remove('akun-x-settings-hidden');
			this._moduleListNode.childNodes.forEach(function (node) {
				node.classList.remove('akun-x-settings-selected');
			});
			this._moduleDetailsContainerNode.childNodes.forEach(function (node) {
				node.classList.add('akun-x-settings-hidden');
			});
			this._moduleListNode.firstChild.classList.add('akun-x-settings-selected');
			this._moduleDetailsContainerNode.firstChild.classList.remove('akun-x-settings-hidden');
		}
	}, {
		key: '_hideMenu',
		value: function _hideMenu() {
			this._backdropNode.classList.add('akun-x-settings-hidden');
		}
	}, {
		key: '_loadSettings',
		value: function _loadSettings() {
			var settings = void 0;
			try {
				settings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
			} catch (err) {
				// Don't care
			}
			this._loadedSettings = settings || {};
		}
	}, {
		key: '_saveSettings',
		value: function _saveSettings() {
			var storageSettings = {};
			for (var moduleId in this._settings) {
				if (this._settings.hasOwnProperty(moduleId)) {
					storageSettings[moduleId] = {};
					for (var settingId in this._settings[moduleId]) {
						if (this._settings[moduleId].hasOwnProperty(settingId)) {
							storageSettings[moduleId][settingId] = {
								value: this._settings[moduleId][settingId].value
							};
						}
					}
				}
			}
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storageSettings));
		}
	}, {
		key: '_onAddedMainMenu',
		value: function _onAddedMainMenu(node) {
			var liNode = document.createElement('li');
			var aNode = document.createElement('a');
			aNode.textContent = 'AkunX';
			liNode.appendChild(aNode);
			liNode.addEventListener('click', this._menuButtonCallback.bind(this));
			node.querySelector('.boardsList').firstChild.appendChild(liNode);
		}
	}, {
		key: '_menuButtonCallback',
		value: function _menuButtonCallback(e) {
			this._showMenu();
		}
	}, {
		key: '_exitCallback',
		value: function _exitCallback(e) {
			this._hideMenu();
		}
	}, {
		key: '_moduleListCallback',
		value: function _moduleListCallback(e) {
			if (e.target.classList.contains('akun-x-settings-module-list-item')) {
				var moduleId = e.target.dataset.id;
				this._moduleListNode.childNodes.forEach(function (node) {
					if (node.dataset.id === moduleId) {
						node.classList.add('akun-x-settings-selected');
					} else {
						node.classList.remove('akun-x-settings-selected');
					}
				});
				this._moduleDetailsContainerNode.childNodes.forEach(function (node) {
					if (node.dataset.id === moduleId) {
						node.classList.remove('akun-x-settings-hidden');
					} else {
						node.classList.add('akun-x-settings-hidden');
					}
				});
			}
		}
	}, {
		key: '_moduleDetailsCallback',
		value: function _moduleDetailsCallback(e) {
			var type = e.target.dataset.type;
			var settingId = e.target.dataset.id;
			var moduleId = e.target.closest('.akun-x-settings-module-details').dataset.id;
			var newValue = void 0;
			switch (type) {
				case SETTING_TYPES.BOOLEAN:
					newValue = e.target.checked;
					break;
				case SETTING_TYPES.ARRAY:
					newValue = e.target.value.split('\n');
					break;
			}
			this._settings[moduleId][settingId].value = newValue;
			this._moduleCallbacks[moduleId](settingId);
			this._saveSettings();
		}
	}]);
	return Settings;
}();

var MutationObserver$1 = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

var EVENTS$1 = {
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

var ObserverDOM = function () {
	function ObserverDOM(eventEmitter) {
		var _this = this;

		classCallCheck(this, ObserverDOM);

		this._eventEmitter = eventEmitter;

		// jQuery already present on page
		$(document).ready(function () {
			_this._observeBody();
			document.querySelectorAll('.logItem').forEach(function (nodeLogItem) {
				_this._eventEmitter.emit(EVENTS$1.CHAT_NODE_ADDED, nodeLogItem);
				var nodeMessage = nodeLogItem.querySelector('.message');
				if (nodeMessage) {
					_this._eventEmitter.emit(EVENTS$1.CHAT_NODE_MESSAGE_ADDED, nodeMessage);
				}
			});
			document.querySelectorAll('.chapter').forEach(function (nodeChapter) {
				_this._eventEmitter.emit(EVENTS$1.CHAPTER_NODE_ADDED, nodeChapter);
			});
			document.querySelectorAll('.storyItem').forEach(function (nodeStoryItem) {
				_this._eventEmitter.emit(EVENTS$1.STORY_NODE_ADDED, nodeStoryItem);
			});
			_this._eventEmitter.emit(EVENTS$1.MAIN_MENU_ADDED, document.getElementById('mainMenu'));
		});
	}

	createClass(ObserverDOM, [{
		key: '_observeBody',
		value: function _observeBody() {
			ObserverDOM._observe(document.body, this._observerBodyFunction.bind(this), {
				childList: true,
				subtree: true
			});
		}
	}, {
		key: '_observerBodyFunction',
		value: function _observerBodyFunction(mutations) {
			var _this2 = this;

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = mutations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var mutation = _step.value;
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = mutation.addedNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var node = _step2.value;

							// console.log(node);
							if (node.classList) {
								if (node.classList.contains('logItem')) {
									this._eventEmitter.emit(EVENTS$1.CHAT_NODE_ADDED, node);
									var nodeMessage = node.querySelector('.message');
									if (nodeMessage) {
										this._eventEmitter.emit(EVENTS$1.CHAT_NODE_MESSAGE_ADDED, nodeMessage);
									}
								}
								if (node.classList.contains('message')) {
									this._eventEmitter.emit(EVENTS$1.CHAT_NODE_MESSAGE_ADDED, node);
								}
								if (node.classList.contains('jadeRepeat')) {
									node.querySelectorAll('.logItem').forEach(function (nodeLogItem) {
										_this2._eventEmitter.emit(EVENTS$1.CHAT_NODE_ADDED, nodeLogItem);
										var nodeMessage = nodeLogItem.querySelector('.message');
										if (nodeMessage) {
											_this2._eventEmitter.emit(EVENTS$1.CHAT_NODE_MESSAGE_ADDED, nodeMessage);
										}
									});
									node.querySelectorAll('.chapter').forEach(function (nodeChapter) {
										_this2._eventEmitter.emit(EVENTS$1.CHAPTER_NODE_ADDED, nodeChapter);
									});
								}
								if (node.classList.contains('chapter')) {
									this._eventEmitter.emit(EVENTS$1.CHAPTER_NODE_ADDED, node);
								}
								if (node.classList.contains('fieldBody')) {
									this._eventEmitter.emit(EVENTS$1.CHAT_NODE_FIELD_BODY_ADDED, node);
								}
								if (node.classList.contains('storyItem')) {
									this._eventEmitter.emit(EVENTS$1.STORY_NODE_ADDED, node);
								}
								if (node.classList.contains('chatContainer')) {
									this._eventEmitter.emit(EVENTS$1.CHAT_HEADER_ADDED, node.querySelector('.chatHeader'));
								}
								if (node.classList.contains('secondRow')) {
									this._eventEmitter.emit(EVENTS$1.CHAPTER_BUTTON_CONTROLS_ADDED, node);
								}
								if (node.classList.contains('chatLight')) {
									node.querySelectorAll('.logItem').forEach(function (nodeLogItem) {
										_this2._eventEmitter.emit(EVENTS$1.CHAT_NODE_ADDED, nodeLogItem);
										var nodeMessage = nodeLogItem.querySelector('.message');
										if (nodeMessage) {
											_this2._eventEmitter.emit(EVENTS$1.CHAT_NODE_MESSAGE_ADDED, nodeMessage);
										}
									});
								}
								if (node.classList.contains('chatItemDetail')) {
									this._eventEmitter.emit(EVENTS$1.MODAL_NODE_ADDED, node);
								}
							}
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}], [{
		key: '_observe',
		value: function _observe(node, callback, config) {
			var observer = new MutationObserver$1(callback);
			observer.observe(node, config);
		}
	}]);
	return ObserverDOM;
}();

var EVENTS$2 = {
	LIVE_STORIES: 'net.received.liveStories',
	BOARDS: 'net.received.boards',
	FOLLOWING_LIST: 'net.received.followingList',
	USER_COLLECTIONS: 'net.received.userCollections',
	SAVES: 'net.received.saves',
	REF_LATEST: 'net.received.refLatest',
	REVIEW_PREVIEW: 'net.received.reviewPreview',
	CHAPTER_THREADS: 'net.received.chapterThreads',
	THREAD_PAGES: 'net.received.threadPages',
	THREAD_MESSAGES: 'net.received.threadMessages',
	POST_CHAPTER: 'net.posted.chapter',
	POST_NODE: 'net.posted.node'
};

var ObserverNet = function () {
	function ObserverNet(eventEmitter) {
		classCallCheck(this, ObserverNet);

		this._eventEmitter = eventEmitter;

		// jQuery already present on page
		$(document).ajaxComplete(this._onAjaxComplete.bind(this));
	}

	createClass(ObserverNet, [{
		key: '_onAjaxComplete',
		value: function _onAjaxComplete(event, request, settings) {
			var urlFragments = settings.url.split('/');
			urlFragments.shift(); // Remove initial empty element
			switch (urlFragments[0]) {
				case 'api':
					switch (urlFragments[1]) {
						case 'anonkun':
							switch (urlFragments[2]) {
								case 'board':
									if (urlFragments[3] === 'live') {
										this._eventEmitter.emit(EVENTS$2.LIVE_STORIES, request.responseJSON);
									} else {
										console.log('Unhandled network request: ' + settings.url);
									}
									break;
								case 'boards':
									this._eventEmitter.emit(EVENTS$2.BOARDS, request.responseJSON, parseInt(urlFragments[3], 10));
									break;
								case 'chapter':
									this._eventEmitter.emit(EVENTS$2.POST_CHAPTER, request.responseJSON);
									break;
								case 'chapterThreads':
									this._eventEmitter.emit(EVENTS$2.CHAPTER_THREADS, request.responseJSON);
									break;
								case 'following':
									this._eventEmitter.emit(EVENTS$2.FOLLOWING_LIST, request.responseJSON, urlFragments[3]);
									break;
								case 'refLatest':
									this._eventEmitter.emit(EVENTS$2.REF_LATEST, request.responseJSON, urlFragments[3]);
									break;
								case 'review':
									if (urlFragments[4] === 'preview') {
										this._eventEmitter.emit(EVENTS$2.REVIEW_PREVIEW, request.responseJSON, urlFragments[3]);
									} else {
										console.log('Unhandled network request: ' + settings.url);
									}
									break;
								case 'saves':
									this._eventEmitter.emit(EVENTS$2.SAVES, request.responseJSON, urlFragments[3]);
									break;
								case 'userCollections':
									this._eventEmitter.emit(EVENTS$2.USER_COLLECTIONS, request.responseJSON, urlFragments[3]);
									break;
								default:
									console.log('Unhandled network request: ' + settings.url);
							}
							break;
						case 'node':
							this._eventEmitter.emit(EVENTS$2.POST_NODE, request.responseJSON);
							break;
						case 'thread':
							if (urlFragments[3] === 'pages') {
								this._eventEmitter.emit(EVENTS$2.THREAD_PAGES, request.responseJSON, urlFragments[2]);
							} else {
								this._eventEmitter.emit(EVENTS$2.THREAD_MESSAGES, request.responseJSON, urlFragments[2], urlFragments[3], urlFragments[4]);
							}
							break;
						default:
							console.log('Unhandled network request: ' + settings.url);
					}
					break;
				default:
					console.log('Unhandled network request: ' + settings.url);
			}
		}
	}], [{
		key: '_observe',
		value: function _observe(node, callback, config) {
			var observer = new MutationObserver(callback);
			observer.observe(node, config);
		}
	}]);
	return ObserverNet;
}();

var EVENTS = {
	FOCUS: 'focus'
};

var THEMES = {
	LIGHT: 'snowdrift',
	DARK: 'dark'
};

var Core = function (_EventEmitter) {
	inherits(Core, _EventEmitter);

	function Core() {
		classCallCheck(this, Core);

		var _this = possibleConstructorReturn(this, (Core.__proto__ || Object.getPrototypeOf(Core)).call(this));

		_this._settings = new Settings(_this);
		_this._observerDOM = new ObserverDOM(_this);
		_this._observerNet = new ObserverNet(_this);
		_this._modules = {};

		window.onfocus = function () {
			_this.emit(EVENTS.FOCUS);
		};
		return _this;
	}

	createClass(Core, [{
		key: 'addModule',
		value: function addModule(module) {
			var id = module.id;
			this._modules[id] = new module(this);
		}
	}, {
		key: 'settings',
		get: function get$$1() {
			return this._settings;
		}
	}, {
		key: 'currentUser',
		get: function get$$1() {
			// This returns reference to what Akun is using
			return $(document)['scope']()['currentUser'];
		}
	}, {
		key: 'theme',
		get: function get$$1() {
			return (/themeColor=("|%22)?dark("|%22)?/i.test(document.cookie) ? THEMES.DARK : THEMES.LIGHT
			);
		}
	}, {
		key: 'EVENTS',
		get: function get$$1() {
			return EVENTS;
		}
	}, {
		key: 'THEMES',
		get: function get$$1() {
			return THEMES;
		}
	}]);
	return Core;
}(index);

__$styleInject(".akun-x-anon-toggle{-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.akun-x-anon-toggle .avatar{margin-right:4px;display:inline;border-radius:2em;position:relative;top:-1px}", undefined);

var MODULE_ID = 'anonToggle';

var SETTING_IDS = {
	ENABLED: 'enabled'
};

var DEFAULT_SETTINGS = {
	name: 'Anon Toggle',
	id: MODULE_ID,
	settings: {}
};

DEFAULT_SETTINGS.settings[SETTING_IDS.ENABLED] = {
	name: 'Enabled',
	description: 'Turn the Anon Toggle module on or off.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

var AnonToggle = function () {
	function AnonToggle(core) {
		classCallCheck(this, AnonToggle);

		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS, this._onSettingsChanged.bind(this));
		this._onClickShouldSetToAnon = false;
		this._toggleElement = null;
		this._avatarElement = null;
		this._usernameElement = null;
		this._createToggleElement();
		if (this._settings[SETTING_IDS.ENABLED].value) {
			this._enable();
		}
	}

	createClass(AnonToggle, [{
		key: '_onSettingsChanged',
		value: function _onSettingsChanged(settingId) {
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
	}, {
		key: '_enable',
		value: function _enable() {
			// Don't do anything if the user isn't logged in (and thus doesn't have any settings available)
			if (this._core.currentUser) {
				this._core.on('focus', this._onFocus, this);
				this._core.on('dom.added.chatHeader', this._onAddedChatHeader, this);
			}
		}
	}, {
		key: '_disable',
		value: function _disable() {
			this._core.removeListener('focus', this._onFocus, this);
			this._core.removeListener('dom.added.chatHeader', this._onAddedChatHeader, this);
		}
	}, {
		key: '_createToggleElement',
		value: function _createToggleElement() {
			var toggleElement = document.createElement('div');
			toggleElement.classList.add('akun-x-anon-toggle', 'noselect', 'btn', 'dim-font-color', 'hover-font-color');
			toggleElement.addEventListener('click', this._toggleClickCallback.bind(this));
			var avatarElement = document.createElement('img');
			avatarElement.classList.add('avatar');
			var usernameElement = document.createElement('span');
			toggleElement.appendChild(avatarElement);
			toggleElement.appendChild(usernameElement);
			this._toggleElement = toggleElement;
			this._avatarElement = avatarElement;
			this._usernameElement = usernameElement;
		}
	}, {
		key: '_toggleClickCallback',
		value: function _toggleClickCallback(e) {
			var currentUser = this._core.currentUser;
			currentUser['profile']['asAnon'] = this._onClickShouldSetToAnon;
			this._updateProfileSettings(currentUser['profile']);
			this._updateToggleElement(currentUser);
		}
	}, {
		key: '_onFocus',
		value: function _onFocus() {
			var currentUser = this._core.currentUser;
			var asAnon = localStorage.getItem('akun-x-anon-toggle-as-anon');
			if (asAnon !== null) {
				currentUser['profile']['asAnon'] = asAnon === 'true';
			}
			this._updateToggleElement(currentUser);
		}
	}, {
		key: '_onAddedChatHeader',
		value: function _onAddedChatHeader(node) {
			node.querySelector('.pagination-dropdown').appendChild(this._toggleElement);
			var currentUser = this._core.currentUser;
			this._updateToggleElement(currentUser);
		}
	}, {
		key: '_updateProfileSettings',
		value: function _updateProfileSettings(profile) {
			localStorage.setItem('akun-x-anon-toggle-as-anon', profile['asAnon']);
			ty.put('user', profile);
		}
	}, {
		key: '_updateToggleElement',
		value: function _updateToggleElement(currentUser) {
			if (currentUser['profile']['asAnon']) {
				this._onClickShouldSetToAnon = false;
				this._usernameElement.textContent = 'Anon';
				this._avatarElement.style.display = 'none';
			} else {
				this._onClickShouldSetToAnon = true;
				this._usernameElement.textContent = currentUser['username'];
				this._avatarElement.style.display = 'inline';
				this._avatarElement.src = currentUser['profile']['image'] + '/convert?w=16&h=16&fit=crop&cache=true';
			}
		}
	}], [{
		key: 'id',
		get: function get$$1() {
			return MODULE_ID;
		}
	}]);
	return AnonToggle;
}();

__$styleInject(".akun-x-chapter-html-editor-disabled{opacity:.5;pointer-events:none}", undefined);

var MODULE_ID$1 = 'chapterHtmlEditor';

var SETTING_IDS$1 = {
	ENABLED: 'enabled'
};

var DEFAULT_SETTINGS$1 = {
	name: 'Chapter HTML Editor',
	id: MODULE_ID$1,
	settings: {}
};

DEFAULT_SETTINGS$1.settings[SETTING_IDS$1.ENABLED] = {
	name: 'Enabled',
	description: 'Turn the Chapter HTML Editor module on or off.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

var ChapterHTMLEditor = function () {
	function ChapterHTMLEditor(core) {
		classCallCheck(this, ChapterHTMLEditor);

		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS$1, this._onSettingsChanged.bind(this));
		if (this._settings[SETTING_IDS$1.ENABLED].value) {
			this._enable();
		}
	}

	createClass(ChapterHTMLEditor, [{
		key: '_onSettingsChanged',
		value: function _onSettingsChanged(settingId) {
			switch (settingId) {
				case SETTING_IDS$1.ENABLED:
					if (this._settings[SETTING_IDS$1.ENABLED].value) {
						this._enable();
					} else {
						this._disable();
					}
					break;
			}
		}
	}, {
		key: '_enable',
		value: function _enable() {
			this._core.on('dom.added.chapter', this._onAddedChapter, this);
			this._core.on('dom.added.chapterButtonControls', this._onAddedChapterButtonControls, this);
		}
	}, {
		key: '_disable',
		value: function _disable() {
			this._core.removeListener('dom.added.chapter', this._onAddedChapter, this);
			this._core.removeListener('dom.added.chapterButtonControls', this._onAddedChapterButtonControls, this);
		}
	}, {
		key: '_onAddedChapter',
		value: function _onAddedChapter(node) {
			var buttonGroupNode = node.querySelector('.chapter-footer .btn-group');
			if (buttonGroupNode) {
				this._addEditButton(buttonGroupNode);
			}
		}
	}, {
		key: '_onAddedChapterButtonControls',
		value: function _onAddedChapterButtonControls(node) {
			this._addEditButton(node.querySelector('.btn-group'));
		}
	}, {
		key: '_addEditButton',
		value: function _addEditButton(node) {
			if (!node.dataset[ChapterHTMLEditor.id] && !node.classList.contains('choice')) {
				node.dataset[ChapterHTMLEditor.id] = true;
				var htmlEditButtonNode = document.createElement('a');
				htmlEditButtonNode.classList.add('akun-x-chapter-html-editor-edit', 'btn', 'very-dim-font-color', 'hover-font-color');
				htmlEditButtonNode.textContent = 'Edit HTML';
				htmlEditButtonNode.addEventListener('click', this._editButtonCallback.bind(this));
				node.insertBefore(htmlEditButtonNode, node.firstChild);
			}
		}
	}, {
		key: '_editButtonCallback',
		value: function _editButtonCallback(e) {
			var chapterNode = e.target.closest('.chapter');
			e.target.parentElement.querySelector('.editChapter').click(); // Trigger native site edit behaviour
			var buttonGroupNode = chapterNode.querySelector('.editChapter .btn-group'); // Grab the newly displayed button group
			var fieldEditorNode = chapterNode.querySelector('.fieldEditor');
			fieldEditorNode.textContent = fieldEditorNode.innerHTML; // Override displayed content
			chapterNode.querySelector('.save').style.display = 'none'; // Remove native save button
			var htmlSaveButtonNode = document.createElement('div');
			htmlSaveButtonNode.classList.add('akun-x-chapter-html-editor-save', 'btn', 'btn-primary');
			htmlSaveButtonNode.textContent = 'Save HTML and close';
			htmlSaveButtonNode.addEventListener('click', this._saveButtonCallback.bind(this));
			buttonGroupNode.appendChild(htmlSaveButtonNode); // Add custom save button
		}
	}, {
		key: '_saveButtonCallback',
		value: function _saveButtonCallback(e) {
			var chapterNode = e.target.closest('.chapter');
			var buttonGroupNode = chapterNode.querySelector('.editChapter .btn-group');
			buttonGroupNode.classList.add('akun-x-chapter-html-editor-disabled');
			ty.post('anonkun/editChapter', {
				'_id': chapterNode.dataset.id,
				'update[$set][b]': chapterNode.querySelector('.fieldEditor').textContent,
				'update[$set][t]': undefined
			}, function (response) {
				buttonGroupNode.classList.remove('akun-x-chapter-html-editor-disabled');
				buttonGroupNode.querySelector('.cancel').click();
			});
		}
	}], [{
		key: 'id',
		get: function get$$1() {
			return MODULE_ID$1;
		}
	}]);
	return ChapterHTMLEditor;
}();

var MODULE_ID$2 = 'linker';
var imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
var videoExtensions = ['webm', 'mp4', 'gifv'];

var SETTING_IDS$2 = {
	ENABLED: 'enabled',
	EMBED_IMAGES: 'embedImages',
	EMBED_VIDEOS: 'embedVideos',
	MEDIA_SITES: 'mediaSites'
};

var DEFAULT_SETTINGS$2 = {
	name: 'Linker',
	id: MODULE_ID$2,
	settings: {}
};

DEFAULT_SETTINGS$2.settings[SETTING_IDS$2.ENABLED] = {
	name: 'Enabled',
	description: 'Turn the Linker module on or off.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS$2.settings[SETTING_IDS$2.EMBED_IMAGES] = {
	name: 'Embed Images',
	description: 'Embed links recognised to be images as images instead.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS$2.settings[SETTING_IDS$2.EMBED_VIDEOS] = {
	name: 'Embed Videos',
	description: 'Embed links recognised to be videos as images instead.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

DEFAULT_SETTINGS$2.settings[SETTING_IDS$2.MEDIA_SITES] = {
	name: 'Media Sites',
	description: 'Define a list of sites to embed links as media from. Used as a regex pattern.',
	type: SETTING_TYPES.ARRAY,
	value: ['puu.sh', 'i.imgur.com', 'data.archive.moe', 'i.4cdn.org', 'i0.kym-cdn.com', '[\\S]*.deviantart.net']
};

var Linker = function () {
	function Linker(core) {
		classCallCheck(this, Linker);

		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS$2, this._onSettingsChanged.bind(this));
		this._imageRegex = null;
		this._videoRegex = null;
		this._videoTypeRegex = null;
		this._updateMediaRegex();
		if (this._settings[SETTING_IDS$2.ENABLED].value) {
			this._enable();
		}
	}

	createClass(Linker, [{
		key: '_onSettingsChanged',
		value: function _onSettingsChanged(settingId) {
			switch (settingId) {
				case SETTING_IDS$2.ENABLED:
					if (this._settings[SETTING_IDS$2.ENABLED].value) {
						this._enable();
					} else {
						this._disable();
					}
					break;
				case SETTING_IDS$2.MEDIA_SITES:
					this._updateMediaRegex();
					break;
			}
		}
	}, {
		key: '_enable',
		value: function _enable() {
			this._core.on('dom.added.chatItemMessage', this._onAddedChatItemMessage, this);
			this._core.on('dom.added.chatItemFieldBody', this._onAddedChatItemFieldBody, this);
			this._core.on('dom.added.chapter', this._onAddedChapter, this);
		}
	}, {
		key: '_disable',
		value: function _disable() {
			this._core.removeListener('dom.added.chatItemMessage', this._onAddedChatItemMessage, this);
			this._core.removeListener('dom.added.chatItemFieldBody', this._onAddedChatItemFieldBody, this);
			this._core.removeListener('dom.added.chapter', this._onAddedChapter, this);
		}
	}, {
		key: '_updateMediaRegex',
		value: function _updateMediaRegex() {
			var mediaSites = this._settings[SETTING_IDS$2.MEDIA_SITES].value.join('|');
			this._imageRegex = new RegExp('https?://(' + mediaSites + ')/.+\\.(' + imageExtensions.join('|') + ')($|\\?)');
			this._videoRegex = new RegExp('https?://(' + mediaSites + ')/.+\\.(' + videoExtensions.join('|') + ')($|\\?)');
			this._videoTypeRegex = new RegExp('\\.(' + videoExtensions.join('|') + ')(?:$|\\?)');
		}
	}, {
		key: '_onAddedChatItemMessage',
		value: function _onAddedChatItemMessage(node) {
			var contentNode = node.querySelector('.fieldBody');
			if (contentNode) {
				this._linkify(contentNode);
			}
		}
	}, {
		key: '_onAddedChatItemFieldBody',
		value: function _onAddedChatItemFieldBody(node) {
			this._linkify(node);
			if (node.classList.contains('angular-medium-editor')) {
				// When viewing a topic in its own tab the first post comes through as this, and can contain HTML elements
				//   if it is the topic OP
				node.querySelectorAll('p, span').forEach(this._linkify, this);
			}
		}
	}, {
		key: '_onAddedChapter',
		value: function _onAddedChapter(node) {
			var contentNode = node.querySelector('.fieldBody');
			if (contentNode) {
				this._linkify(contentNode);
				contentNode.querySelectorAll('p, span').forEach(this._linkify, this);
			}
		}
	}, {
		key: '_linkify',
		value: function _linkify(contentNode) {
			if (!contentNode.dataset[Linker.id]) {
				contentNode.dataset[Linker.id] = true;
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = contentNode.childNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var node = _step.value;

						if (node.nodeType === Node.TEXT_NODE) {
							// Only touch text nodes to avoid interfering with any HTML
							var urlMatch = /https?:\/\/[A-z0-9\-\._~:\/\?#\[\]@\!\$&'\(\)*\+,;=%]+/.exec(node.nodeValue);
							if (urlMatch) {
								var url = urlMatch[0];
								var newLink = this._getWrappedLink(url);
								var range = new Range();
								range.setStart(node, urlMatch.index);
								range.setEnd(node, urlMatch.index + url.length);
								range.deleteContents();
								range.insertNode(newLink);
							}
						}
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}
		}
	}, {
		key: '_getWrappedLink',
		value: function _getWrappedLink(url) {
			if (this._settings[SETTING_IDS$2.EMBED_IMAGES].value && this.isImageUrl(url)) {
				var img = document.createElement('img');
				img.src = url.replace(/^https?:\/\//, 'https://'); // Make it https
				img.onerror = function () {
					this.onerror = null;
					this.src = url;
				}; // Fallback to http if https fails
				return img;
			}

			if (this._settings[SETTING_IDS$2.EMBED_VIDEOS].value && this.isVideoUrl(url)) {
				var type = this._videoTypeRegex.exec(url);
				type = type && type[1];
				var vid = document.createElement('video');
				vid.setAttribute('controls', 'controls');
				if (type === 'gifv') {
					// Handle Imgur's dumb idea
					var sourceWebm = document.createElement('source');
					sourceWebm.type = 'video/webm';
					sourceWebm.src = url.replace(/\.gifv/, '.webm');
					var sourceMp4 = document.createElement('source');
					sourceMp4.type = 'video/mp4';
					sourceMp4.src = url.replace(/\.gifv/, '.mp4');
					vid.appendChild(sourceWebm);
					vid.appendChild(sourceMp4);
				} else {
					var source = document.createElement('source');
					source.type = 'video/' + type;
					source.src = url;
					vid.appendChild(source);
				}
				return vid;
			}

			var link = document.createElement('a');
			link.textContent = url;
			link.href = url;
			return link;
		}
	}, {
		key: 'isImageUrl',
		value: function isImageUrl(url) {
			return this._imageRegex.test(url);
		}
	}, {
		key: 'isVideoUrl',
		value: function isVideoUrl(url) {
			return this._videoRegex.test(url);
		}
	}], [{
		key: 'id',
		get: function get$$1() {
			return MODULE_ID$2;
		}
	}]);
	return Linker;
}();

var MODULE_ID$3 = 'liveImages';

var SETTING_IDS$3 = {
	ENABLED: 'enabled'
};

var DEFAULT_SETTINGS$3 = {
	name: 'Live Images',
	id: MODULE_ID$3,
	settings: {}
};

DEFAULT_SETTINGS$3.settings[SETTING_IDS$3.ENABLED] = {
	name: 'Enabled',
	description: 'Turn the Live Images module on or off.',
	type: SETTING_TYPES.BOOLEAN,
	value: true
};

var PLACEHOLDER_IMAGE_URL = 'https://cdn.fiction.live/h180-w320-cfill/images/1bfbkfv80_Feline_Heart.jpg';

var LiveImages = function () {
	function LiveImages(core) {
		classCallCheck(this, LiveImages);

		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS$3, this._onSettingsChanged.bind(this));
		this._storyIdToImageMap = new Map();
		if (this._settings[SETTING_IDS$3.ENABLED].value) {
			this._enable();
		}
	}

	createClass(LiveImages, [{
		key: '_onSettingsChanged',
		value: function _onSettingsChanged(settingId) {
			switch (settingId) {
				case SETTING_IDS$3.ENABLED:
					if (this._settings[SETTING_IDS$3.ENABLED].value) {
						this._enable();
					} else {
						this._disable();
					}
					break;
			}
		}
	}, {
		key: '_enable',
		value: function _enable() {
			this._core.on('net.received.liveStories', this._onLiveStories, this);
			this._core.on('dom.added.storyItem', this._onAddedStoryItem, this);
		}
	}, {
		key: '_disable',
		value: function _disable() {
			this._core.removeListener('net.received.liveStories', this._onLiveStories, this);
			this._core.removeListener('dom.added.storyItem', this._onAddedStoryItem, this);
		}
	}, {
		key: '_fetchLiveData',
		value: function _fetchLiveData() {
			fetch('/api/anonkun/board/live').then(function (response) {
				return response.json();
			}).then(function (json) {}).catch(console.error);
		}
	}, {
		key: '_onLiveStories',
		value: function _onLiveStories(json) {
			var _this = this;

			if (json && json['stories']) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = json['stories'][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var story = _step.value;

						var imageUrl = story['i'] && story['i'][0];
						this._storyIdToImageMap.set(story['_id'], imageUrl);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				document.querySelectorAll('.storyItem').forEach(function (nodeStoryItem) {
					_this._addImageToNode(nodeStoryItem);
				});
			}
		}
	}, {
		key: '_onAddedStoryItem',
		value: function _onAddedStoryItem(node) {
			this._addImageToNode(node);
		}
	}, {
		key: '_addImageToNode',
		value: function _addImageToNode(node) {
			if (!node.dataset[LiveImages.id]) {
				node.dataset[LiveImages.id] = true;
				var storyId = node.href.split('/')[5];
				var imageUrl = this._storyIdToImageMap.get(storyId) || PLACEHOLDER_IMAGE_URL;
				var imageNode = document.createElement('img');
				imageNode.classList.add('akun-x-live-images');
				imageNode.dataset.storyId = storyId;
				imageNode.src = imageUrl;
				node.querySelector('.container').appendChild(imageNode);
			} else {
				var _imageNode = node.querySelector('.akun-x-live-images');
				var _storyId = _imageNode.dataset.storyId;
				_imageNode.src = this._storyIdToImageMap.get(_storyId) || PLACEHOLDER_IMAGE_URL;
			}
		}
	}], [{
		key: 'id',
		get: function get$$1() {
			return MODULE_ID$3;
		}
	}]);
	return LiveImages;
}();

var core = new Core();

core.addModule(AnonToggle);
core.addModule(ChapterHTMLEditor);
core.addModule(Linker);
core.addModule(LiveImages);

}());
