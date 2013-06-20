// data:text/html;ascii,<script src="http://localhost:45917/infinite-tiles/0.21.js"></script>

document.head.appendChild(document.createElement("STYLE")).innerHTML = "\
	body {margin:5px;}\
	\
	#container {float:left; position:relative;}\
	#port {overflow:hidden;}\
		#port canvas {box-shadow:0 0 5px hsl(0,0%,50%); -webkit-transform:translateZ(0);}\
	#resizeHandle {\
		background:hsl(0, 0%, 50%);\
		display:block; width:20px; height:20px;\
		position:absolute; right:-20px; bottom:-20px;\
	}\
";

function Canvas2D(width, height) {
	var canvas = document.createElement("CANVAS");
	canvas.context = canvas.getContext("2d");
	if (width != null) { canvas.width = width; }
	if (height != null) { canvas.height = height; }
	return canvas;
}

function importScript(src, type) {
	var script = document.createElement("SCRIPT");
	script.src = src;
	script.type = type || "text/javascript";
	document.head.appendChild(script);
}
importScript("http://192.168.0.9:45917/shims/raf-caf.js");

var test = (function () {
	var tileSize = 50;

	function test(width, height, mapWidth, mapHeight) {
		var canvas = Canvas2D(500, 0, 0);
		canvas.offset = { x: 0, y: 0 };
		canvas.map = {
			size: { x: mapWidth, y: mapHeight },
			max: { x: mapWidth, y: mapHeight }
		};

		var initial = {
			from: { x: 0, y: 0 },
			size: { x: 0, y: 0 }
		};
		var change = {
			from: { x: 0, y: 0, dirty: false },
			size: { x: width, y: height, dirty: true }
		};

		requestAnimationFrame(function raf() {
			render(canvas, initial, change);
			canvas.style.webkitTransform = "translate3d(" + canvas.offset.x + "px, " + canvas.offset.y + "px, 0)";

			requestAnimationFrame(raf, canvas);
		});

		return {
			canvas: canvas,

			current: initial,
			change: change,

			resize: function (x, y) {
				change.size.x = x;
				change.size.y = y;
				change.size.dirty = true;
			},

			moveTo: function (x, y) {
				change.from.x = x;
				change.from.y = y;
				change.from.dirty = true;
			}
		};
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

		function fixSize(value, tileSize) {
			var result = value - (value % tileSize) + tileSize;
			if ((value % tileSize) != 0) { result += tileSize; }
			return result;
		}

		var context;
		var before, after;
		var from, size;
		function render(canvas, initial, change) {
			if (!change) { return this; }

			context = canvas.context;

			from = change.from.dirty ? change.from : initial.from;
			size = change.size.dirty ? change.size : initial.size;

			if (change.size.dirty) {
				var cx = change.size.x;
				change.size.x = fixSize(change.size.x, tileSize);
				change.size.y = fixSize(change.size.y, tileSize);

				canvas.map.max.x = canvas.map.size.x - change.size.x;
				canvas.map.max.y = canvas.map.size.y - change.size.y;

				if (!change.from.dirty) {
					// find original "from"
					change.from.x = initial.from.x - canvas.offset.x;
					change.from.y = initial.from.y - canvas.offset.y;
					from = change.from;
					change.from.dirty = true;
				}
			}

			if (change.from.dirty) {
				if (change.from.x < 0) {
					canvas.offset.x = -change.from.x;
					change.from.x = 0;
				}
				else if (change.from.x > canvas.map.max.x) {
					canvas.offset.x = canvas.map.max.x - change.from.x;
					change.from.x = canvas.map.max.x;
				}
				else {
					canvas.offset.x = -change.from.x % tileSize;
					change.from.x = round.down(change.from.x, tileSize);
				}

				if (change.from.y < 0) {
					canvas.offset.y = -change.from.y;
					change.from.y = 0;
				}
				else if (change.from.y > canvas.map.max.y) {
					canvas.offset.y = canvas.map.max.y - change.from.y;
					change.from.y = canvas.map.max.y;
				}
				else {
					canvas.offset.y = -change.from.y % tileSize;
					change.from.y = round.down(change.from.y, tileSize);
				}
			}

			if (
				change.size.dirty &&
				((initial.size.x === 0) && (initial.size.y === 0)) &&
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
				if (change.from.dirty) {
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

				if (change.size.dirty) {
					// resizing horizontally
					before = initial.size.x; after = change.size.x;
					if (after > before) { // expanding width
						if (!right.render) {
							right.from = initial.from.x + initial.size.x;
							right.to = from.x + change.size.x;

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
					}
				}
			}

			if (change.from.dirty || change.size.dirty) {

				// resize
				if (change.size.dirty) {
					old_pre(canvas);

					canvas.width = change.size.x;
					canvas.height = change.size.y;

					old_post(canvas, initial);
				}

				// render areas
				if (
					(change.from.dirty || change.size.dirty) &&
					(left.render || right.render || up.render || down.render)
				) {
					old_pre(canvas);
					old_post(canvas, initial);

					context.save();

					//if (left.render) { console.log("left", left); }
					//if (right.render) { console.log("right", right); }
					//if (up.render) { console.log("up", up); }
					//if (down.render) { console.log("down", down); }

					// move context
					context.translate(-from.x, -from.y);

					context.fillStyle = "hsl(0,0%,50%)";

					if (left.render) {
						context.fillRect(left.from, from.y, left.to - left.from, size.y);
					}
					if (right.render) {
						context.fillRect(right.from, from.y, right.to - right.from, size.y);
					}

					// render new up/down content
					if (up.render || down.render) {
						horizon.left = left.render ? left.to : from.x;
						horizon.right = right.render ? right.from : from.x + size.x;
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
			}

			// reset areas
			left.render = false;
			right.render = false;
			up.render = false;
			down.render = false;

			// update initial
			if (change.from.dirty) {
				initial.from.x = change.from.x;
				initial.from.y = change.from.y;
				change.from.dirty = false;
			}
			if (change.size.dirty) {
				initial.size.x = change.size.x;
				initial.size.y = change.size.y;
				change.size.dirty = false;
			}

			return this;
		}

		function old_pre(canvas) {
			canvas.context.fillStyle = "white";
			canvas.context.fillRect(0, 0, canvas.width, canvas.height);
		}

		function old_post(canvas, initial) {
			// render pre-rendered content
			if (
				(initial.from.x < from.x + size.x) &&
				(initial.from.x + initial.size.x > from.x)
			) {
				context.save();
				{
					context.translate(
						(initial.from.x - from.x),
						(initial.from.y - from.y)
					);
					context.scale(initial.size.x, initial.size.y);

					context.fillStyle = "black";
					context.fillRect(0, 0, 1, 1);

					//canvas.context.lineWidth = 0.01;
					//canvas.context.strokeStyle = "white";

					//context.beginPath();
					//context.moveTo(0, 0);
					//context.lineTo(1, 1);
					//context.moveTo(1, 0);
					//context.lineTo(0, 1);
					//context.stroke();
				}
				context.restore();
			}
		}


		return render;
	})();

	return test;
})();

var AEL =
	window.addEventListener ? "addEventListener" :
	window.attachEvent ? "attachEvent" :
	"";

window[AEL]("load", function () {
	var initial = { size: { x: 480, y: 320} };

	var container = document.createElement("DIV");
	container.id = "container";

	var port = container.appendChild(document.createElement("DIV"));
	port.id = "port";
	port.size = { x: initial.size.x, y: initial.size.y };
	port.update = function (x, y) {
		port.style.width = port.size.x + "px";
		port.style.height = port.size.y + "px";
	}
	port.update();

	var resizeHandle = container.appendChild(document.createElement("SPAN"));
	resizeHandle.id = "resizeHandle";

	var view = test(initial.size.x, initial.size.y, 1500, 1500);
	port.appendChild(view.canvas);

	// controls
	(function () {
		var current = { x: 0, y: 0, drag: action };
		var action = { none: 0, move: 1, resize: 2 };

		var camera = {
			x: 0, y: 0,
			update: function () {
				view.moveTo(-this.x, -this.y);
			}
		};

		port[AEL](("ontouchstart" in document ? "touchstart" : "mousedown"), function (e) {
			current.x = e.pageX;
			current.y = e.pageY;
			current.drag = action.move;

			e.preventDefault();
			e.stopPropagation();
		});

		resizeHandle[AEL](("ontouchstart" in document ? "touchstart" : "mousedown"), function (e) {
			current.x = e.pageX;
			current.y = e.pageY;
			current.drag = action.resize;

			e.preventDefault();
		});

		window[AEL](("ontouchstart" in document ? "touchmove" : "mousemove"), function (e) {
			if (!current.drag) { return; }

			if (current.drag === action.move) {
				camera.x += e.pageX - current.x;
				camera.y += e.pageY - current.y;
				camera.update();
			}
			else if (current.drag === action.resize) {
				port.size.x += (e.pageX - current.x);
				port.size.y += (e.pageY - current.y);
				port.update();

				view.resize(port.size.x, port.size.y);
			}

			current.x = e.pageX;
			current.y = e.pageY;

			e.preventDefault();
		});

		window[AEL](("ontouchstart" in document ? "touchend" : "mouseup"), function (e) {
			current.drag = false;

			e.preventDefault();
		});
	})();

	document.body.appendChild(container);
});
