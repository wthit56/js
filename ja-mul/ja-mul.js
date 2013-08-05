// http://www.youtube.com/watch?v=85Vd0NpL32k
var jamul = (function () {
	var size = 500, centre = size / 2, padding = 10;

	function jamul(a, b) {
		console.log(a + " * " + b + " = " + (a * b));

		var result = a * b;

		a = "" + a;
		b = "" + b;

		var context = HTML.context;
		context.clearRect(0, 0, size, size);

		context.strokeStyle = "hsl(0,0%,80%)";
		context.beginPath();
		context.moveTo(centre, 0);
		context.lineTo(centre, size);
		context.moveTo(0, centre);
		context.lineTo(size, centre);
		context.stroke();

		context.save();
		{
			/*
			cah
			cos(angle) = adj / hyp
			cos(angle) * hyp = adj
			*/

			var angle = -45 * (Math.PI / 180);
			var scale = Math.cos(angle) * (size - (padding * 2));

			//var scale = size - (padding * 2);
			var pad = padding / scale;
			var aFirstBunchRadius = bunchRadius(+a[0], pad);
			var aLastBunchRadius = bunchRadius(+a[a.length - 1], pad);
			var aLastBunchCentre = 1 - aLastBunchRadius;
			var aSpacing = (1 - aFirstBunchRadius - aLastBunchRadius) / (a.length - 1);

			function bunchRadius(number, padding) {
				return (number - (number % 2)) * padding / 2;
			}

			context.translate(padding, centre);
			context.rotate(angle);
			context.scale(scale, scale);
			context.lineWidth = 1 / scale;

			context.strokeStyle = "#000000";

			//context.beginPath();
			//context.moveTo(0, 0);
			//context.lineTo(1, 0);
			//context.moveTo(0, 1);
			//context.lineTo(1, 1);
			//context.stroke();

			for (var i = 0, il = a.length; i < il; i++) {
				var yCentre = aFirstBunchRadius + (i * aSpacing);
				var iv = +a[i];
				var iBunchStart = yCentre - bunchRadius(iv, pad);

				for (var j = 0; j < iv; j++) {
					var yOffset = iBunchStart + (j * pad);
					context.beginPath();
					context.moveTo(0, yOffset);
					context.lineTo(1, yOffset);
					context.stroke();
				}
			}
		}
		context.restore();
	}

	var HTML = jamul.HTML = (function () {
		var canvas = document.createElement("CANVAS");
		canvas.width = size; canvas.height = size;
		canvas.context = canvas.getContext("2d");

		return canvas;
	})();

	return jamul;
})();