'use strict';

export const EVENTS = {
	REALTIME: {
		RAW: 'realtime.raw',
		CHILD_CHANGED: 'realtime.childChanged'
	}
};

export default class ObserverRealtime {
	constructor(eventEmitter) {
		this._eventEmitter = eventEmitter;
		this._listenToRealtimeConnection();
	}

	_listenToRealtimeConnection() {
		// Hook into the websocket connection akun establishes
		if (window.ty && window.ty.realtime && window.ty.realtime.transport && window.ty.realtime.transport.on) {
			window.ty.realtime.transport.on('event', this._onEvent.bind(this));
		} else {
			setTimeout(this._listenToRealtimeConnection.bind(this), 50);
		}
	}

	_onEvent(type, message) {
		switch (type) {
			case 'message':
				this._eventEmitter.emit(EVENTS.REALTIME.RAW, message);
				break;
			case '#publish':
				if (message && message.data && message.data.event) {
					const eventName = message.data.event;
					const payload = message.data.message;
					switch (eventName) {
						case 'childChanged':
							this._eventEmitter.emit(EVENTS.REALTIME.CHILD_CHANGED, payload);
							break;
						default:
							console.log(`Unhandled realtime #publish event with eventName: ${eventName}`, payload);
					}
				} else {
					console.log(`Unhandled realtime #publish event:`, message);
				}
				break;
			default:
				console.log(`Unhandled realtime event: ${type}`);
		}
	}
}
