// ==UserScript==
// @name          AkunX
// @description   Extends the functionality of Akun to enhance the experience
// @author        Fiddlekins
// @version       1.1.9
// @namespace     https://github.com/Fiddlekins/akun-x
// @include       https://anonkun.com/*
// @include       http://anonkun.com/*
// @include       https://fiction.live/*
// @include       http://fiction.live/*
// @include       https://beta.fiction.live/*
// @include       http://beta.fiction.live/*
// @grant         none
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
	node.addEventListener('focus', delayedResize, false);

	node.focus();
	node.select();
	delayedResize();
};



var doesObjectShareValues = function doesObjectShareValues(obj1, obj2) {
	for (var property in obj1) {
		if (obj1.hasOwnProperty(property) && obj2[property] !== obj1[property]) {
			return false;
		}
	}
	return true;
};

__$styleInject(".akun-x-settings-backdrop{position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background-color:rgba(0,0,0,.5)}.akun-x-settings-horizontal-align{width:100%;height:100%}.akun-x-settings-horizontal-align,.akun-x-settings-vertical-align{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.akun-x-settings-vertical-align{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;width:40%;min-width:700px}.akun-x-theme-light .akun-x-settings{background:#fff;border-color:#f7f9fa;-webkit-box-shadow:0 3px 7px rgba(0,0,0,.3);box-shadow:0 3px 7px rgba(0,0,0,.3)}.akun-x-theme-light .akun-x-settings-header{border-color:#f7f9fa}.akun-x-theme-light .akun-x-settings-header-exit:hover{background:#f7f9fa}.akun-x-theme-light .akun-x-settings-module-list{border-color:#f7f9fa}.akun-x-theme-light .akun-x-settings-module-list-item:hover{background-color:#eaeced}.akun-x-theme-light .akun-x-settings-selected{background-color:#f7f9fa}.akun-x-theme-light .akun-x-settings-header-exit{color:#272727;text-shadow:0 1px 0 #fff}.akun-x-theme-dark .akun-x-settings{background:#2a2c3b;border-color:#323448;-webkit-box-shadow:0 3px 7px rgba(0,0,0,.3);box-shadow:0 3px 7px rgba(0,0,0,.3)}.akun-x-theme-dark .akun-x-settings-header{border-color:#323448}.akun-x-theme-dark .akun-x-settings-header-exit:hover{background:#323448}.akun-x-theme-dark .akun-x-settings-module-list{border-color:#323448}.akun-x-theme-dark .akun-x-settings-module-list-item:hover{background-color:#4c4f6d}.akun-x-theme-dark .akun-x-settings-selected{background-color:#323448}.akun-x-theme-dark .akun-x-settings-header-exit{color:#d4d5d9;text-shadow:0 1px 0 #fff}.akun-x-settings{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;height:50%;min-height:500px;border-radius:0;border-width:1px;border-style:solid;outline:0}.akun-x-settings,.akun-x-settings-header{display:-webkit-box;display:-ms-flexbox;display:flex}.akun-x-settings-header{-ms-flex-negative:0;flex-shrink:0;border-bottom-width:1px;border-style:solid}.akun-x-settings-header-title{margin:0;-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1}.akun-x-settings-header-issues,.akun-x-settings-header-title{vertical-align:middle;padding:0 16px;line-height:50px}.akun-x-settings-header-exit{height:50px;width:50px;padding:0;border:0;margin:0;opacity:.2;background:transparent;cursor:pointer;font-size:20px;font-weight:700;line-height:20px;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;-webkit-appearance:none;vertical-align:middle;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-box-align:start;-ms-flex-align:start;align-items:flex-start;text-align:center;text-rendering:auto;letter-spacing:normal;word-spacing:normal;text-transform:none;text-indent:0;display:inline-block}.akun-x-settings-header-exit:hover{opacity:.4}.akun-x-settings-body{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;-webkit-box-align:stretch;-ms-flex-align:stretch;align-items:stretch;min-height:0}.akun-x-settings-module-list{-ms-flex-negative:0;flex-shrink:0;overflow-y:auto;border-right-width:1px;border-style:solid}.akun-x-settings-module-list-item{padding:5px 16px;cursor:pointer}.akun-x-settings-module-details-container{-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;overflow-y:auto;padding:15px}.akun-x-settings-module-details>div{padding-bottom:10px}.akun-x-settings-setting-name{font-weight:700}.akun-x-settings-hidden{display:none!important}", undefined);

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





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};



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

var _settings;

var LOCAL_STORAGE_KEY = 'akun-x';

var SETTING_TYPES = {
	BOOLEAN: 'boolean',
	ARRAY: 'array',
	KEYBIND: 'keybind'
};

var SETTING_IDS = {
	KEYBIND_OPEN: 'keybind_open',
	KEYBIND_CLOSE: 'keybind_close'
};

var THIS_ID = 'settings';

