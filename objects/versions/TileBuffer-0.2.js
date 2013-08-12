// data:text/html;ascii,<script src="http://localhost:45917/objects/versions/TileBuffer-0.2.js"></script>

var efficiency = true;

document.head.appendChild(document.createElement("STYLE")).innerHTML = "" +
	"body {font-family:sans-serif; font-size:14px; line-height:1.4;}"+
	
	"div {"+
	"	float:left; min-width:124px; padding:10px; margin:10px; box-shadow:0 0 5px hsl(0,0%,70%);"+
	"	text-align:center;"+
	"}"+
	"div span {display:block;}"+
	"div canvas {border:2px solid hsl(0,0%,85%);}"+
	
	"br {clear:both}";

function Canvas2D(width, height) {
	var canvas = document.createElement("CANVAS");
	canvas.context = canvas.getContext("2d");
	if (width != null) { canvas.width = width; }
	if (height != null) { canvas.height = height; }
	return canvas;
}

var test = (function () {
	var template = document.createElement("DIV");
	template.appendChild(document.createElement("SPAN"));

	var tileSize = 50;

	function test(info, initial, change) {
		var clone = template.cloneNode(true);

		var infoDisplay = clone.childNodes[0];
		infoDisplay.innerHTML = info + "&nbsp;";

		var canvas = clone.appendChild(Canvas2D(initial.size.x, initial.size.y));
		canvas.offset = { x: 0, y: 0 };

		document.body.appendChild(clone);

		render(canvas, initial, change);

		if (change.from) {
			infoDisplay.innerHTML += "<br />" +
				"(" + (change.from.x + canvas.offset.x) + ", " + (change.from.y + canvas.offset.y) + ") &gt; " +
				"(" + canvas.offset.x + ", " + canvas.offset.y + ")";
		}
	};

	var render = (function () {
		function Area() {
			this.render = false;

			this.from = 0;
			this.to = 0;
		};

		var left = new Area();
		var right = new Area();
		var up = new Area();
		var down = new Area();
		var horizon = { left: 0, right: 0, width: 0 };

		var round = {
			up: function (value, round) {
				return value - (value % round) + round;
			},
			down: function (value, round) {
				return value - (value % round);
			}
		};

		var context;
		var before, after;
		var from, size;
		function render(canvas, initial, change) {
			if (!change) { return this; }

			context = canvas.context;

			from = change.from || initial.from;
			size = change.size || initial.size;

			if (change.from) {
				canvas.offset.x = -change.from.x % tileSize;
				canvas.offset.y = -change.from.y % tileSize;

				change.from.x = round.down(change.from.x, tileSize);
				change.from.y = round.down(change.from.y, tileSize);
			}
			if (change.size) {
				change.size.x = round.up(change.size.x, tileSize);
				change.size.y = round.up(change.size.y, tileSize);
			}

			if (
				!initial.size && change.size &&
				(
					(initial.size.x != change.size.x) ||
					(initial.size.y != change.size.y)
				)
			) {
				left.render = true;
				left.from = change.from.x;
				left.to = change.from.x + change.size.x;
			}
			else {
				if (change.from) {
					// moving horizontally
					before = initial.from.x; after = change.from.x;
					if (after < before) { // moving left
						left.render = true;
						left.from = after;
						left.to = before;
					}
					else if (after > before) { // moving right
						right.from = initial.from.x + initial.size.x;
						right.to = change.from.x + size.x;

						if (right.from < right.to) {
							right.render = true;
						}
					}

					// moving vertically
					before = initial.from.y; after = change.from.y;
					if (after != before) {
						horizon.left = left.render ? left.to : from.x;
						horizon.right = right.render ? right.from : from.x + size.x;

						if (after < before) { // moving up
							up.render = true;
							up.from = after;
							up.to = before;
						}
						else if (after > before) { // moving down
							down.from = initial.from.y + initial.size.y;
							down.to = change.from.y + size.y;

							if (down.from < down.to) {
								down.render = true;
							}
						}
					}
				}

				if (change.size) {
					// resizing horizontally
					before = initial.size.x; after = change.size.x;
					if (after > before) { // expanding width
						if (!right.render) {
							right.from = initial.from.x + initial.size.x;
							right.to = from.x + change.size.x;
							horizon.right = right.from;

							if (right.from < right.to) {
								right.render = true;
							}
						}
					}

					// resizing vertically
					before = initial.size.y; after = change.size.y;
					if (after > before) { // expanding height
						if (!down.render) {
							down.from = initial.from.y + initial.size.y;
							down.to = from.y + change.size.y;

							if (down.from < down.to) {
								down.render = true;
							}
						}

						horizon.left = left.render ? left.to : from.x;
						horizon.right = right.render ? right.from : from.x + size.x;
					}
				}
			}

			// resize
			if (change.size) {
				canvas.width = change.size.x + (efficiency * 20);
				canvas.height = change.size.y + (efficiency * 20);
			}
			else if (efficiency) { // for debugging
				canvas.width = initial.size.x + (efficiency * 20);
				canvas.height = initial.size.y + (efficiency * 20);
			}

			if (efficiency) {
				canvas.context.lineWidth = 0.02;
				canvas.context.strokeStyle = "white";
			}

			// render areas
			if (
				(change.from || change.size) &&
				(left.render || right.render || up.render || down.render)
			) {
				context.save();

				// log render areas
				//if (left.render) { console.log("left", left); }
				//if (right.render) { console.log("right", right); }
				//if (up.render) { console.log("up", up); }
				//if (down.render) { console.log("down", down); }

				// move context
				context.translate(-from.x + (efficiency * 10), -from.y + (efficiency * 10));

				// render new left/right content
				if (left.render || right.render) {
					context.fillStyle = "rgba(255,0,0,0.25)";

					if (left.render) {
						context.fillRect(left.from, from.y, left.to - left.from, size.y);
					}
					if (right.render) {
						context.fillRect(right.from, from.y, right.to - right.from, size.y);
					}
				}

				// render new up/down content
				if (up.render || down.render) {
					context.fillStyle = "rgba(0,0,255,0.25)";

					horizon.width = horizon.right - horizon.left;

					if (up.render) {
						context.fillRect(horizon.left, up.from, horizon.width, up.to - up.from);
					}
					if (down.render) {
						context.fillRect(horizon.left, down.from, horizon.width, down.to - down.from);
					}
				}

				context.restore();
			}

			// render pre-rendered content
			if (initial.from.x + initial.size.x > from.x) {
				context.save();
				{
					context.translate(
						(initial.from.x - from.x) + (efficiency * 10),
						(initial.from.y - from.y) + (efficiency * 10)
					);
					context.scale(initial.size.x, initial.size.y);

					context.fillStyle = "black";
					context.fillRect(0, 0, 1, 1);

					context.beginPath();
					context.moveTo(0, 0);
					context.lineTo(1, 1);
					context.moveTo(1, 0);
					context.lineTo(0, 1);
					context.stroke();
				}
				context.restore();

				if (efficiency) {
					context.fillStyle = "rgba(255,255,255,0.5)";
					context.rect(0, 0, 10, size.y + 20);
					context.rect(size.x + 10, 0, 10, size.y + 20);
					context.rect(10, size.y + 10, size.x + 10, 10);
					context.rect(10, 0, size.x + 10, 10);
					context.fill();
				}
			}

			// reset areas
			left.render = false;
			right.render = false;
			up.render = false;
			down.render = false;

			return this;
		}

		return render;
	})();

	return test;
})();

