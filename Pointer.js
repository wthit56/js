var Pointer = (function () {
	var inverseEvents = {
		"mousedown": "start",
		"mousemove": "move",
		"mouseup": "end",
		"touchstart": "start",
		"touchmove": "move",
		"touchend": "end",
		"touchcancel": "end"
	};

	var mouse = {
		events: {
			"start": "mousedown",
			"move": "mousemove",
			"end": "mouseup"
		},
		on: on, remove: remove
	};

	var touch;
	if ("touchstart" in document) {
		function touchAction(action, target, event, listener) {
			return function () {
				event = this.events[event];
				if (event instanceof Array) {
					action.call(this, target, event[0], listener);
					action.call(this, target, event[1], listener);
				}
				else {
					action.call(this, target, event, listener);
				}
			};
		}

		touch = {
			events: {
				"start": "touchstart",
				"move": "touchmove",
				"end": ["touchend", "touchcancel"]
			},
			on: touchAction(on), remove: touchAction(remove)
		};
	}

	function on(target, event, listener) {
		target[eventTarget.add](this.events[event] || event, listener);
	}
	function remove(target, event, listener) {
		target[eventTarget.remove](this.events[event] || event, listener);
	}

	return {
		on: function (target, event, listener) {
			mouse.on.apply(mouse, arguments);
			if (touch) { touch.on.apply(touch, arguments); }
		},
		remove: function (target, event, listener) {
			mouse.remove.apply(mouse, arguments);
			if (touch) { touch.remove.apply(touch, arguments); }
		},

		getType: function (event) {
			return inverseEvents[event.type];
		}
	};
})();
