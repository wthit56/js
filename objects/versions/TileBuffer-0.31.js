// data:text/html;ascii,<script src="http://localhost:45917/test.js"></script>

var TileBuffer = (function () {
	var has2dContext = (function () {
		var dummy = document.createElement("CANVAS");
		return (dummy.getContext && dummy.getContext("2d"));
	})();

	function TileBuffer(map, config) {
		if (!has2dContext) {
			throw new Error("Browser does not support 2D Canvas Context.");
		}

		this.map = map;
		this.config = config || {};

		var canvas = this.canvas =
			document.createElement("CANVAS");
		canvas.context = canvas.getContext("2d");

		// create alt
		var alt = document.createElement("CANVAS");
		alt.context = alt.getContext("2d");
		canvas.alt = alt; alt.alt = canvas; // link canvas and alt together

		this.view = {
			_dirty: {
				from: { x: 0, y: 0 },
				size: { x: 0, y: 0 },
				offset: { x: 0, y: 0 }
			},

			from: {
				x: 0, y: 0,
				max: { x: map.width, y: map.height },
				dirty: null
			},
			size: {
				x: 0, y: 0,
				dirty: null
			},

			offset: {
				x: 0, y: 0,
				dirty: null
			}
		};
	}
	TileBuffer.prototype = {
		map: null,
		config: null,
		canvas: null,

		offset: null,
		view: null,

		resize: function (x, y) {
			var size = this.view.size.dirty = this.view._dirty.size;

			size.x = (x > 0) ? x : 0;
			size.y = (y > 0) ? y : 0;

			return this;
		},
		moveTo: function (x, y) {
			var from = this.view.from.dirty = this.view._dirty.from;

			from.x = x;
			from.y = y;

			return this;
		},

		render: (function () {
			var canvas, alt, context;
			var config;

			var map, tileSize, background;

			var view, offset;

			var from0, from1, from, fromMax;
			var size0, size1, size;

			var fix;

			var left, right, top, bottom;
			var iLeft, iRight, iTop, iBottom;

			function render(render) {
				canvas = this.canvas;
				alt = canvas.alt; context = alt.context;
				config = this.config;

				map = this.map;
				tileSize = map.tiles.size;

				view = this.view;
				offset = view.offset;

				from0 = view.from;
				from1 = from0.dirty;
				from = from1 || from0;
				fromMax = from0.max;

				size0 = view.size;
				size1 = size0.dirty;
				size = size1 || size0;

				// size is dirty
				if (size1) {
					// fix values
					size1.x = fixSize(size1.x, tileSize);
					size1.y = fixSize(size1.y, tileSize);

					// clip size to map size
					if (size1.x >= map.width) {
						size1.x = map.width;
					}
					if (size1.y >= map.height) {
						size1.y = map.height;
					}

					// size has not changed
					if (
						(size1.x == size0.x) &&
						(size1.y == size0.y)
					) {
						size1 = size0.dirty = null;
						size = size0;
					}
					// size has changed
					else {
						// from not changed
						if (!from1) {
							from1 = from0.dirty = from =
								this.view._dirty.from;
							from1.x = from0.x - offset.x;
							from1.y = from0.y - offset.y;
						}
						// re-calculate maximum x and y
						fromMax.x = map.width - size1.x;
						fromMax.y = map.height - size1.y;
					}
				}

				// from is dirty
				if (from1) {
					offset.dirty = view._dirty.offset;

					fix = fixFrom(from1.x, fromMax.x, tileSize);
					from1.x = fix.value;
					offset.dirty.x = fix.offset;

					fix = fixFrom(from1.y, fromMax.y, tileSize, offset.y, "y");
					from1.y = fix.value;
					offset.dirty.y = fix.offset;

					if (
						(offset.dirty.x != offset.x) ||
						(offset.dirty.y != offset.y)
					) {
						offset.x = offset.dirty.x;
						offset.y = offset.dirty.y;
					}
					else {
						offset.dirty = null;
					}

					if ((from1.x == from0.x) && (from1.y == from0.y)) {
						from1 = from0.dirty = null;
						from = from0;
					}
				}

				if (from1 || size1) {
					// Near RenderBoxes (left, top) return false when they would cover the entire buffer.
					//   This would therefore stop execution of subsequent RenderBox calculations.
					// Far RenderBoxes (right, bottom) always return true, and therefore never
					//   never stop execution.
					//(
					//	left.calculate(from0.x, from.x, size.x) ||
					//	top.calculate(from0.y, from.y, size.y) ||
					//	bottom.calculate(from0.y, from.y, size0.y, size.y) ||
					//	right.calculate(from0.x, from.x, size0.x, size.x)
					//);

					if (size1) {
						alt.width = size1.x;
						alt.height = size1.y;
					}

					// render
					context.save();
					{
						context.translate(-from.x, -from.y);

						// clear
						background = this.map.background;
						if (background) {
							context.fillStyle = background;
							context.fillRect(from.x, from.y, size.x, size.y);
						}
						else if (!size1) {
							context.clearRect(from.x, from.y, size.x, size.y);
						}

						if (
							((canvas.width > 0) && (canvas.height > 0)) &&
							((from0.x + size0.x > from.x) && (from0.x < from.x + size.x)) &&
							((from0.y + size0.y > from.y) && (from0.y < from.y + size.y))
						) {
							// draw pre-rendered
							context.drawImage(canvas, from0.x, from0.y);
						}

						if (render !== false) {
							left = from.x;
							right = from.x + size.x;
							top = from.y;
							bottom = from.y + size.y;

							iLeft = Math.max(left, from0.x);
							iRight = Math.min(right, from0.x + size0.x);
							iTop = Math.max(top, from0.y);
							iBottom = Math.min(bottom, from0.y + size0.y);

							renderArea(this, left, iLeft, top, bottom);
							renderArea(this, iRight, right, top, bottom);
							renderArea(this, iLeft, iRight, top, iTop);
							renderArea(this, iLeft, iRight, iBottom, bottom);
						}
					}
					context.restore();

					if (size1) {
						canvas.width = alt.width;
						canvas.height = alt.height;
					}

					if (config.asDOM) {
						canvas.context.drawImage(alt, 0, 0);
					}
					else {
						this.canvas = alt;
					}

					// reset values
					if (from1) {
						from0.x = from1.x;
						from0.y = from1.y;
						from0.dirty = null;
					}
					if (size1) {
						size0.x = size1.x;
						size0.y = size1.y;
						size0.dirty = null;
					}
				}
			}

			var fixSize = (function () {
				var r;

				return function fixSize(value, tileSize) {
					r = value % tileSize;
					value = value + tileSize;
					if (r != 0) {
						value += tileSize - r;
					}

					return value;
				};
			})();

			var fixFrom = (function () {
				var result = { value: 0, offset: 0 },
					offset = 0;

				return function fixFrom(value, max, tileSize) {
					if (value < 0) {
						offset = -value;
						value = 0;
					}
					else if (value > max) {
						offset = max - value;
						value = max;
					}
					else {
						offset = -value % tileSize;
						value = value + offset;
					}

					result.value = value;
					result.offset = offset;

					return result;
				};
			})();

			function renderArea(buffer, x, x1, y, y1) {
				var initialX = x;
				var context = buffer.canvas.alt.context;
				var tileSize = buffer.map.tiles.size;

				while (y < y1) {
					x = initialX;
					while (x < x1) {
						map.tiles.render(context, x, y);
						x += tileSize;
					}

					y += tileSize;
				}
			}

			return render;
		})()
	};

	return TileBuffer;
})();

