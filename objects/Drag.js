if (!window.Drag) {
	window.Drag = (function () {
		if (!eventTarget) { return null; }

		var global = this;
		var clean = [];
		var touches = {}, mouse = null;
		var containers = {};

		var hasTouch = ("ontouchstart" in document);
		var isTouchEvent = /^touch/;

		function Drag(event, listener, end, dragContainer) {
			var obj = null;
			if (clean.length) {
				obj = clean.pop();
			}
			else if (this === global) {
				obj = Object.create(Drag.prototype);
			}

			if (obj) {
				Drag.apply(obj, arguments);
				return obj;
			}

			if (end) { listener.end = end; }
			this.listener = listener;
			this.type = "start";

			dragContainer = this.dragContainer =
				(dragContainer || global);

			if (this.isNew) {
				var _ = this;
				this.position = {
					x: 0, y: 0,
					dirty: false,
					diff: {
						x: 0, y: 0,
						dirty: false,
						origin: { x: 0, y: 0 },
						get: function () { return get_diff.call(_); }
					},
					origin: {
						x: 0, y: 0,
						from: {
							x: 0, y: 0,
							dirty: false,
							get: function () { return get_from_origin.call(_); }
						}
					}
				};

				this.isNew = false;
			}

			start.call(this, event);
		}
		Drag.prototype = {
			isNew: true,

			dragContainer: null,
			position: null,
			touch: null,
			listener: null,

			type: null
		};
		Drag.hook = function (target, listener) {
			target[eventTarget.add]("mousedown", listener);
			if (hasTouch) {
				target[eventTarget.add]("touchstart", listener);
			}
		};

		function get_pos() {
			var pos = this.position;
			pos.dirty = false;
			return pos;
		}
		function get_diff() {
			var pos = this.position,
			diff = pos.diff;

			if (diff.dirty) {
				diff.x = pos.x - diff.origin.x;
				diff.y = pos.y - diff.origin.y;

				diff.origin.x = pos.x;
				diff.origin.y = pos.y;

				diff.dirty = false;

				return diff;
			}
		}
		function get_from_origin() {
			var pos = this.position,
				origin = pos.origin,
				from = origin.from;

			if (from.dirty) {
				from.x = pos.x - origin.x;
				from.y = pos.y - origin.y;

				from.dirty = false;

				return from;
			}
		}

		function pointer_do(action, e) {
			if (!e) { e = window.event; }

			if (hasTouch && isTouchEvent.test(e.type)) {
				var changedTouches = e.changedTouches,
				current;

				var i = 0, l = changedTouches.length;
				while (i < l) {
					current = touches[changedTouches[i].identifier];

					if (current) {
						action.call(current, e);
					}

					i++;
				}
			}
			else if (mouse) {
				action.call(mouse, e);
			}
		}

		var start = (function () {
			var pos, origin, diff, dragContainer, bound;

			return function start(e) {
				var pos = this.position;
				pos.dirty = true;

				var origin = pos.origin;
				origin.from.dirty = true;

				var diff = pos.diff;
				diff.dirty = true;

				pos.x = pos.origin.x = diff.origin.x = e.pageX;
				pos.y = pos.origin.y = diff.origin.y = e.pageY;

				if (isNaN(pos.x)) { debugger; }

				var dragContainer = this.dragContainer;
				bound = dragContainer._Drag_bound;
				if (bound == null) {
					bound = dragContainer._Drag_bound = 1;
				}

				if (hasTouch && isTouchEvent.test(e.type)) {
					this.touch = event.changedTouches[0].identifier;
					touches[this.touch] = this;

					if (bound === 1) {
						dragContainer[eventTarget.add]("touchmove", move.handler);
						dragContainer[eventTarget.add]("touchend", end.handler);
						dragContainer[eventTarget.add]("touchcancel", end.handler);
					}
				}
				else {
					mouse = this;
					this.touch = null;

					if (bound === 1) {
						dragContainer[eventTarget.add]("mousemove", move.handler);
						dragContainer[eventTarget.add]("mouseup", end.handler);
					}
				}

				dragContainer = null;
			};
		})();
		var move = (function () {
			var pos;

			function move(e) {
				pos = this.position;
				if ((pos.x != e.pageX) || (pos.y != e.pageY)) {
					pos.dirty = pos.origin.from.dirty = pos.diff.dirty =
						true;
				}

				pos.x = e.pageX;
				pos.y = e.pageY;

				if (isNaN(pos.x)) { debugger; }

				event.Drag = this;
				this.type = "move";
				this.listener(event);
			}
			move.handler = function (e) {
				pointer_do(move, e);
			}

			return move;
		})();
		var end = (function () {
			var dragContainer, bound, pos;

			function end(e) {
				dragContainer = this.dragContainer;
				bound = --dragContainer._Drag_bound;

				if (this.touch != null) {
					touches[this.touch] = null;

					if (!bound) {
						dragContainer[eventTarget.remove]("touchmove", move.handler);
						dragContainer[eventTarget.remove]("touchend", end.handler);
						dragContainer[eventTarget.remove]("touchcancel", end.handler);
					}
				}
				else {
					mouse = null;

					if (!bound) {
						dragContainer[eventTarget.remove]("mousemove", move.handler);
						dragContainer[eventTarget.remove]("mouseup", end.handler);
					}
				}

				if (!bound) { dragContainer._Drag_bound = null; }

				pos = this.position;
				if ((pos.x != e.pageX) || (pos.y != e.pageY)) {
					pos.origin.from.dirty = pos.diff.dirty =
						true;
				}

				pos.x = e.pageX;
				pos.y = e.pageY;

				if (isNaN(pos.x)) { debugger; }

				event.Drag = this;
				(this.listener.end || this.listener)(event);

				pos.origin.from.x = pos.origin.from.y =
				pos.diff.x = pos.diff.y =
					0;

				this.touch = null;
				this.listener = null;

				dragContainer = null;
				clean.push(this);
			}
			end.handler = function (e) {
				pointer_do(end, e);
			};

			return end;
		})();

		return Drag;
	})();
}