var AEL = (window.addEventListener || window.attachEvent);
AEL.call(window, "load", function () {
	function br() {
		document.body.appendChild(document.createElement("BR"));
	}

	test("Move expand",
		{ from: { x: 100, y: 100 }, size: { x: 50, y: 50} },
		{ from: { x: 50, y: 50 }, size: { x: 70, y: 70} }
	);

	br();

	test("Expand and center",
		{ from: { x: 100, y: 100 }, size: { x: 50, y: 50} },
		{ from: { x: 50, y: 50 }, size: { x: 120, y: 120} }
	);

	test("No change",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 100} },
		{}
	);

	br();

	test("Move left",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 100} },
		{ from: { x: 80, y: 100} }
	);
	test("Move right",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 100} },
		{ from: { x: 170, y: 100} }
	);
	test("Move up",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 100} },
		{ from: { x: 100, y: 80} }
	);
	test("Move down",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 100} },
		{ from: { x: 100, y: 170} }
	);

	br();

	test("Up left",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 100} },
		{ from: { x: 50, y: 50} }
	);
	test("Up right",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 100} },
		{ from: { x: 150, y: 50} }
	);
	test("Down left",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 100} },
		{ from: { x: 50, y: 150} }
	);
	test("Down right",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 100} },
		{ from: { x: 150, y: 150} }
	);

	br();

	test("Expand width",
		{ from: { x: 100, y: 100 }, size: { x: 50, y: 100} },
		{ size: { x: 70, y: 50} }
	);
	test("Reduce width",
		{ from: { x: 100, y: 100 }, size: { x: 150, y: 100} },
		{ size: { x: 70, y: 50} }
	);
	test("Expand height",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 50} },
		{ size: { x: 50, y: 70} }
	);
	test("Reduce height",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 150} },
		{ size: { x: 50, y: 70} }
	);

	br();

	test("Left thin clipping",
		{ from: { x: 100, y: 100 }, size: { x: 150, y: 100} },
		{ from: { x: 170, y: 100 }, size: { x: 70, y: 50} }
	);
	test("Up short clipping",
		{ from: { x: 100, y: 100 }, size: { x: 100, y: 150} },
		{ from: { x: 100, y: 170 }, size: { x: 50, y: 70} }
	);

});