function importScript(src, type) {
	var script = document.createElement("SCRIPT");
	script.src = src;
	script.type = type || "text/javascript";
	document.head.appendChild(script);
}

var position = (function () {
	var style = document.createElement("_").style;
	var transform = (
			(style["transform"] != null) ? "transform" :
			(style["-webkit-transform"] != null) ? "-webkit-transform" :
			(style["-moz-transform"] != null) ? "-moz-transform" :
			(style["-ms-transform"] != null) ? "-ms-transform" :
			(style["-o-transform"] != null) ? "-o-transform" :
			""
	);
	style = null;

	if (transform) {
		var has3d = (
			window.matchMedia &&
			window.matchMedia("(" + transform + "-3d)").matches
		);

		var template = "translate" + (has3d ? "3d" : "") + "({x}px,{y}px" + (has3d ? ",0" : "") + ")";
		return function position(style, x, y) {
			style[transform] = template.replace("{x}", x).replace("{y}", y);
		};
	}
	else {
		return function (style, x, y) {
			style.marginLeft = x + "px";
			style.marginTop = y + "px";
		}
	}
})();

var eventTarget = {
	add: (
		window.addEventListener ? "addEventListener" :
		window.attachEvent ? "attachEvent" :
		""
	),
	remove: (
		window.removeEventListener ? "removeEventListener" :
		window.detachEvent ? "detachEvent" :
		""
	)
};

document.head.appendChild(document.createElement("STYLE")).innerHTML = "\
	html{\
		-webkit-text-size-adjust:100%;\
		-ms-text-size-adjust:100%;\
	}\
	body {margin:0;}\
	\
	#container {position:relative; float:left;}\
	#container #port {overflow:hidden; border:2px solid hsl(0,0%,85%);}\
	#container #port canvas {box-shadow:0 0 5px hsl(0,0%,50%); background:hsl(0,0%,85%);}\
	#container #resize {\
		display:block; cursor:nwse-resize;\
		position:absolute; bottom:0px; right:0px;\
		width:20px; height:20px; background:hsl(0,0%,50%);\
	}\
";

(function () {
	var meta = document.head.appendChild(document.createElement("META"));
	meta.name = "viewport";
	meta.content = "width=device-width, initial-scale=1, maximum-scale=1";
})();

var dummy = document.createElement("_");
dummy.innerHTML='\
	<div id="container">\
		<div id="port"></div>\
		<span id="resize"></span>\
	</div>\
';

