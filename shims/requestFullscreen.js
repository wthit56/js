(function () {
	var elem = Element.prototype;

	if (!elem.requestFullscreen) {
		elem.requestFullscreen = (
			(elem.webkitRequestFullscreen || elem.webkitRequestFullScreen) ||
			(elem.mozRequestFullscreen || elem.mozRequestFullScreen)
		);
	}
	if (!elem.cancelFullscreen) {
		elem.cancelFullscreen = (
			(elem.webkitCancelFullscreen || elem.webkitCancelFullScreen) ||
			(elem.mozCancelFullscreen || elem.mozCancelFullScreen)
		);
	}
})();