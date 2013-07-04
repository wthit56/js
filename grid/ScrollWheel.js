if (!window.ScrollWheel) {
	window.ScrollWheel = (function () {
		if (!window.eventTarget) {
			(function (w, e, l, t, a, r, A, D, _) { e = "eventTarget"; if (!w[e]) { l = "EventListener", t = "tachEvent", a = "add", r = "remove", A = "at", D = "de"; _ = w[e] = {}; if (w[a + l] && w[r + l]) _[a] = a + l, _[r] = r + l; else if (w[A + t] && w[A + t]) _[a] = A + t, _[r] = D + t; else w[e] = null; } })(window);
		}

		var eventType, handler, deltaX;
		if ("onmousewheel" in document) {
			eventType = "mousewheel";
			deltaX = true;
			handler = (function () {
				var ratio = -(1 / 40), delta;

				return function (e) {
					delta = this.delta;
					delta.y = ratio * e.wheelDelta;
					if (deltaX) { delta.x = ratio * e.wheelDeltaX; }

					return this.listener.call(this, e);
				};
			})();
		}
		else {
			if ("onwheel" in document) {
				eventType = "wheel";
			}
			else {
				eventType = "DOMMouseScroll";
			}

			handler = function (e) {
				this.delta.y = e.detail;
				console.log(this);
				return this.listener.call(this, e);
			}
		}

		var clean = [];

		function ScrollWheel(target, listener) {
			var newObj;
			if (clean.length) {
				newObj = clean.pop();
			}
			else if (!(this instanceof ScrollWheel)) {
				newObj = Object.create(ScrollWheel.prototype);
			}

			if (newObj) {
				ScrollWheel.apply(newObj, arguments);
				return newObj;
			}

			this.target = target;
			this.listener = listener;

			if (this.isNew) {
				this.delta = { x: (deltaX ? 0 : null), y: 0 };

				var _ = this;
				this.handler = function (e) {
					handler.call(_, e);
				}

				this.isNew = false;
			}

			target[eventTarget.add](eventType, this.handler);
		}
		ScrollWheel.prototype = {
			isNew: true,

			target: null, listener: null,
			handler: null, delta: null,

			remove: function () {
				this.target[eventTarget.remove](eventType, this.handler);
				this.target = this.listener = null;
				this.delta.y = 0; this.delta.x = (deltaX ? 0 : null);
				clean.push(this);
			}
		};

		return ScrollWheel;
	})();
}