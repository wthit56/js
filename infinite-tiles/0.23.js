// data:text/html;ascii,<script src="http://localhost:45917/infinite-tiles/0.23.js"></script>

var TileBuffer = (function () {
	(function () {
		var dummy = document.createElement("CANVAS");
		if (!dummy.getContext || !dummy.getContext("2d")) {
			throw new Error("The browser does not support the 2D Canvas context.");
		}
	})();

	function TileBuffer(map) {
		this.map = map;

		var canvas = this.canvas = document.createElement("CANVAS");
		var context = canvas.context = canvas.getContext("2d");

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
		_showEfficiency: 0,

		map: null,
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
			var canvas, context;

			var map, tileSize, background;

			var view, offset;

			var from0, from1, from, fromMax;
			var size0, size1, size;

			var fix;

			var RenderBox = (function () {
				function factory(calculate) {
					var renderbox = function () {
						this.from = 0; this.to = 0; this.size = 0;
						this.toRender = false;
					};
					renderbox.prototype.calculate = calculate;

					return renderbox;
				};

				var from, to, size;
				return {
					// for left and top
					Near: factory(function (fromBefore, fromAfter, sizeAfter) {
						this.toRender = false;

						if (fromAfter < fromBefore) {
							from = this.from = fromAfter;
							to = this.to = Math.min(fromAfter + sizeAfter, fromBefore);
							size = this.size = to - from;
							this.toRender = true;

							if (size >= sizeAfter) {
								return true;
							}
						}
					}),
					// for right and bottom
					Far: factory(function (fromBefore, fromAfter, sizeBefore, sizeAfter) {
						this.toRender = false;

						from = this.from = Math.max(fromAfter, fromBefore + sizeBefore); // old far-edge
						to = this.to = (fromAfter + sizeAfter); // new far-edge
						size = this.size = to - from;

						if (to > from) {
							this.toRender = true;

							if (size >= sizeAfter) {
								return true;
							}
						}
					})
				};
			})();

			var left = new RenderBox.Near(),
				right = new RenderBox.Far(),
				top = new RenderBox.Near(),
				bottom = new RenderBox.Far();
			var horizon = { left: 0, right: 0, width: 0 };

			function render() {
				canvas = this.canvas;
				context = this.canvas.context;

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
					(
						left.calculate(from0.x, from.x, size.x) ||
						top.calculate(from0.y, from.y, size.y) ||
						bottom.calculate(from0.y, from.y, size0.y, size.y) ||
						right.calculate(from0.x, from.x, size0.x, size.x)
					);

					if (size1) {
						canvas.width = size1.x + (this._showEfficiency * 2);
						canvas.height = size1.y + (this._showEfficiency * 2);
					}

					// render
					context.save();
					{
						context.translate(-from.x + this._showEfficiency, -from.y + this._showEfficiency);

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
							((from0.x + size0.x > from.x) && (from0.x < from.x + size.x)) &&
							((from0.y + size0.y > from.y) && (from0.y < from.y + size.y))
						) {
							// draw pre-rendered
							context.fillStyle = "black";
							context.fillRect(from0.x, from0.y, size0.x, size0.y);
						}

						// render new tiles
						if (left.toRender) {
							context.fillStyle = "rgba(255,255,0,0.2)";
							context.fillRect(left.from, from.y, left.size, size.y);
						}
						if (right.toRender) {
							context.fillStyle = "rgba(0,255,0,0.2)";
							context.fillRect(right.from, from.y, right.size, size.y);
						}

						if (top.toRender || bottom.toRender) {
							horizon.left = left.toRender ? left.to : from.x;
							horizon.right = right.toRender ? right.from : from.x + size.x;
							horizon.width = horizon.right - horizon.left;

							if (top.toRender) {
								context.fillStyle = "rgba(255,0,0,0.2)";
								context.fillRect(horizon.left, top.from, horizon.width, top.size);
							}
							if (bottom.toRender) {
								context.fillStyle = "rgba(0,0,255,0.2)";
								context.fillRect(horizon.left, bottom.from, horizon.width, bottom.size);
							}
						}
					}
					context.restore();

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

			return render;
		})()
	};

	TileBuffer.resize = function (x, y) { };

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

