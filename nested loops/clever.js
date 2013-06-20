var max = 2;
var i;

var max5 = Math.pow(max, 5),
	max4 = Math.pow(max, 4),
	max3 = Math.pow(max, 3),
	max2 = Math.pow(max, 2),
	max1 = Math.pow(max, 1),
	max0 = Math.pow(max, 0);

for (i = 0; i < max5; i++) {
	console.log(
		(((i / max4) % max) | 0) + " " + // v
		(((i / max3) % max) | 0) + " " + // w
		(((i / max2) % max) | 0) + " " + // x
		(((i / max1) % max) | 0) + " " + // y
		(((i / max0) % max) | 0) // z
	);
}