var DEFAULT_SETTINGS = {
	name: 'Settings',
	id: THIS_ID,
	settings: (_settings = {}, defineProperty(_settings, SETTING_IDS.KEYBIND_OPEN, {
		name: 'Open Keybind',
		description: 'The keybind used to open the settings menu.',
		type: SETTING_TYPES.KEYBIND,
		value: { key: 'o' }
	}), defineProperty(_settings, SETTING_IDS.KEYBIND_CLOSE, {
		name: 'Close Keybind',
		description: 'The keybind used to close the settings menu.',
		type: SETTING_TYPES.KEYBIND,
		value: { key: 'escape' }
	}), _settings)
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
		this._onAddedMainMenu(this._core.dom.node('mainMenu'));
		this._core.on(this._core.EVENTS.DOM.ADDED.MAIN_MENU, this._onAddedMainMenu.bind(this));
		this._core.on(this._core.EVENTS.INPUT.KEYBIND, this._onKeypress, this);
		this.addModule(DEFAULT_SETTINGS, this._onSettingsChanged.bind(this));
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
		key: '_onSettingsChanged',
		value: function _onSettingsChanged(settingId) {}
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
							valueNode.style.float = 'left';
							settingNode.appendChild(valueNode);
							settingNode.appendChild(descriptionNode);
							break;
						case SETTING_TYPES.ARRAY:
							valueNode = document.createElement('textarea');
							valueNode.dataset.id = settingName;
							valueNode.dataset.type = setting.type;
							settingNode.appendChild(descriptionNode);
							settingNode.appendChild(valueNode);
							makeElastic(valueNode);
							break;
						case SETTING_TYPES.KEYBIND:
							valueNode = document.createElement('button');
							valueNode.dataset.id = settingName;
							valueNode.dataset.type = setting.type;
							valueNode.classList.add('akun-x-settings-keybind-picker-button', 'btn');
							settingNode.appendChild(descriptionNode);
							settingNode.appendChild(valueNode);
							break;
					}
					Settings._setSettingNodeValue(valueNode, setting.type, setting.value);
				}
			}
			this._moduleListNode.appendChild(moduleListItemNode);
			this._moduleDetailsContainerNode.appendChild(moduleDetailsNode);
		}
	}, {
		key: '_createMenu',
		value: function _createMenu() {
			var backdropNode = document.createElement('div');
			backdropNode.classList.add('akun-x-settings-backdrop');
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
			moduleDetailsContainerNode.addEventListener('change', this._moduleDetailsChangeCallback.bind(this));
			moduleDetailsContainerNode.addEventListener('click', this._moduleDetailsClickCallback.bind(this));

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
		key: '_moduleDetailsChangeCallback',
		value: function _moduleDetailsChangeCallback(e) {
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
			this.setSetting(moduleId, settingId, newValue);
		}
	}, {
		key: 'setSetting',
		value: function setSetting(moduleId, settingId, value) {
			var valueNode = this._moduleDetailsContainerNode.querySelector('[data-id="' + moduleId + '"] [data-id="' + settingId + '"]');
			var type = this._settings[moduleId][settingId].type;
			Settings._setSettingNodeValue(valueNode, type, value);
			this._settings[moduleId][settingId].value = value;
			this._moduleCallbacks[moduleId](settingId);
			this._saveSettings();
		}
	}, {
		key: '_moduleDetailsClickCallback',
		value: function _moduleDetailsClickCallback(e) {
			var _this = this;

			if (e.target.classList.contains('akun-x-settings-keybind-picker-button')) {
				var keybindButton = e.target;
				keybindButton.textContent = 'Please press new keybind';
				var settingId = keybindButton.dataset.id;
				var moduleId = keybindButton.closest('.akun-x-settings-module-details').dataset.id;
				this._core.once(this._core.EVENTS.INPUT.KEYBIND, function (keybind) {
					_this.setSetting(moduleId, settingId, keybind);
				});
			}
		}
	}, {
		key: '_onKeypress',
		value: function _onKeypress(keybind, e) {
			if (doesObjectShareValues(keybind, this._settings[THIS_ID][SETTING_IDS.KEYBIND_OPEN].value)) {
				this._showMenu();
			}
			if (doesObjectShareValues(keybind, this._settings[THIS_ID][SETTING_IDS.KEYBIND_CLOSE].value)) {
				this._hideMenu();
			}
		}
	}], [{
		key: '_setSettingNodeValue',
		value: function _setSettingNodeValue(node, type, value) {
			switch (type) {
				case SETTING_TYPES.BOOLEAN:
					node.checked = value;
					break;
				case SETTING_TYPES.ARRAY:
					node.value = value.join('\n');
					break;
				case SETTING_TYPES.KEYBIND:
					node.textContent = Settings._getKeybindButtonText(value);
					break;
			}
		}
	}, {
		key: '_getKeybindButtonText',
		value: function _getKeybindButtonText(keybind) {
			var keys = [];
			if (keybind.ctrl) keys.push('ctrl');
			if (keybind.shift) keys.push('shift');
			if (keybind.alt) keys.push('alt');
			if (keybind.meta) keys.push('meta');
			keys.push(keybind.key.toUpperCase());
			return keys.join(' + ');
		}
	}]);
	return Settings;
}();

var MutationObserver$1 = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

var EVENTS$1 = {
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

var ObserverDOM = function () {
	function ObserverDOM(eventEmitter) {
		var _this = this;

		classCallCheck(this, ObserverDOM);

		this._eventEmitter = eventEmitter;

		// jQuery already present on page
		$(document).ready(function () {
			_this._observeBody();
		});
	}

	createClass(ObserverDOM, [{
		key: 'node',
		value: function node(type) {
			switch (type) {
				case 'mainMenu':
					return document.getElementById('mainMenu');
				default:
					return null;
			}
		}
	}, {
		key: 'nodes',
		value: function nodes(type) {
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
				case 'chatModal':
					return document.querySelectorAll('.chatItemDetail');
				default:
					return [];
			}
		}
	}, {
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
									this._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_ITEM, node);
									var nodeMessage = node.querySelector('.message');
									if (nodeMessage) {
										this._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_ITEM_MESSAGE, nodeMessage);
									}
								}
								if (node.classList.contains('message')) {
									this._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_ITEM_MESSAGE, node);
								}
								if (node.classList.contains('jadeRepeat')) {
									node.querySelectorAll('.logItem').forEach(function (nodeLogItem) {
										_this2._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_ITEM, nodeLogItem);
										var nodeMessage = nodeLogItem.querySelector('.message');
										if (nodeMessage) {
											_this2._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_ITEM_MESSAGE, nodeMessage);
										}
									});
									node.querySelectorAll('.chapter').forEach(function (nodeChapter) {
										_this2._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAPTER, nodeChapter);
									});
								}
								if (node.classList.contains('chapter')) {
									this._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAPTER, node);
								}
								if (node.classList.contains('fieldBody')) {
									this._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_ITEM_FIELD_BODY, node);
								}
								if (node.classList.contains('storyItem')) {
									this._eventEmitter.emit(EVENTS$1.DOM.ADDED.STORY, node);
								}
								if (node.classList.contains('chatContainer')) {
									this._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_HEADER, node.querySelector('.chatHeader'));
								}
								if (node.classList.contains('secondRow')) {
									this._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAPTER_BUTTON_CONTROLS, node);
								}
								if (node.classList.contains('chatLight')) {
									node.querySelectorAll('.logItem').forEach(function (nodeLogItem) {
										_this2._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_ITEM, nodeLogItem);
										var nodeMessage = nodeLogItem.querySelector('.message');
										if (nodeMessage) {
											_this2._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_ITEM_MESSAGE, nodeMessage);
										}
									});
								}
								if (node.classList.contains('chatItemDetail')) {
									this._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_MODAL, node);
									node.querySelectorAll('.chatHeader').forEach(function (nodeChatHeader) {
										_this2._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_HEADER, nodeChatHeader);
									});
									node.querySelectorAll('.chatInputContainer').forEach(function (nodeChatInputContainer) {
										_this2._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_INPUT_CONTAINER, nodeChatInputContainer);
									});
								}
								if (node.classList.contains('choiceReply')) {
									node.querySelectorAll('.chatHeader').forEach(function (nodeChatHeader) {
										_this2._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_HEADER, nodeChatHeader);
									});
								}
								if (node.classList.contains('privateChat')) {
									node.querySelectorAll('.chatHeader').forEach(function (nodeChatHeader) {
										_this2._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_HEADER, nodeChatHeader);
									});
								}
								if (node.classList.contains('chatInputContainer')) {
									this._eventEmitter.emit(EVENTS$1.DOM.ADDED.CHAT_INPUT_CONTAINER, node);
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
	INPUT: {
		KEYBIND: 'keybind'
	}
};

var EXTRA_ACCEPTED_CODES = ['escape', 'enter'];

