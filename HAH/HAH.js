document.head.appendChild(document.createElement("STYLE")).innerHTML = "\
	.hex {float:left; position:relative; line-height:0;}\
		.hex canvas {}\
		.hex span {\
			position:absolute; left:0; right:0; top:0; bottom:0;\
			margin:auto; width:86%; height:86%; border-radius:50%;\
			background-color:rgba(255,255,255,0.5);\
		}\
";

var on = (function () {
	var on;

	if (window.addEventListener) {
		on = function (target, event, listener, useCapture) {
			return target["addEventListener"](event, listener, useCapture);
		};
		on.remove = function (target, event, listener) {
			return target["removeEventListener"](event, listener, useCapture);
		};
	}
	else if (window.attachEvent) {
		on = function (target, event, listener, useCapture) {
			return target["attachEvent"]("on" + event, listener, useCapture);
		};
		on.remove = function (target, event, listener) {
			return target["detachEvent"]("on" + event, listener, useCapture);
		};
	}
	else {
		on = new Boolean(false);
		on.error = new ReferenceError("Browser does not support event handlers.");
	}

	return on;
})();

var sideAngle = (360 / 6) * (Math.PI / 180);

var radius = 100;
var sides = (function () {
	/*
	soh
	sin(angle) = opp / hyp
	sin(angle) * hyp = opp / hyp * hyp
	sin(angle) * hyp = opp
	*/

	/*
	cah
	cos(angle) = adj / hyp
	cos(angle) * hyp = adj
	*/
	var sides = "ABCDEF".split("");

	var sideHalfAngle = sideAngle / 2;
	var sideHeight = Math.cos(sideHalfAngle) * radius;
	var sideHalfWidth = Math.sin(sideHalfAngle) * radius;
	var sideWidth = sideHalfWidth * 2;
	var sideWidthRounded = sideWidth + (2 - (sideWidth % 2)) + 2; // Math.ceil(sideWidth);
	var sideHalfWidthRounded = sideWidthRounded / 2;
	var sideHeightRounded = sideHeight + (1 - (sideHeight % 1)) + 1;

	sides.width = sideWidthRounded;
	sides.height = sideHeightRounded;
	sides.topPad = sideHeight - sideHeightRounded;
	sides.middle = sideHalfWidthRounded;

	var maxSidesWide = 3,
		maxSidesWidth = maxSidesWide * sideWidthRounded;

	var canvas = document.createElement("CANVAS");
	var context = canvas.getContext("2d");
	document.body.appendChild(canvas);

	canvas.width = maxSidesWidth;
	canvas.height = (6 / maxSidesWide) * sideHeightRounded;
	context.translate(0, 1);

	context.textAlign = "center";
	context.textBaseline = "ideographic";
	context.font = (radius / 3) + "px monospace";

	var shadowBlur = radius / 25;
	context.shadowColor = "#FFF";

	var left, top;
	for (var i = 0; i < 6; i++) {
		left = ((sideWidthRounded * i) % maxSidesWidth);
		top = ((i / maxSidesWide) | 0) * sideHeightRounded;

		context.save();
		{
			context.translate(left + sideHalfWidthRounded, top);

			color = "hsl(" + (((i / 6) * 360) + 45) + ",100%,70%)";
			drawSide(sides[i], color);

			var side = sides[i] = {
				mark: sides[i],
				left: left, top: top
			};
		}
		context.restore();
	}

	console.log(sides);

	context.fillStyle = "rgba(0,0,0,0.1)";
	context.globalCompositeOperation = "destination-over";
	for (var i = 0; i < 6; i++) {
		//context.fillRect(sides[i].left, sides[i].top, sides.width, sides.height);
	}
	//context.fillRect(0, 0, sides.width, sides.height);
	context.globalCompositeOperation = "";

	function drawSide(mark, colour) {
		context.shadowBlur = 0;
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(sideHalfWidth, sideHeight);
		context.lineTo(-sideHalfWidth, sideHeight);
		context.closePath();
		context.fillStyle = colour;
		context.fill();

		context.shadowBlur = shadowBlur;
		context.fillStyle = "#000";
		context.fillText(mark, 0, sideHeight);
	}

	sides.image = canvas;
	return sides;
})();

