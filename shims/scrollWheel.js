if (!window.scrollWheel) {
	window.scrollWheel = (function () {
		var on = (function () { var W = window, F = Function, j, A = "add", a = "at", R = "remove", r = "de", T = "tach", E = "Event", L = "Listener", t = "target", e = "event", l = "listener", u = "useCapture", f = "return " + t + "['", g = "'](", h = "'on'+", i = e + "," + l + "," + u + ")"; if (W[A + E + L]) { j = E + L + g + i; on = F(t, e, l, u, f + A + j); on.remove = F(t, e, l, u, f + R + j) } else if (W[a + T + E]) { j = T + E + g + h + i; on = F(t, e, l, u, f + a + j); on.remove = F(t, e, l, u, f + r + j) } else { on = F("throw new ReferenceError('Browser does not support event handlers.')"); on.remove = F("on()"); on.supported = !1 } return on })();

		var event, convert;
		var getY, getX;

		//"MozMousePixelScroll"

		var add = function (target, listener, useCapture) {
			on(target, event, listener, useCapture);
		};
		var remove = function (target, listener, useCapture) {
			on.remove(target, event, listener, useCapture);
		};

		if ("onmousewheel" in document) {
			var ratio = -1 / 40;
			event = "mousewheel";
			getY = function (e) {
				return e.wheelDelta * ratio;
			};
			getX = function (e) {
				e = e.wheelDeltaX;
				if (e == null) { return e; }

				return e * ratio;
			};
		}
		else {
			if ("onwheel" in document) {
				event = "wheel";

				getY = function (e) {
					return e.deltaY;
				}
			}
			else {
				add = function (target, listener, useCapture) {
					on(target, "MozMousePixelScroll", listener, useCapture);
					on(target, "DOMMouseScroll", listener, useCapture);
				};
				remove = function (target, listener, useCapture) {
					on.remove(target, "MozMousePixelScroll", listener, useCapture);
					on.remove(target, "DOMMouseScroll", listener, useCapture);
				};

				getY = function (e) {
					return e.detail;
				};
			}
		}

		var scrollWheel = {
			add: add,
			remove: remove,

			get: getY, getY: getY, getX: getX
		};



		return scrollWheel;

	})();
}