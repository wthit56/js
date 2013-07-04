if (!window.Drag) {
	window.Drag = (function () {
		// eventTarget not already loaded...
		if (!window.eventTarget) {
			// ...so load it
			(function (w, e, l, t, a, r, A, D, _) { e = "eventTarget"; if (!w[e]) { l = "EventListener", t = "tachEvent", a = "add", r = "remove", A = "at", D = "de"; _ = w[e] = {}; if (w[a + l] && w[r + l]) _[a] = a + l, _[r] = r + l; else if (w[A + t] && w[A + t]) _[a] = A + t, _[r] = D + t; else w[e] = null; } })(window);
			// (code minified)
		}

		var clean = []; // holds all clean Drag objects
		var touches = { length: 0 }, mouse = null; // active inputs cache

		var hasTouch = ("ontouchstart" in document); // browser is touch enabled
		var isTouchEvent = /^touch/; // tests for touch event types

		// creates a new Drag object (or a recycled one),
		//	based on a given event (Event), listener (function),
		//	option end (function), and optional dragContainer (HTML Element) defaulting to the window
		function Drag(event, listener, end, dragContainer) {
			// no listener function was given...
			if (!(listener instanceof Function)) {
				// ...so create one
				listener = function (e) { };
			}

			var obj = null; // holds "real" new object 
			// clean Drag objects exist in memory...
			if (clean.length) {
				// ...so remove and use the last clean object
				obj = clean.pop();
			}
			// no clean Drag objects exist in memory,
			//	and Drag was not called as a constructor with the "new" keyword...
			else if (!(this instanceof Drag)) {
				// ...so create and use a new object
				//	based on Drag's prototype
				obj = Object.create(Drag.prototype);
			}

			// "real" object found or created...
			if (obj) {
				// ...so apply arguments and constructor to new object...
				Drag.apply(obj, arguments);
				// ...and return it
				return obj;
			}

			// "end" function was given...
			if (end) {
				// ...so attach it to the main listener
				listener.end = end;
			}

			this.listener = listener; // store listener

			// store dragContainer, defaulting to the window
			this.dragContainer = (dragContainer || window);

			// object is newly created...
			if (this.isNew) {
				// ...so create and store a new position object
				this.position = {
					x: 0, y: 0, // current position
					dirty: false, // current position has been changed since it was last read
					diff: { // difference between current and last-read position
						x: 0, y: 0, // last-read diff
						dirty: false, // current position has changed since diff was last read
						last: { x: 0, y: 0} // last position that diff was read at
					},
					origin: { // original position when Drag was first created
						x: 0, y: 0, // original position
						from: { // difference between current position and original position
							x: 0, y: 0, // last-read difference
							dirty: false // current position has changed since difference was last read
						}
					}
				};

				// defaults to keep object shape
				this.touchID = null;

				this.isNew = false; // object is no longer new
			}

			this.isActive = true; // object is now being used

			this.type = "start"; // set normalized event type

			// trigger start function
			start.call(this, event);
		}
		Drag.prototype = {
			isNew: true, // has object not yet been fully instantiated?
			isActive: false, // is Drag currently active? (false when "cleaned")

			position: null, // stores position telemetry
			type: null, // type to be used as normalized event type
			touchID: null, // stores initiating touch's identification if applicable, otherwise null

			// stores the general listener function to be called for every "move" event
			//	will also handle "end" events if no "end" listener was specified on instantiation
			listener: null,

			dragContainer: null, // stores the HTML Element that should handle the "move" and "end" events

			// returns new position if it has changed,
			//	or undefined if it has not
			getChangedPosition: (function () {
				var pos;

				return function Drag_getChangedPosition() {
					// find position object
					pos = this.position;

					// position has changed since last read...
					if (pos.dirty) {
						// ...so position is no longer dirty and is returned
						pos.dirty = false;

						return pos;
					}
				}
			})(),

			// returns difference between current and last-read position if position has changed,
			//	or undefined if not
			getChangedDiff: (function () {
				var pos, diff;

				return function Drag_getChangedDiff() {
					// find position and diff objects
					pos = this.position;
					diff = pos.diff;

					// position has changed since diff was last read...
					if (diff.dirty) {
						// ...so calculate and return diff

						// find last diff position
						diffLast = diff.last;

						// calculate diff
						diff.x = pos.x - diffLast.x;
						diff.y = pos.y - diffLast.y;

						// store current position
						diffLast.x = pos.x;
						diffLast.y = pos.y;

						// diff is no longer dirty
						diff.dirty = false;

						return diff;
					}
				};
			})(),

			// returns difference between current position and original position if position has changed,
			//	or undefined if not
			getChangedFromOrigin: (function () {
				var pos, origin, originFrom;

				return function Drag_getChangedFromOrigin() {
					// find position and origin variables
					pos = this.position;
					origin = pos.origin;
					originFrom = origin.from;

					// position has changed since from-origin was last read...
					if (originFrom.dirty) {
						// ...so calculate and return new from-origin values
						originFrom.x = pos.x - origin.x;
						originFrom.y = pos.y - origin.y;

						// from-origin no longer dirty
						originFrom.dirty = false;

						return originFrom;
					}
				};
			})()
		};

		// hooks up entire Drag life-cycle,
		//	based on given target, handlers, and dragContainer
		Drag.hook = function (target, start, move, end, dragContainer) {
			if (!(target instanceof HTMLElement)) { throw new TypeError("Parameter 'target' must be specified as an HTML Element."); }
			if (!(start instanceof Function)) { throw new TypeError("Parameter 'start' must be a function to handle events."); }
			move = move || start; // default to start handler
			end = end || move; // default to move handler

			// create listener to start a Drag
			function start_proxy(e) {
				// call start handler
				//	with the context of a newly-created Drag object,
				//	and the event
				return start.call(new Drag(e, move, end, dragContainer), e);
			};

			// add listener to target element for initial mouse event
			target[eventTarget.add]("mousedown", start_proxy);

			// browser is touch-enabled...
			if (hasTouch) {
				// ...so add listener to target element for initial touch event
				target[eventTarget.add]("touchstart", start_proxy);
			}
		};

		// finds any relevant, Drag handled pointers (touch or mouse),
		//	and calls the given action
		var pointer_do = (function () {
			var changed, current;
			var i, l;

			return function pointer_do(action, e) {
				// use window.event for older browsers
				if (!e) { e = window.event; }

				// browser supports touch events,
				//	there are active touches in the cache,
				//	and current event is a touch event...
				if (hasTouch && touches.length && isTouchEvent.test(e.type)) {
					// ...so find and trigger any Drag'd touches with the event

					// find changed touches array
					changed = e.changedTouches;

					// loop through each changed touch
					for (i = 0, l = changed.length; i < l; i++) {
						// find current touch in cache
						current = touches[changed[i].identifier];

						// touch was found in cache...
						if (current) {
							// ...so call the action on the touch's Drag event
							action.call(current, e);
						}
					}
				}
				// action cannot be triggered by touch
				//	and the mouse is being used as a Drag pointer
				else if (mouse) {
					// ...so call the action on the mouse Drag object
					action.call(mouse, e);
				}
			};
		})();

		// performs initial set up for a Drag object
		var start = (function () {
			var pos, origin, diff;
			var dragContainer, bound;
			var touchID;

			return function start(e) {
				// find object
				pos = this.position;
				origin = pos.origin;
				diff = pos.diff;

				// set position, origin, and last-read diff values,
				//	based on event's positioning
				pos.x = origin.x = diff.last.x = e.pageX;
				pos.y = origin.y = diff.last.y = e.pageY;

				// all properties are dirty
				pos.dirty = true;
				origin.from.dirty = true;
				diff.dirty = true;

				// find dragContainer
				dragContainer = this.dragContainer;

				// find boundCount
				boundCount = dragContainer._Drag_boundCount;
				// no boundCount was found...
				if (boundCount == null) {
					// ...so set it to 1
					boundCount = dragContainer._Drag_boundCount = 1;
					// a container's boundCount will be used to ensure
					//	only one set of events are ever bound to a single element,
					//	and are removed only when there are no Drag objects actively
					//	using the element as their dragContainer
				}

				// browser supports touch events,
				//	and initiating event is a touch event...
				if (hasTouch && isTouchEvent.test(e.type)) {
					// ...so set up touch

					touchID = this.touchID = event.changedTouches[0].identifier; // store current touch's ID

					// add this Drag object to the active touch cache,
					//	using the current touch's ID
					touches[touchID] = this;
					touches.length++;

					// this is the first Drag bind to the dragContainer...
					if (boundCount === 1) {
						// ...so attach touch events
						dragContainer[eventTarget.add]("touchmove", move.handler);
						dragContainer[eventTarget.add]("touchend", end.handler);
						dragContainer[eventTarget.add]("touchcancel", end.handler);
					}
				}
				// browser does not support touch events,
				//	or initiating event is not a touch event...
				else {
					// ...so it must be a mouse event

					// set active mouse cache to point to this Drag object
					mouse = this;

					// this is not a touch object, so touchID should be null
					this.touchID = null;

					// this is the first Drag bind to the dragContainer...
					if (boundCount === 1) {
						// ...so attach mouse events
						dragContainer[eventTarget.add]("mousemove", move.handler);
						dragContainer[eventTarget.add]("mouseup", end.handler);
					}
				}

				// release references
				dragContainer = null;
			};
		})();

		// handles "move" events
		var move = (function () {
			var pos;

			function move(e) {
				// find position object
				pos = this.position;

				// event position is different to stored position...
				if ((pos.x != e.pageX) || (pos.y != e.pageY)) {
					// ...so update position
					pos.x = e.pageX;
					pos.y = e.pageY;

					// position is now dirty
					pos.dirty = pos.origin.from.dirty = pos.diff.dirty = true;
				}

				event.Drag = this; // link event to this Drag
				this.type = "move"; // set normalized event type
				this.listener(event); // call listener
			}
			// used as initial "move" event handler
			move.handler = function (e) {
				// forward to pointer_do with "move" action and event
				pointer_do(move, e);
			}

			return move;
		})();

		// handles "end" events
		var end = (function () {
			var dragContainer, boundCount;
			var pos, originFrom, diff;

			function end(e) {
				// find dragContainer
				dragContainer = this.dragContainer;

				// decrease and retrieve dragContainer's boundCount
				boundCount = --dragContainer._Drag_boundCount;
				// boundCount now 0...
				if (boundCount <= 0) {
					// ...so set to undefined
					boundCount = dragContainer._Drag_boundCount = undefined;
				}

				// Drag is tracking a touch pointer...
				if (this.touchID != null) {
					// ...so remove all touch-related hooks

					// remove from cache
					touches[this.touchID] = null;
					touches.length--; // decrease touch count

					// no Drag objects actively bound to dragContainer...
					if (!boundCount) {
						// ...so remove touch event handlers
						dragContainer[eventTarget.remove]("touchmove", move.handler);
						dragContainer[eventTarget.remove]("touchend", end.handler);
						dragContainer[eventTarget.remove]("touchcancel", end.handler);
					}
				}
				// Drag is not tracking a touch pointer...
				else {
					// ...so remove all mouse-related hooks

					// remove from cache
					mouse = null;

					// no Drag objects actively bound to dragContainer...
					if (!boundCount) {
						// ...so remove mouse event handlers
						dragContainer[eventTarget.remove]("mousemove", move.handler);
						dragContainer[eventTarget.remove]("mouseup", end.handler);
					}
				}

				// find position object
				pos = this.position;
				// event position changed...
				if ((pos.x != e.pageX) || (pos.y != e.pageY)) {
					// ...so update values
					pos.x = e.pageX;
					pos.y = e.pageY;

					// position is now dirty
					pos.origin.from.dirty = pos.diff.dirty = true;
				}

				event.Drag = this; // link event to this Drag
				this.type = "end"; // set normalized event type
				// call listener
				//	(use "end" listener, default to main listener)
				(this.listener.end || this.listener)(event);

				// find telemetry objects
				originFrom = pos.origin.from;
				diff = pos.diff;

				// reset properties
				this.touchID = null;
				this.listener = null;
				dragContainer = this.dragContainer = null;

				this.isActive = false; // this Drag is no longer active

				// add to clean cache
				clean.push(this);
			}
			// used as initial "end" event handler
			end.handler = function (e) {
				// forward to pointer_do with "end" action and event
				pointer_do(end, e);
			};

			return end;
		})();

		return Drag;
	})();
}