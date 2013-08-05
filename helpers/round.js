function round(value, precision) {
	var over = (value % precision);
	var halfPrecision = precision / 2;

	return (
		value - over +
		precision * (
			((over < 0) && (over < -halfPrecision)) ? -1 :
			((over > 0) && (over >= halfPrecision)) ? 1 :
			0
		)
	);
}

function test(value, precision, expected){
	var result = round(value, precision);
	((result === expected) ? console.log : console.error).call(console,
		"round(value:" + value + ", precision:" + precision + ")" +
		" === " + result + " (should be " + expected + ")"
	);
}
//test(6, 10, 10);
test(4, 10,0);test(-4, 10, 0);
test(5, 10,10);test(-5, 10, 0);
test(6, 10,10);test(-6, 10, -10);
test(10, 10, 10);test(-10, 10, -10);
test(11, 10, 10);test(-11, 10, -10);
test(15, 10, 20);test(-15, 10, -10);
