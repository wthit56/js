(function (force) {
	if (force || (undefined === Date.now)) {
		Date.now = function () {
			return new Date().getTime();
		};
	}
})();