var ObserverInput = function () {
	function ObserverInput(eventEmitter) {
		classCallCheck(this, ObserverInput);

		this._eventEmitter = eventEmitter;

		document.addEventListener('keyup', this._onKeyPress.bind(this));
	}

	createClass(ObserverInput, [{
		key: '_onKeyPress',
		value: function _onKeyPress(e) {
			if (!ObserverInput._isTextInput(e.target)) {
				// console.log(e);
				var keybind = ObserverInput.getKeyBindFromEvent(e);
				if (keybind) {
					this._eventEmitter.emit(EVENTS$2.INPUT.KEYBIND, keybind, e);
				}
			}
		}
	}], [{
		key: 'getKeyBindFromEvent',
		value: function getKeyBindFromEvent(e) {
			var code = e.code.toLowerCase();
			var keyMatch = code.match(/^key([A-z]+)/i);
			if (keyMatch) {
				code = keyMatch[1];
			} else if (EXTRA_ACCEPTED_CODES.indexOf(code) === -1) {
				return null;
			}
			// Use undefined instead of false to reduce size of settings in localStorage
			return {
				key: code,
				ctrl: e.ctrlKey ? true : undefined,
				shift: e.shiftKey ? true : undefined,
				alt: e.altKey ? true : undefined,
				meta: e.metaKey ? true : undefined
			};
		}
	}, {
		key: '_isTextInput',
		value: function _isTextInput(node) {
			if (node.nodeName === 'INPUT') {
				return true;
			}
			if (node.nodeName === 'TEXTAREA') {
				return true;
			}
			if (node.classList.contains('chatInput')) {
				return true;
			}
			if (node.classList.contains('fieldEditor')) {
				return true;
			}
			return false;
		}
	}]);
	return ObserverInput;
}();