var Hex = (function () {
	var sidesTaken = [];

	function Hex() {
		var HTML = this.HTML = document.createElement("DIV");
		HTML.className = "hex";

		var canvas = this.HTML.Canvas = HTML.appendChild(document.createElement("CANVAS"));
		var context = canvas.getContext("2d");
		canvas.width = canvas.height = radius * 2;

		context.translate(radius, radius);
		context.rotate(sideAngle / 2);

		sidesTaken.length = 6;
		for (var i = 0, side; i < 6; i++) {
			var s;
			while (true) {
				s = (Math.random() * 6) | 0;
				if (!sidesTaken[s]) {
					sidesTaken[s] = true;
					break;
				}
			}

			side = sides[s];
			context.drawImage(
				sides.image,
				side.left, side.top, sides.width, sides.height,
				-sides.middle, sides.topPad, sides.width, sides.height
			);
			context.rotate(sideAngle);
		}

		sidesTaken.length = 0;


		var target = HTML.appendChild(document.createElement("SPAN"));
		target.width = sides.width * 2;
		target.height = sides.height * 2;
		target.Hex = this;
		on(target, "mousedown", analogStart);
		on(target, "mousemove", analogTargetMove);

		this.rotation = 0;

		this.centre = {
			x: 0, y: 0,
			update: function () {
				this.x = target.offsetLeft + (target.offsetWidth / 2);
				this.y = target.offsetTop + (target.offsetHeight / 2);
			}
		};

		this.analog = {
			base: 0, started: false,
			moving: false, from: 0
		};
	}
	Hex.prototype = {
		rotation: 0,
		HTML: null
	};

	var controlling = null;
	function analogStart(e) {
		var hex = e.target.Hex;
		e.preventDefault();

		hex.analog.started = true;
		controlling = hex;
	}
	function analogTargetMove(e) {
		var hex = e.target.Hex;
		var analog = hex.analog;
		if (!analog.started) { return; }
		e.preventDefault();

		if (!analog.moving) {
			e.stopPropagation();
		}
	}
	on(window, "mousemove", function analogMove(e) {
		if (!controlling) { return; }
		var analog = controlling.analog;
		if (!analog.started) { return; }
		var centre = controlling.centre;
		e.preventDefault();

		if (!analog.moving) {
			analog.moving = true;
			analog.from = Math.atan2(e.pageY - centre.y, e.pageX - centre.x);
		}
		else {
			var rotation = analog.base + (Math.atan2(e.pageY - centre.y, e.pageX - centre.x) - analog.from);

			console.log(rotation * (180 / Math.PI));

			controlling.HTML.Canvas.style.WebkitTransform = "rotate(" + rotation + "rad)";
			controlling.rotation = rotation;
		}
	});
	on(window, "mouseup", function analogEnd(e) {
		if (!controlling) { return; }
		var analog = controlling.analog;
		if (!analog.started) { return; }
		e.preventDefault();

		analog.base = controlling.rotation;
		analog.started = false;
		analog.moving = false;

		controlling = null;
	});

	return Hex;
})();

var hex = new Hex();
document.body.appendChild(hex.HTML);
hex.centre.update();

//var Hex = (function (radius) {
//	return;

//	var halfWidth = Math.sin((360 / 6) * (Math.PI / 180)) * radius;

//	var Side = (function () {
//		function Side(mark) {
//			var canvas = document.createElement("CANVAS");
//			var context = canvas.getContext("2d");

//			canvas.width = halfWidth; canvas.height = hexHalfWidth;
//		}
//		Side.prototype = {
//		};

//		return Side;
//	})();
//	Side[0] = new Side("A");
//	Side[1] = new Side("B");
//	Side[2] = new Side("C");
//	Side[3] = new Side("D");
//	Side[4] = new Side("E");
//	Side[5] = new Side("F");
//	Side.length = 6;

//	var sides = [
//		new Side("A"),
//		new Side("B"),
//		new Side("C"),
//		new Side("D"),
//		new Side("E"),
//		new Side("F")
//	];

//	function Hex() {

//	}
//	Hex.prototype = {
//	};

//	return Hex;
//})(300);
