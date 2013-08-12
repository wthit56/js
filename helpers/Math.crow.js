if (!Math.crow) {
	Math.crow = (function () {
		var loop, loopHalf;
		return function (value, target, from, to) {
			if ((from != null) || (to != null)) {
				if (from > to) {
					loop = from;
					from = to;
					to = loop;
				}

				loop = (to - from);
				loopHalf = loop / 2;

				value = (target - value - from) % loop;

				if (value > loopHalf) {
					value -= loop;
				}
				else if (value < -loopHalf) {
					value += loop;
				}

				//value += from;
				return value;
			}
			else {
				return target - value;
			}
		};
	})();
}