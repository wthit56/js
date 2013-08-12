(function (force) {
	window.rafcaf_loaded = true;

	if (!force) {
		if (undefined === window.requestAnimationFrame) {
			window.requestAnimationFrame =
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame;
		}
		if (undefined === window.cancelAnimationFrame) {
			window.cancelAnimationFrame =
				window.webkitCancelAnimationFrame ||
				window.webkitCancelRequestAnimationFrame ||
				window.mozCancelAnimationFrame;
		}
	}

	if (
		force ||
		(undefined === window.requestAnimationFrame) ||
		(undefined === window.cancelAnimationFrame)
	) {
		var now = (undefined !== Date.now)
			? function () { return Date.now(); }
			: function () { return new Date().getTime(); };

		window.requestAnimationFrame = function requestAnimationFrame(callback) {
			return setTimeout(callback, 16 - (now() % 16));
		};
		window.cancelAnimationFrame = function cancelAnimationFrame(id) {
			clearTimeout(id);
		};
	}
})();