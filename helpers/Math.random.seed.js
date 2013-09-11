if (!Math.random.seed) {
	(function () {
		var seedValue;

		function random() {
			seedValue = ((seedValue * 9301) + 49297) % 233280;
			return (seedValue / 233280);
		}
		function seed(seed) {
			if ((seed !== undefined) && isNaN(seed)) {
				throw new SyntaxError("Math.random.seed() expects a number, null or undefined as an argument.");
			}

			seedValue = seed;

			if (seed == null) {
				Math.random = _random;
			}
			else {
				Math.random = random;
			}
		};

		var _random = Math.random;
		_random.seed = seed;

		random.seed = seed;
	})();
}