importScript("http://192.168.0.9:45917/shims/raf-caf.js");

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
	//setTimeout(function(){alert(window.innerWidth+" "+window.innerHeight);},1000);
})();

window[eventTarget.add]("load", function () {
	document.body.innerHTML = '\
		<div id="container">\
			<div id="port"></div>\
			<span id="resize"></span>\
		</div>\
	';

	var port = document.getElementById("port");
	port.view = {
		camera: {
			x: 0, y: 0,
			update: function () {
				buffer.moveTo(this.x, this.y);
			}
		},
		size: {
			x: window.innerWidth-20, y: window.innerHeight-20,
			update: function () {
				buffer.resize(this.x, this.y);

				port.style.width = this.x + "px";
				port.style.height = this.y + "px";
			}
		}
	};

	var buffer = window.buffer = new TileBuffer({
		background: "white",
		tiles: {
			render: function (context, x, y) { },
			size: 50
		},
		width: port.view.size.x*3, height: port.view.size.y*3
	});
	position(buffer.canvas.style, 0, 0);
	port.appendChild(buffer.canvas);
	port.view.size.update();

	(function () { // controls
		var action = { none: 0, move: 1, resize: 2 };
		var state = {
			x: 0, y: 0,
			action: action.none
		};

		var resize = document.getElementById("resize");
		var hasTouch = ("ontouchstart" in document);

		function start_move(e) {
			if (!e) { e = window.event; }

			state.x = e.pageX;
			state.y = e.pageY;

			state.action = action.move;

			drag.add(e);

			e.preventDefault();
		}

		function start_resize(e) {
			if (!e) { e = window.event; }

			state.x = e.pageX;
			state.y = e.pageY;

			state.action = action.resize;

			drag.add(e);

			e.preventDefault();
		}

		var drag = (function () {
			var x = y = 0;
			var view = port.view;

			function drag(e) {
				if (!state.action) { return; }
				if (!e) { e = window.event; }

				x = e.pageX; y = e.pageY;
				switch (state.action) {
					case action.resize:
						view.size.x += x - state.x;
						view.size.y += y - state.y;
						view.size.update();
						break;
					case action.move:
						view.camera.x -= (x - state.x);
						view.camera.y -= (y - state.y);
						view.camera.update();
						break;
				}

				state.x = x; state.y = y;

				e.preventDefault();
			}

			drag.add = function (e) {
				if (hasTouch && (e.type === "touchstart")) {
					window[eventTarget.add]("touchmove", drag);
					window[eventTarget.add]("touchend", end);
				}
				else if (e.type === "mousedown") {
					window[eventTarget.add]("mousemove", drag);
					window[eventTarget.add]("mouseup", end);
				}
			};
			drag.remove = function (e) {
				if (hasTouch && (e.type === "touchend")) {
					window[eventTarget.remove]("touchmove", drag);
					window[eventTarget.remove]("touchend", end);
				}
				else if (e.type === "mouseup") {
					window[eventTarget.remove]("mousemove", drag);
					window[eventTarget.remove]("mouseup", end);
				}
			};

			return drag;
		})();

		function end(e) {
			if (!state.action) { return; }
			if (!e) { e = window.event; }

			state.action = action.none;

			drag.remove(e);

			e.preventDefault();
		}

		resize[eventTarget.add]("mousedown", start_resize);
		port[eventTarget.add]("mousedown", start_move);
		if (hasTouch) {
			resize[eventTarget.add]("touchstart", start_resize);
			port[eventTarget.add]("touchstart", start_move);
		}
	})();


	var offset = buffer.view.offset;
	requestAnimationFrame(function raf() {
		buffer.render();

		if (offset.dirty) {
			position(buffer.canvas.style, offset.x, offset.y);
			offset.dirty = null;
		}

		requestAnimationFrame(raf);
	});
});
