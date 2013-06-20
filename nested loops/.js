var start;
var i, il,
	x, xl = 2,
	y, yl = 3, ym,
	z, zl = 4, zm;

function handleX(i) {}
function handleY(i) {}
function handleZ(i) {
	console.log("position: \t" + x + "\t" + y + "\t" + z);
}

console.group("3 nested loops");
{
	// setup
	i = 0;
	il = xl * yl * zl;
	xm = xl * yl;

	start = new Date();
	
	//loop
	while (i < il) {
		z = (i % zl);
		if (z === 0) {
			y = (i - (i % yl)) / yl;
			if (i > 0) { debugger; }
			console.log("y: ", y, "\ti: ", i);
			if (y === 0) {
				x = (i - (i % xm)) / xm;
				console.log("x: ", x, "\ti: ", i);
				handleX(x);
			}
			handleY(y);
		}
		handleZ(z);

		i++;
	}
	console.log("time: " + ((new Date() - start) / 1000) + "ms");
}
console.groupEnd();