var port = (function () {
	var port = dummy.querySelector("#port");
	port.view = {
		camera: {
			x: 0, y: 0,
			update: function () {
				buffer.moveTo(this.x, this.y);
			}
		},
		size: {
			x: window.innerWidth - 50, y: window.innerHeight - 50,
			update: function () {
				buffer.resize(this.x, this.y);

				port.style.width = this.x + "px";
				port.style.height = this.y + "px";
			}
		}
	};

	return port;
})();

var tileSize=50;
var mapX = port.view.size.x * 3; mapX = mapX - (mapX % tileSize);
var mapY = port.view.size.y * 3; mapY = mapY - (mapY % tileSize);
var buffer = window.buffer = new TileBuffer(
	{
		background: "white",
		tiles: {
			render: (function () {
				var cache = {},
					key = "";

				return function (context, x, y) {
					key = x + "," + y;
					if (cache[key] == null) {
						cache[key] = ((Math.random() * 2) | 0);
					}

					if (cache[key]) {
						if (context.fillStyle != "hsl(0,0%,50%)") {
							context.fillStyle = "hsl(0,0%,50%)";
						}
						context.fillRect(x, y, this.size, this.size);
					}
				};
			})(),
			size: tileSize
		},
		width: mapX, height: mapY
	},
	{ asDOM: true }
);
position(buffer.canvas.style, 0, 0);
port.appendChild(buffer.canvas);
port.view.size.update();

var controls = (function () { // controls
	var action = { none: 0, move: 1, resize: 2 };
	var state = {
		_dirty: { x: 0, y: 0 },
		x: 0, y: 0,
		dirty: null,
		action: action.none
	};

	var resize = dummy.querySelector("#resize");
	var hasTouch = ("ontouchstart" in document);
	var view = port.view;

	function start_move(e) {
		if (!e) { e = window.event; }

		state.x = e.pageX;
		state.y = e.pageY;

		state.action = action.move;

		//drag.add(e);

		e.preventDefault();
	}

	function start_resize(e) {
		if (!e) { e = window.event; }

		state.x = e.pageX;
		state.y = e.pageY;

		state.action = action.resize;

		//drag.add(e);

		e.preventDefault();
	}

	var drag = (function () {
		var Handler = (function () {
			function Handler() {
				this.input = null;

				this.origin = { x: 0, y: 0, change: null };
				this.position = { x: 0, y: 0, change: null };
			}
			Handler.prototype = {
				input: null,
				origin: null, position: null,

				start: function (e) {
					if (e.type === "touchstart") {
						this.input = e.changedTouches[0].identifier;
					}
					else {
						this.input = true;
					}

					//this.input = (e.type === "touchstart") ? e.changedTouches[0].id : -1;
				},
				move: function (e) {
				},
				end: function (e) {
				}
			};

			return Handler;
		})();



		var x = y = 0;
		var view = port.view;
		var dirty;
		var e;

		function drag() {
			if (!e) { e = window.event; }

			dirty = state.dirty = state._dirty;
			dirty.x = e.pageX; dirty.y = e.pageY;

			e.preventDefault();
			timer = null;
		}

		var timer;
		function time(event) {
			if (!state.action) { return; }
			e = event || window.event;
			if (timer == null) {
				timer = requestAnimationFrame(drag);
			}
			e.preventDefault();
		}

		return time;
	})();

	function end(e) {
		if (!state.action) { return; }
		if (!e) { e = window.event; }

		update();
		state.action = action.none;

		//drag.remove(e);

		e.preventDefault();
	}

	var update = (function () {
		var dirty, x, y;
		return function update() {
			dirty = state.dirty;
			if (!state.dirty || !state.action) { return; }

			x = dirty.x; y = dirty.y;
			switch (state.action) {
				case action.resize:
					view.size.x += x - state.x;
					view.size.y += y - state.y;
					view.size.dirty = true;
					break;
				case action.move:
					view.camera.x -= (x - state.x);
					view.camera.y -= (y - state.y);
					view.camera.dirty = true;
					break;
			}

			state.x = x; state.y = y;
			state.dirty = null;
		};
	})();

	resize[eventTarget.add]("mousedown", start_resize);
	port[eventTarget.add]("mousedown", start_move);
	window[eventTarget.add]("mousemove", drag);
	window[eventTarget.add]("mouseup", end);
	if (hasTouch) {
		resize[eventTarget.add]("touchstart", start_resize);
		port[eventTarget.add]("touchstart", start_move);
		window[eventTarget.add]("touchmove", drag);
		window[eventTarget.add]("touchend", end);
	}

	return {
		update: update
	};
})();

importScript("http://192.168.0.9:45917/shims/raf-caf.js");

window[eventTarget.add]("load", function () {
	while (dummy.childNodes.length) {
		document.body.appendChild(dummy.childNodes[0]);
	}
	dummy = null;

	var offset = buffer.view.offset;
	requestAnimationFrame(function raf() {
		controls.update();
		port.view.camera.update();
		port.view.size.update();
		buffer.render();

		if (offset.dirty) {
			position(buffer.canvas.style, offset.x, offset.y);
			offset.dirty = null;
		}

		requestAnimationFrame(raf);
	});
});
