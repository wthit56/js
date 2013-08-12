if (!Math.round.precision) {
	Math.round = (function () {
		var _round = Math.round;

		var over = 0,
			halfPrecision = 0;

		function round(value, precision) {
			if (precision < 0) { precision = Math.abs(precision); }

			if ((precision == null) || (precision === 1)) {
				return _round(value);
			}

			over = (value % precision);
			halfPrecision = precision / 2;

			return (
				value - over +
				precision * (
					((over < 0) && (over < -halfPrecision)) ? -1 :
					((over > 0) && (over >= halfPrecision)) ? 1 :
					0
				)
			);
		};
		round.precision = true;

		return round;
	})();
}