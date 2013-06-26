if (!window.eventTarget) {
	window.eventTarget = (function () {
		if (window.addEventListener && window.removeEventListener) {
			return { add: "addEventListener", remove: "removeEventListener" };
		}
		else if (window.attachEvent && window.detachEvent) {
			return { add: "attachEvent", remove: "detachEvent" };
		}
		else {
			return undefined;
		}
	})();
}