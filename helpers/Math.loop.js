if (!Math.loop) {
	Math.loop = function (value, from, to) {
		value -= from;
		to -= from;
		return (((value % to) + to) % to) + from;
	}
}