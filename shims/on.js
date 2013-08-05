// TERSE ---
// var W = window, F = Function, j,
//	A = "add", a = "at", R = "remove", r = "de", T = "tach", E = "Event", L = "Listener",
//	t = "target", e = "event", l = "listener", u = "useCapture",
//	f = "return " + t + "['", g = "'](", h = "'on'+", i = e + "," + l + "," + u + ");";
// if (W[A + E + L]) {
//	j = E + L + g + i;
//	on = F(t, e, l, u, f + A + j);
//	on.remove = F(t, e, l, u, f + R + j);
// }
// else if (W[a + T + E]) {
//	j = T + E + g + h + i;
//	on = F(t, e, l, u, f + a + j);
//	on.remove = F(t, e, l, u, f + r + j);
// }

// MINIFIED ---
// var on=(function(){var W=window,F=Function,j,A="add",a="at",R="remove",r="de",T="tach",E="Event",L="Listener",t="target",e="event",l="listener",u="useCapture",f="return "+t+"['",g="'](",h="'on'+",i=e+","+l+","+u+")";if(W[A+E+L]){j=E+L+g+i;on=F(t,e,l,u,f+A+j);on.remove=F(t,e,l,u,f+R+j)}else if(W[a+T+E]){j=T+E+g+h+i;on=F(t,e,l,u,f+a+j);on.remove=F(t,e,l,u,f+r+j)}else{on=F("throw new ReferenceError('Browser does not support event handlers.')");on.remove=F("on()");on.supported=!1}return on})();

var on = (function () {
	var on;

	if (window.addEventListener) {
		on = function (target, event, listener, useCapture) {
			target["addEventListener"](event, listener, useCapture);
		};
		on.remove = function (target, event, listener) {
			target["removeEventListener"](event, listener, useCapture);
		};
	}
	else if (window.attachEvent) {
		on = function (target, event, listener, useCapture) {
			target["attachEvent"]("on" + event, listener, useCapture);
		};
		on.remove = function (target, event, listener) {
			target["detachEvent"]("on" + event, listener, useCapture);
		};
	}
	else {
		on = function () {
			throw new ReferenceError("Browser does not support event handlers.");
		};
		on.remove = function () { on(); };
		on.supported = false;
	}

	return on;
})();
