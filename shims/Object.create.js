if (!Object.create) {
	Object.create = (function () {
		function F() { }

		return function (proto) {
			if (typeof (proto) != "object") {
				throw new TypeError("Object prototype may only be an Object or null");
			}

			F.prototype = proto;

			return new F();
		};
	})();
}