var EVENTS$3 = {
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
										this._eventEmitter.emit(EVENTS$3.NET.RECEIVED.LIVE_STORIES, request.responseJSON);
									} else {
										console.log('Unhandled network request: ' + settings.url);
									}
									break;
								case 'boards':
									this._eventEmitter.emit(EVENTS$3.NET.RECEIVED.BOARDS, request.responseJSON, parseInt(urlFragments[3], 10));
									break;
								case 'chapter':
									this._eventEmitter.emit(EVENTS$3.NET.POSTED.CHAPTER, request.responseJSON);
									break;
								case 'chapterThreads':
									this._eventEmitter.emit(EVENTS$3.NET.RECEIVED.CHAPTER_THREADS, request.responseJSON);
									break;
								case 'following':
									this._eventEmitter.emit(EVENTS$3.NET.RECEIVED.FOLLOWING_LIST, request.responseJSON, urlFragments[3]);
									break;
								case 'refLatest':
									this._eventEmitter.emit(EVENTS$3.NET.RECEIVED.REF_LATEST, request.responseJSON, urlFragments[3]);
									break;
								case 'review':
									if (urlFragments[4] === 'preview') {
										this._eventEmitter.emit(EVENTS$3.NET.RECEIVED.REVIEW_PREVIEW, request.responseJSON, urlFragments[3]);
									} else {
										console.log('Unhandled network request: ' + settings.url);
									}
									break;
								case 'saves':
									this._eventEmitter.emit(EVENTS$3.NET.RECEIVED.SAVES, request.responseJSON, urlFragments[3]);
									break;
								case 'userCollections':
									this._eventEmitter.emit(EVENTS$3.NET.RECEIVED.USER_COLLECTIONS, request.responseJSON, urlFragments[3]);
									break;
								default:
									console.log('Unhandled network request: ' + settings.url);
							}
							break;
						case 'node':
							this._eventEmitter.emit(EVENTS$3.NET.POSTED.NODE, request.responseJSON);
							break;
						case 'thread':
							if (urlFragments[3] === 'pages') {
								this._eventEmitter.emit(EVENTS$3.NET.RECEIVED.THREAD_PAGES, request.responseJSON, urlFragments[2]);
							} else {
								this._eventEmitter.emit(EVENTS$3.NET.RECEIVED.THREAD_MESSAGES, request.responseJSON, urlFragments[2], urlFragments[3], urlFragments[4]);
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

var ElementPool = function () {
	function ElementPool(element, appliedFunction) {
		classCallCheck(this, ElementPool);

		this._element = element;
		this._appliedFunction = appliedFunction;
		if (this._appliedFunction) {
			this._appliedFunction(this._element);
		}
		this._pool = new Set();
		this._eventListeners = new Map();
	}

	createClass(ElementPool, [{
		key: 'getElement',
		value: function getElement() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this._pool[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var element = _step.value;

					// Check if the node is a descendant of the document
					if (!document.contains(element)) {
						// If it isn't then recycle it
						return element;
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

			return this._createNewElement();
		}
	}, {
		key: 'forEach',
		value: function forEach(callback) {
			callback(this._element);
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = this._pool[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var element = _step2.value;

					callback(element);
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
	}, {
		key: 'addEventListener',
		value: function addEventListener(event, listener) {
			if (!this._eventListeners.has(event)) {
				this._eventListeners.set(event, new Set());
			}
			this._eventListeners.get(event).add(listener);
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this._pool[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var element = _step3.value;

					element.addEventListener(event, listener);
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		}
	}, {
		key: 'removeEventListener',
		value: function removeEventListener(event, listener) {
			this._eventListeners.get(event).delete(listener);
			if (this._eventListeners.get(event).size === 0) {
				this._eventListeners.delete(event);
			}
		}
	}, {
		key: '_createNewElement',
		value: function _createNewElement() {
			var element = this._element.cloneNode(true);
			if (this._appliedFunction) {
				this._appliedFunction(element);
			}
			this._eventListeners.forEach(function (listeners, event) {
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = listeners[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var listener = _step4.value;

						element.addEventListener(event, listener);
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}
			});
			this._pool.add(element);
			return element;
		}
	}, {
		key: 'template',
		get: function get$$1() {
			return this._element;
		}
	}]);
	return ElementPool;
}();

__$styleInject("#right{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column}#right>*{min-height:0}#right #threads{margin:0}#right #mainChat{-ms-flex-negative:1;flex-shrink:1;-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;-ms-flex-preferred-size:0;flex-basis:0;height:auto}#right #mainChat>.header{display:none}#right #mainChat .chatContainer{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column}#right #mainChat .chatContainer .chatHeader{float:none;margin:0;padding:0 1em;-webkit-box-shadow:0 6px 4px -3px rgba(0,0,0,.2);box-shadow:0 6px 4px -3px rgba(0,0,0,.2);display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:stretch;-ms-flex-align:stretch;align-items:stretch}#right #mainChat .chatContainer .chatHeader .akun-x-restructure-chat-header-title{-webkit-box-ordinal-group:1;-ms-flex-order:0;order:0;font-size:18px;color:#90939d;text-transform:uppercase;line-height:25px;margin:auto}#right #mainChat .chatContainer .chatHeader .header{-webkit-box-ordinal-group:2;-ms-flex-order:1;order:1;-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;padding-top:7px;padding-right:7px}#right #mainChat .chatContainer .chatHeader .pagination-dropdown{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:reverse;-ms-flex-direction:row-reverse;flex-direction:row-reverse;-ms-flex-wrap:wrap;flex-wrap:wrap;cursor:inherit;max-height:none}#right #mainChat .chatContainer .chatHeader .pagination-dropdown>*{-ms-flex-negative:0;flex-shrink:0;min-width:0;margin-top:0;margin-right:0;margin-bottom:7px}#right #mainChat .chatContainer .chatHeader .pagination-dropdown .akun-x-restructure-chat-header-filler{-webkit-box-ordinal-group:2;-ms-flex-order:1;order:1;-webkit-box-flex:1000;-ms-flex-positive:1000;flex-grow:1000;margin-bottom:0!important;padding:0 12px}#right #mainChat .chatContainer .chatHeader .chat-control{top:43px!important}#right #mainChat .chatContainer .chatLog{height:auto!important;-ms-flex-preferred-size:0;flex-basis:0;-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1}#right #mainChat .chatInputContainer{position:static}.chatModal{padding-bottom:59px}.chatModal .modal-header{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:stretch;-ms-flex-align:stretch;align-items:stretch;padding:0}.chatModal .modal-header h3{-webkit-box-ordinal-group:1;-ms-flex-order:0;order:0;-ms-flex-negative:0;flex-shrink:0;padding:0 15px;margin:auto}.chatModal .modal-header .chatHeader{-webkit-box-ordinal-group:2;-ms-flex-order:1;order:1;-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;padding-top:7px;padding-right:7px;margin:auto}.chatModal .modal-header .chatHeader .pagination-dropdown{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:reverse;-ms-flex-direction:row-reverse;flex-direction:row-reverse;-ms-flex-wrap:wrap;flex-wrap:wrap;max-height:none!important;padding:0;margin:0;cursor:inherit}.chatModal .modal-header .chatHeader .pagination-dropdown>*{-ms-flex-negative:0;flex-shrink:0;min-width:0;margin-top:0;margin-right:0;margin-bottom:7px}.chatModal .modal-header .chatHeader .pagination-dropdown .akun-x-restructure-chat-header-title{-webkit-box-ordinal-group:3;-ms-flex-order:2;order:2;font-size:18px;color:#90939d;text-transform:uppercase;line-height:25px}.chatModal .modal-header .chatHeader .pagination-dropdown .akun-x-restructure-chat-header-filler{-webkit-box-ordinal-group:2;-ms-flex-order:1;order:1;-webkit-box-flex:1000;-ms-flex-positive:1000;flex-grow:1000;margin-bottom:0!important}.chatModal .modal-header .chatHeader .chat-control{top:50px!important}.chatModal .modal-header .close{height:auto!important;min-height:auto!important;position:static!important}.chatModal .modal-header button{-webkit-box-ordinal-group:3;-ms-flex-order:2;order:2;-ms-flex-negative:0;flex-shrink:0;margin:0!important;height:auto!important;min-height:50px}.chatModal .chatLog{margin:0!important}.chatInputContainer{margin:0;display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important;-ms-flex-negative:0;flex-shrink:0;-webkit-box-align:stretch;-ms-flex-align:stretch;align-items:stretch;z-index:3}.chatInputContainer .chatInput{-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;padding-right:6px;z-index:1}.chatInputContainer .image{position:static;border:1px solid #fff;border-left-width:0;padding:7px 5px;margin:0;font-size:14px}.input>.chatInputContainer>form{margin:0;display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important;-ms-flex-negative:0;flex-shrink:0;-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;-webkit-box-align:stretch;-ms-flex-align:stretch;align-items:stretch;z-index:3}.akun-x-theme-light .chatInputContainer .image{border-color:#eaedef!important;background:#fff;color:#272727}.akun-x-theme-dark .chatInputContainer .image{border-color:#393a4d!important;background:#2a2c3b;color:#d4d5d9}.threads .pagination-dropdown{position:fixed!important;right:100px!important;top:100px!important;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:end;-ms-flex-align:end;align-items:flex-end}.threads .pagination-dropdown>*{margin:7px 0 0!important;-ms-flex-negative:0!important;flex-shrink:0!important}", undefined);

/* This handles the restructuring of the native site to be bent into a more convenient shape for our machinations
 */

var Restructure = function () {
	function Restructure(core) {
		classCallCheck(this, Restructure);

		this._core = core;
		this._chatHeaderTitlePool = new ElementPool(this._createChatHeaderTitleElement());
		this._core.on(this._core.EVENTS.DOM.ADDED.CHAT_HEADER, this._onAddedChatHeader, this);
	}

	createClass(Restructure, [{
		key: '_onAddedChatHeader',
		value: function _onAddedChatHeader(node) {
			if (node.closest('#mainChat')) {
				node.appendChild(this._chatHeaderTitlePool.getElement());
				return;
			}
			var chatModalNode = node.closest('.chatModal');
			if (chatModalNode) {
				var modalHeaderNode = chatModalNode.querySelector('.modal-header');
				modalHeaderNode.appendChild(node);
				var closeNode = chatModalNode.querySelector('.close');
				modalHeaderNode.appendChild(closeNode);
			}
		}
	}, {
		key: '_createChatHeaderTitleElement',
		value: function _createChatHeaderTitleElement() {
			var element = document.createElement('div');
			element.classList.add('akun-x-restructure-chat-header-title');
			element.textContent = 'Chat';
			return element;
		}
	}, {
		key: '_createChatHeaderFillerElement',
		value: function _createChatHeaderFillerElement() {
			var element = document.createElement('div');
			element.classList.add('akun-x-restructure-chat-header-filler');
			return element;
		}
	}]);
	return Restructure;
}();

var EVENTS$$1 = {
	FOCUS: 'focus'
};
Object.assign(EVENTS$$1, EVENTS$1, EVENTS$2, EVENTS$3);

var THEMES = {
	LIGHT: 'snowdrift',
	DARK: 'dark'
};

var THEME_CLASS = {
	LIGHT: 'akun-x-theme-light',
	DARK: 'akun-x-theme-dark'
};

var Core = function (_EventEmitter) {
	inherits(Core, _EventEmitter);

	function Core() {
		classCallCheck(this, Core);

		var _this = possibleConstructorReturn(this, (Core.__proto__ || Object.getPrototypeOf(Core)).call(this));

		_this._observerDOM = new ObserverDOM(_this);
		_this._observerInput = new ObserverInput(_this);
		_this._observerNet = new ObserverNet(_this);
		_this._settings = new Settings(_this);
		_this._restructure = new Restructure(_this);
		_this._modules = {};

		window.onfocus = function () {
			_this.emit(EVENTS$$1.FOCUS);
		};

		switch (_this.theme) {
			case THEMES.LIGHT:
				document.body.classList.add(THEME_CLASS.LIGHT);
				break;
			case THEMES.DARK:
				document.body.classList.add(THEME_CLASS.DARK);
				break;
		}
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
		key: 'dom',
		get: function get$$1() {
			return this._observerDOM;
		}
	}, {
		key: 'input',
		get: function get$$1() {
			return this._observerInput;
		}
	}, {
		key: 'net',
		get: function get$$1() {
			return this._observerNet;
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
			return EVENTS$$1;
		}
	}, {
		key: 'THEMES',
		get: function get$$1() {
			return THEMES;
		}
	}, {
		key: 'isAuthor',
		get: function get$$1() {
			return new Promise(function (resolve, reject) {
				var poll = function poll() {
					var isAuthor = $(document)['scope']()['isAuthor'];
					if (isAuthor === undefined) {
						setTimeout(poll, 10);
					} else {
						resolve(isAuthor);
					}
				};
				poll();
			});
		}
	}]);
	return Core;
}(index);

__$styleInject(".akun-x-anon-toggle{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.akun-x-anon-toggle .avatar{margin-right:4px;display:inline;border-radius:2em;position:relative}.akun-x-anon-toggle .username{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:20px!important}", undefined);

var MODULE_ID = 'anonToggle';

var SETTING_IDS$1 = {
	ENABLED: 'enabled'
};

var DEFAULT_SETTINGS$1 = {
	name: 'Anon Toggle',
	id: MODULE_ID,
	settings: defineProperty({}, SETTING_IDS$1.ENABLED, {
		name: 'Enabled',
		description: 'Turn the Anon Toggle module on or off.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	})
};

var AnonToggle = function () {
	function AnonToggle(core) {
		classCallCheck(this, AnonToggle);

		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS$1, this._onSettingsChanged.bind(this));
		this._onClickShouldSetToAnon = false;
		this._toggleElementPool = new ElementPool(this._createToggleElement());
		if (this._settings[SETTING_IDS$1.ENABLED].value) {
			this._enable();
		}
		this._boundToggleClickCallback = this._toggleClickCallback.bind(this);
		this._toggleElementPool.addEventListener('click', this._boundToggleClickCallback);
	}

	createClass(AnonToggle, [{
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
			// Don't do anything if the user isn't logged in (and thus doesn't have any settings available)
			if (this._core.currentUser) {
				this._core.dom.nodes('chatHeader').forEach(this._onAddedChatHeader, this);
				this._core.on(this._core.EVENTS.FOCUS, this._onFocus, this);
				this._core.on(this._core.EVENTS.DOM.ADDED.CHAT_HEADER, this._onAddedChatHeader, this);
			}
		}
	}, {
		key: '_disable',
		value: function _disable() {
			this._core.removeListener(this._core.EVENTS.FOCUS, this._onFocus, this);
			this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAT_HEADER, this._onAddedChatHeader, this);
			document.querySelectorAll('.akun-x-anon-toggle').forEach(function (node) {
				delete node.parentNode.dataset[AnonToggle.id];
				node.parentNode.removeChild(node);
			});
		}
	}, {
		key: '_createToggleElement',
		value: function _createToggleElement() {
			var toggleElement = document.createElement('div');
			toggleElement.classList.add('akun-x-anon-toggle', 'noselect', 'btn', 'dim-font-color', 'hover-font-color');
			var avatarElement = document.createElement('img');
			avatarElement.classList.add('avatar');
			var usernameElement = document.createElement('span');
			usernameElement.classList.add('username');
			toggleElement.appendChild(avatarElement);
			toggleElement.appendChild(usernameElement);
			return toggleElement;
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
			node.querySelector('.pagination-dropdown').appendChild(this._toggleElementPool.getElement());
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
				this._toggleElementPool.forEach(function (toggleElement) {
					toggleElement.querySelector('.username').textContent = 'Anon';
					toggleElement.querySelector('.avatar').style.display = 'none';
				});
			} else {
				this._onClickShouldSetToAnon = true;
				var avatarSrc = currentUser['profile']['image'];
				if (/cloudfront\.net/.test(avatarSrc)) {
					var match = avatarSrc.match(/cloudfront.net\/images\/([A-z0-9_\.]+)/);
					avatarSrc = 'https://cdn.fiction.live/h16-w16-cfill/images/' + (match && match[1]);
				} else if (/filepicker\.io/.test(avatarSrc)) {
					avatarSrc += '/convert?w=16&h=16&fit=crop&cache=true';
				}
				this._toggleElementPool.forEach(function (toggleElement) {
					toggleElement.querySelector('.username').textContent = currentUser['username'];
					var avatarNode = toggleElement.querySelector('.avatar');
					avatarNode.style.display = 'inline';
					avatarNode.src = avatarSrc;
				});
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

var SETTING_IDS$2 = {
	ENABLED: 'enabled'
};

var DEFAULT_SETTINGS$2 = {
	name: 'Chapter HTML Editor',
	id: MODULE_ID$1,
	settings: defineProperty({}, SETTING_IDS$2.ENABLED, {
		name: 'Enabled',
		description: 'Turn the Chapter HTML Editor module on or off.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	})
};

var ChapterHTMLEditor = function () {
	function ChapterHTMLEditor(core) {
		classCallCheck(this, ChapterHTMLEditor);

		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS$2, this._onSettingsChanged.bind(this));
		if (this._settings[SETTING_IDS$2.ENABLED].value) {
			this._enable();
		}
	}

	createClass(ChapterHTMLEditor, [{
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
			}
		}
	}, {
		key: '_enable',
		value: function _enable() {
			var _this = this;

			this._core.isAuthor.then(function (isAuthor) {
				if (isAuthor) {
					_this._core.dom.nodes('chapterButtonControls').forEach(_this._onAddedChapterButtonControls, _this);
					_this._core.on(_this._core.EVENTS.DOM.ADDED.CHAPTER, _this._onAddedChapter, _this);
					_this._core.on(_this._core.EVENTS.DOM.ADDED.CHAPTER_BUTTON_CONTROLS, _this._onAddedChapterButtonControls, _this);
				}
			});
		}
	}, {
		key: '_disable',
		value: function _disable() {
			this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
			this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAPTER_BUTTON_CONTROLS, this._onAddedChapterButtonControls, this);
			document.querySelectorAll('.akun-x-chapter-html-editor-edit').forEach(function (node) {
				delete node.parentNode.dataset[ChapterHTMLEditor.id];
				node.parentNode.removeChild(node);
			});
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
			// Set user HTML input to be innerHTML of an element disconnected from the document
			// This forces the browser to validate the HTML effectively, converting it into something that won't break the
			//   rest of the page if there were mismatched tags.
			var tempNode = document.createElement('div');
			tempNode.innerHTML = chapterNode.querySelector('.fieldEditor').textContent;
			ty.post('anonkun/editChapter', {
				'_id': chapterNode.dataset.id,
				'update[$set][b]': tempNode.innerHTML,
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

var _settings$1;

var MODULE_ID$2 = 'imageToggle';

var SETTING_IDS$3 = {
	ENABLED: 'enabled',
	KEYBIND: 'keybind',
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

var DEFAULT_SETTINGS$3 = {
	name: 'Image Toggle',
	id: MODULE_ID$2,
	settings: (_settings$1 = {}, defineProperty(_settings$1, SETTING_IDS$3.ENABLED, {
		name: 'Enabled',
		description: 'Turn the Image Toggle module on or off.',
		type: SETTING_TYPES.BOOLEAN,
		value: false
	}), defineProperty(_settings$1, SETTING_IDS$3.KEYBIND, {
		name: 'Keybind',
		description: 'The keybind to enable or disable this module.',
		type: SETTING_TYPES.KEYBIND,
		value: { key: 'i', ctrl: true }
	}), defineProperty(_settings$1, SETTING_IDS$3.ALL, {
		name: 'All Images',
		description: 'Every image on the site disappears. Has the potential to hide things you don\'t want hidden.',
		type: SETTING_TYPES.BOOLEAN,
		value: false
	}), defineProperty(_settings$1, SETTING_IDS$3.STORY_COVERS, {
		name: 'Story Covers',
		description: 'Hide the cover image for stories.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	}), defineProperty(_settings$1, SETTING_IDS$3.STORY_BODY, {
		name: 'Story Body',
		description: 'Hide any images that are in story chapters.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	}), defineProperty(_settings$1, SETTING_IDS$3.CHAT_MESSAGES, {
		name: 'Chat Messages',
		description: 'Hide images in chat.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	}), defineProperty(_settings$1, SETTING_IDS$3.CHAT_MODALS, {
		name: 'Chat Modals',
		description: 'Hide images in the popout chat modals.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	}), defineProperty(_settings$1, SETTING_IDS$3.TOPIC_COVERS, {
		name: 'Topic Covers',
		description: 'Hide the topic cover images.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	}), defineProperty(_settings$1, SETTING_IDS$3.TOPIC_OP, {
		name: 'Topic Opening Post',
		description: 'Hide any images within the topic\'s opening post.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	}), defineProperty(_settings$1, SETTING_IDS$3.PROFILE_AVATARS, {
		name: 'Profile Avatar',
		description: 'Hides the large avatar image displayed on a user\'s profile page.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	}), defineProperty(_settings$1, SETTING_IDS$3.LIVE_STORIES, {
		name: 'Live Story List',
		description: 'Hides story cover images for stories listed in the live story list. Only has effect if you\'re using the Live Images AkunX module.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	}), _settings$1)
};

var ImageToggle = function () {
	function ImageToggle(core) {
		classCallCheck(this, ImageToggle);

		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS$3, this._onSettingsChanged.bind(this));
		this._styleElement = document.createElement('style');
		this._styleElement.id = 'akun-x-image-toggle';
		document.head.appendChild(this._styleElement);
		this._core.on(this._core.EVENTS.INPUT.KEYBIND, this._onKeypress, this);
		if (this._settings[SETTING_IDS$3.ENABLED].value) {
			this._enable();
		}
	}

	createClass(ImageToggle, [{
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
				case SETTING_IDS$3.KEYBIND:
					break;
				default:
					if (this._settings[SETTING_IDS$3.ENABLED].value) {
						this._regenerateCurrentStyling();
					}
			}
		}
	}, {
		key: '_enable',
		value: function _enable() {
			this._regenerateCurrentStyling();
		}
	}, {
		key: '_disable',
		value: function _disable() {
			this._styleElement.innerHTML = '';
		}
	}, {
		key: '_regenerateCurrentStyling',
		value: function _regenerateCurrentStyling() {
			var css = '';
			if (this._settings[SETTING_IDS$3.ALL].value) {
				css += 'img {display: none!important;}';
			} else {
				if (this._settings[SETTING_IDS$3.STORY_COVERS].value) {
					css += '.storyImg, .imgWithBackground, .authorOf img, .storyListItem .imgContainer img {display: none!important;}';
					css += '.storyImgContainer {min-height: 2em;}';
					css += '.authorOf .storyListItem {height: inherit!important;}';
				}
				if (this._settings[SETTING_IDS$3.STORY_BODY].value) {
					css += '#storyPosts img {display: none!important;}';
				}
				if (this._settings[SETTING_IDS$3.CHAT_MESSAGES].value) {
					css += '#mainChat .message img, #page-body .message img {display: none!important;}';
				}
				if (this._settings[SETTING_IDS$3.CHAT_MODALS].value) {
					css += '.chatModal .message img, .chatModal .postBody img {display: none!important;}';
				}
				if (this._settings[SETTING_IDS$3.TOPIC_COVERS].value) {
					css += '#threads td:not(:last-child) img, .newsFeed img {display: none!important;}';
				}
				if (this._settings[SETTING_IDS$3.TOPIC_OP].value) {
					css += '.page-head-body #page-body img {display: none!important;}';
				}
				if (this._settings[SETTING_IDS$3.PROFILE_AVATARS].value) {
					css += '#userProfile .avatar img {display: none!important;}';
				}
				if (this._settings[SETTING_IDS$3.LIVE_STORIES].value) {
					css += '.liveStories img {display: none!important;}';
				}
			}
			this._styleElement.innerHTML = css;
		}
	}, {
		key: '_onKeypress',
		value: function _onKeypress(eKeybind, e) {
			var keybind = this._settings[SETTING_IDS$3.KEYBIND].value;
			if (doesObjectShareValues(eKeybind, keybind)) {
				this._core.settings.setSetting(ImageToggle.id, SETTING_IDS$3.ENABLED, !this._settings[SETTING_IDS$3.ENABLED].value);
			}
		}
	}], [{
		key: 'id',
		get: function get$$1() {
			return MODULE_ID$2;
		}
	}]);
	return ImageToggle;
}();

var _settings$2;

var MODULE_ID$3 = 'linker';

var SETTING_IDS$4 = {
	ENABLED: 'enabled',
	STRICT_MODE: 'strictMode',
	EMBED_IMAGES: 'embedImages',
	EMBED_VIDEOS: 'embedVideos',
	MEDIA_SITES: 'mediaSites',
	IMAGE_EXTENSIONS: 'imageExtensions',
	VIDEO_EXTENSIONS: 'videoExtensions'
};

var DEFAULT_SETTINGS$4 = {
	name: 'Linker',
	id: MODULE_ID$3,
	settings: (_settings$2 = {}, defineProperty(_settings$2, SETTING_IDS$4.ENABLED, {
		name: 'Enabled',
		description: 'Turn the Linker module on or off.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	}), defineProperty(_settings$2, SETTING_IDS$4.STRICT_MODE, {
		name: 'Strict Mode',
		description: 'With Strict Mode enabled the link parsing will only accept URLs comprising of specification compliant characters. Disabling Strict Mode will recognise links as text that looks like it starts as a link and continues until it encounters whitespace.',
		type: SETTING_TYPES.BOOLEAN,
		value: false
	}), defineProperty(_settings$2, SETTING_IDS$4.EMBED_IMAGES, {
		name: 'Embed Images',
		description: 'Embed links recognised to be images as images instead.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	}), defineProperty(_settings$2, SETTING_IDS$4.EMBED_VIDEOS, {
		name: 'Embed Videos',
		description: 'Embed links recognised to be videos as images instead.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	}), defineProperty(_settings$2, SETTING_IDS$4.MEDIA_SITES, {
		name: 'Media Sites',
		description: 'Define a list of sites to embed links as media from. Used as a regex pattern.',
		type: SETTING_TYPES.ARRAY,
		value: ['puu.sh', 'i.imgur.com', 'data.archive.moe', 'i.4cdn.org', 'i0.kym-cdn.com', '[\\S]*.deviantart.net']
	}), defineProperty(_settings$2, SETTING_IDS$4.IMAGE_EXTENSIONS, {
		name: 'Image Extensions',
		description: 'Define a list of extensions to recognise as images.',
		type: SETTING_TYPES.ARRAY,
		value: ['jpg', 'jpeg', 'png', 'gif']
	}), defineProperty(_settings$2, SETTING_IDS$4.VIDEO_EXTENSIONS, {
		name: 'Video Extensions',
		description: 'Define a list of extensions to recognise as videos.',
		type: SETTING_TYPES.ARRAY,
		value: ['webm', 'mp4', 'gifv']
	}), _settings$2)
};

var Linker = function () {
	function Linker(core) {
		classCallCheck(this, Linker);

		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS$4, this._onSettingsChanged.bind(this));
		this._imageRegex = null;
		this._videoRegex = null;
		this._videoTypeRegex = null;
		this._updateMediaRegex();
		if (this._settings[SETTING_IDS$4.ENABLED].value) {
			this._enable();
		}
	}

	createClass(Linker, [{
		key: '_onSettingsChanged',
		value: function _onSettingsChanged(settingId) {
			switch (settingId) {
				case SETTING_IDS$4.ENABLED:
					if (this._settings[SETTING_IDS$4.ENABLED].value) {
						this._enable();
					} else {
						this._disable();
					}
					break;
				case SETTING_IDS$4.STRICT_MODE:
					if (this._settings[SETTING_IDS$4.ENABLED].value) {
						this._disable();
						this._enable();
					}
					break;
				case SETTING_IDS$4.EMBED_IMAGES:
					if (this._settings[SETTING_IDS$4.EMBED_IMAGES].value) {
						this._disable();
						if (this._settings[SETTING_IDS$4.ENABLED].value) {
							this._enable();
						}
					} else {
						Linker._disableImages();
						if (this._settings[SETTING_IDS$4.ENABLED].value) {
							this._enable();
						}
					}
					break;
				case SETTING_IDS$4.EMBED_VIDEOS:
					if (this._settings[SETTING_IDS$4.EMBED_VIDEOS].value) {
						this._disable();
						if (this._settings[SETTING_IDS$4.ENABLED].value) {
							this._enable();
						}
					} else {
						Linker._disableVideos();
						if (this._settings[SETTING_IDS$4.ENABLED].value) {
							this._enable();
						}
					}
					break;
				case SETTING_IDS$4.MEDIA_SITES:
				case SETTING_IDS$4.IMAGE_EXTENSIONS:
				case SETTING_IDS$4.VIDEO_EXTENSIONS:
					this._updateMediaRegex();
					if (this._settings[SETTING_IDS$4.ENABLED].value) {
						this._disable();
						this._enable();
					}
					break;
			}
		}
	}, {
		key: '_enable',
		value: function _enable() {
			this._core.dom.nodes('message').forEach(this._onAddedChatItemMessage, this);
			this._core.dom.nodes('chapter').forEach(this._onAddedChapter, this);
			this._core.on(this._core.EVENTS.DOM.ADDED.CHAT_ITEM_MESSAGE, this._onAddedChatItemMessage, this);
			this._core.on(this._core.EVENTS.DOM.ADDED.CHAT_ITEM_FIELD_BODY, this._onAddedChatItemFieldBody, this);
			this._core.on(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
		}
	}, {
		key: '_disable',
		value: function _disable() {
			this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAT_ITEM_MESSAGE, this._onAddedChatItemMessage, this);
			this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAT_ITEM_FIELD_BODY, this._onAddedChatItemFieldBody, this);
			this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
			Linker._disableLinks();
			Linker._disableImages();
			Linker._disableVideos();
		}
	}, {
		key: '_updateMediaRegex',
		value: function _updateMediaRegex() {
			var mediaSites = this._settings[SETTING_IDS$4.MEDIA_SITES].value.join('|');
			var imageExtensions = this._settings[SETTING_IDS$4.IMAGE_EXTENSIONS].value.join('|');
			var videoExtensions = this._settings[SETTING_IDS$4.VIDEO_EXTENSIONS].value.join('|');
			this._imageRegex = new RegExp('https?://(' + mediaSites + ')/.+\\.(' + imageExtensions + ')($|\\?)');
			this._videoRegex = new RegExp('https?://(' + mediaSites + ')/.+\\.(' + videoExtensions + ')($|\\?)');
			this._videoTypeRegex = new RegExp('\\.(' + videoExtensions + ')(?:$|\\?)');
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
							var urlMatch = this._getURLRegex().exec(node.nodeValue);
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
			if (this._settings[SETTING_IDS$4.EMBED_IMAGES].value && this.isImageUrl(url)) {
				var img = document.createElement('img');
				img.classList.add('akun-x-linker-image');
				img.dataset.url = url;
				img.src = url.replace(/^https?:\/\//, 'https://'); // Make it https
				img.onerror = function () {
					this.onerror = null;
					this.src = url;
				}; // Fallback to http if https fails
				return img;
			}

			if (this._settings[SETTING_IDS$4.EMBED_VIDEOS].value && this.isVideoUrl(url)) {
				var type = this._videoTypeRegex.exec(url);
				type = type && type[1];
				var vid = document.createElement('video');
				vid.classList.add('akun-x-linker-video');
				vid.dataset.url = url;
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
			link.classList.add('akun-x-linker-link');
			link.dataset.url = url;
			link.textContent = url;
			link.href = url;
			return link;
		}
	}, {
		key: '_getURLRegex',
		value: function _getURLRegex() {
			if (this._settings[SETTING_IDS$4.STRICT_MODE].value) {
				return (/https?:\/\/[A-z0-9\-\._~:\/\?#\[\]@\!\$&'\(\)*\+,;=%]+/
				);
			} else {
				return (/https?:\/\/[^\s]+/
				);
			}
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
		key: '_disableLinks',
		value: function _disableLinks() {
			document.querySelectorAll('.akun-x-linker-link').forEach(Linker._disableNode);
		}
	}, {
		key: '_disableImages',
		value: function _disableImages() {
			document.querySelectorAll('.akun-x-linker-image').forEach(Linker._disableNode);
		}
	}, {
		key: '_disableVideos',
		value: function _disableVideos() {
			document.querySelectorAll('.akun-x-linker-video').forEach(Linker._disableNode);
		}
	}, {
		key: '_disableNode',
		value: function _disableNode(node) {
			delete node.parentNode.dataset[Linker.id];
			var textNode = document.createTextNode(node.dataset.url);
			var parentNode = node.parentNode;
			parentNode.replaceChild(textNode, node);
			parentNode.normalize(); // Tidy up those fragmented text nodes
		}
	}, {
		key: 'id',
		get: function get$$1() {
			return MODULE_ID$3;
		}
	}]);
	return Linker;
}();

var MODULE_ID$4 = 'liveImages';

var SETTING_IDS$5 = {
	ENABLED: 'enabled'
};

var DEFAULT_SETTINGS$5 = {
	name: 'Live Images',
	id: MODULE_ID$4,
	settings: defineProperty({}, SETTING_IDS$5.ENABLED, {
		name: 'Enabled',
		description: 'Turn the Live Images module on or off.',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	})
};

var PLACEHOLDER_IMAGE_URL = '//placekitten.com/g/320/180';

var LiveImages = function () {
	function LiveImages(core) {
		classCallCheck(this, LiveImages);

		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS$5, this._onSettingsChanged.bind(this));
		this._storyIdToImageMap = new Map();
		if (this._settings[SETTING_IDS$5.ENABLED].value) {
			this._enable();
		}
	}

	createClass(LiveImages, [{
		key: '_onSettingsChanged',
		value: function _onSettingsChanged(settingId) {
			switch (settingId) {
				case SETTING_IDS$5.ENABLED:
					if (this._settings[SETTING_IDS$5.ENABLED].value) {
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
			this._core.dom.nodes('storyItem').forEach(this._onAddedStoryItem, this);
			this._core.on(this._core.EVENTS.NET.RECEIVED.LIVE_STORIES, this._onLiveStories, this);
			this._core.on(this._core.EVENTS.DOM.ADDED.STORY, this._onAddedStoryItem, this);
		}
	}, {
		key: '_disable',
		value: function _disable() {
			this._core.removeListener(this._core.EVENTS.NET.RECEIVED.LIVE_STORIES, this._onLiveStories, this);
			this._core.removeListener(this._core.EVENTS.DOM.ADDED.STORY, this._onAddedStoryItem, this);
			document.querySelectorAll('.akun-x-live-images').forEach(function (node) {
				delete node.closest('.storyItem').dataset[LiveImages.id];
				node.parentNode.removeChild(node);
			});
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
			return MODULE_ID$4;
		}
	}]);
	return LiveImages;
}();

__$styleInject(".akun-x-sort-button{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.akun-x-sort-button .button-text{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:20px!important}", undefined);

var MODULE_ID$5 = 'choiceReorder';

var SETTING_IDS$6 = {
	ENABLED: 'enabled'
};

var DEFAULT_SETTINGS$6 = {
	name: 'Choice Reorder',
	id: MODULE_ID$5,
	settings: defineProperty({}, SETTING_IDS$6.ENABLED, {
		name: 'Enabled',
		description: 'Enable sorting of polls where the results were hidden',
		type: SETTING_TYPES.BOOLEAN,
		value: true
	})
};

var ChoiceReorder = function () {
	function ChoiceReorder(core) {
		classCallCheck(this, ChoiceReorder);

		this._core = core;
		this._settings = this._core.settings.addModule(DEFAULT_SETTINGS$6, this._onSettingsChanged.bind(this));
		this._buttonPool = new ElementPool(this._createButtonElement());
		if (this._settings[SETTING_IDS$6.ENABLED].value) {
			this._enable();
		}
		this._boundSortAll = this.sortAllCallBack.bind(this);
		this._buttonPool.addEventListener('click', this._boundSortAll);
	}

	createClass(ChoiceReorder, [{
		key: '_onSettingsChanged',
		value: function _onSettingsChanged(settingId) {
			switch (settingId) {
				case SETTING_IDS$6.ENABLED:
					if (this._settings[SETTING_IDS$6.ENABLED].value) {
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
			this._core.dom.nodes('chatHeader').forEach(this._onAddedChatHeader, this);
			this._core.dom.nodes('chapter').forEach(this._onAddedChapter, this);
			this._core.on(this._core.EVENTS.DOM.ADDED.CHAT_HEADER, this._onAddedChatHeader, this);
			this._core.on(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
		}
	}, {
		key: '_disable',
		value: function _disable() {
			this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAPTER, this._onAddedChapter, this);
			this._core.removeListener(this._core.EVENTS.DOM.ADDED.CHAT_HEADER, this._onAddedChatHeader, this);
			document.querySelectorAll('.akun-x-sort-button').forEach(function (node) {
				delete node.parentNode.dataset[ChoiceReorder.id];
				node.parentNode.removeChild(node);
			});

			this._core.dom.nodes('chapter').forEach(function (node) {
				if (!node.classList.contains('choice')) {
					return;
				}
				var tbody = node.getElementsByClassName('poll')[0].firstChild;
				delete tbody.dataset.sorted;

				var choices = [];
				Array.from(tbody.getElementsByClassName('choiceItem')).forEach(function (choiceItem) {
					choices.push(choiceItem.cloneNode(true));
					choiceItem.parentNode.removeChild(choiceItem);
				});
				choices.sort(function (a, b) {
					if (parseInt(a.dataset.prevPosition) > parseInt(b.dataset.prevPosition)) {
						return 1;
					}
					if (parseInt(a.dataset.prevPosition) < parseInt(b.dataset.prevPosition)) {
						return -1;
					}
					return 0;
				});

				choices.forEach(function (choiceItem) {
					tbody.append(choiceItem);
				});
				[].forEach.call(tbody.getElementsByClassName('result'), function (result) {
					Array.from(result.childNodes).forEach(function (total) {
						if (!total.classList.contains('userVote')) {
							delete result.parentNode.dataset.prevPosition;
							delete result.parentNode.dataset.voteCount;
						}
					});
				});
			}, this);
		}
	}, {
		key: 'sortAllCallBack',
		value: function sortAllCallBack(e) {
			this._core.dom.nodes('chapter').forEach(this._onAddedChapter, this);
		}
	}, {
		key: '_onAddedChatHeader',
		value: function _onAddedChatHeader(node) {
			node.querySelector('.pagination-dropdown').appendChild(this._buttonPool.getElement());
		}
	}, {
		key: '_onAddedChapter',
		value: function _onAddedChapter(node) {
			if (node.classList.contains('choice')) {
				try {
					this.reorderChoices(node.getElementsByClassName('poll')[0].firstChild);
				} catch (e) {
					console.log("Can't sort polls where vote count is currently hidden");
				}
			}
		}
	}, {
		key: '_createButtonElement',
		value: function _createButtonElement() {
			var buttonElement = document.createElement('div');
			buttonElement.classList.add('akun-x-sort-button', 'noselect', 'btn', 'dim-font-color', 'hover-font-color');
			var textElement = document.createElement('span');
			textElement.innerHTML = "Sort";
			textElement.classList.add('button-text');
			buttonElement.appendChild(textElement);
			return buttonElement;
		}
	}, {
		key: 'reorderChoices',
		value: function reorderChoices(tbody) {
			if (tbody.dataset.sorted) {
				return;
			}
			var position = 0;
			[].forEach.call(tbody.getElementsByClassName('result'), function (result) {
				Array.from(result.childNodes).forEach(function (total) {
					if (!total.classList.contains('userVote')) {
						result.parentNode.dataset.voteCount = total.textContent;
						result.parentNode.dataset.prevPosition = position++;
					}
				});
			});
			[].forEach.call(tbody.getElementsByClassName('xOut'), function (xOut) {
				xOut.dataset.voteCount = -1;
			});

			var choices = [];
			Array.from(tbody.getElementsByClassName('choiceItem')).forEach(function (choiceItem) {
				choices.push(choiceItem.cloneNode(true));
				choiceItem.parentNode.removeChild(choiceItem);
			});
			choices.sort(function (a, b) {
				if (parseInt(a.dataset.voteCount) < parseInt(b.dataset.voteCount)) {
					return 1;
				}
				if (parseInt(a.dataset.voteCount) > parseInt(b.dataset.voteCount)) {
					return -1;
				}
				return 0;
			});

			choices.forEach(function (choiceItem) {
				tbody.append(choiceItem);
			});
			tbody.dataset.sorted = true;
		}
	}], [{
		key: 'id',
		get: function get$$1() {
			return MODULE_ID$5;
		}
	}]);
	return ChoiceReorder;
}();

var core = new Core();

core.addModule(AnonToggle);
core.addModule(ChapterHTMLEditor);
core.addModule(ImageToggle);
core.addModule(Linker);
core.addModule(LiveImages);
core.addModule(ChoiceReorder);

}());
