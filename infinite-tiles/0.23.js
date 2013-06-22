// data:text/html;ascii,<script src="http://localhost:45917/infinite-tiles/0.22.js"></script>

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
					if (size1.x > map.width) { size1.x = map.width; }
					if (size1.y > map.height) { size1.y = map.height; }

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

							if (from0.y > fromMax.y) {
								//console.log("y (" + from0.y + ") > max (" + fromMax.y + ")");
							}

							//if (from0.x >= fromMax.x) { from1.x = fromMax.x - offset.x; }
							//else { from1.x = from0.x - offset.x; }
							//if (from0.y >= fromMax.y) { from1.y = fromMax.y - offset.y; }
							//else { from1.y = from0.y - offset.y; }

							from1.x = from0.x - offset.x;
							from1.y = from0.y - offset.y;

							console.log("from changed to " + from1.y);
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

					fix = fixFrom(from1.y, fromMax.y, tileSize);
					from1.y = fix.value;
					console.log("from fixed to " + from1.y);
					offset.dirty.y = fix.offset;

					if (
						(offset.dirty.x == offset.x) &&
						(offset.dirty.y == offset.y)
					) {
						offset.dirty = null;
					}
					else {
						offset.x = offset.dirty.x;
						offset.y = offset.dirty.y;
						console.log("offset changed to " + offset.y);
					}

					if ((from1.x == from0.x) && (from1.y == from0.x)) {
						from1 = from0.dirty = null;
						from = from0;
					}
				}

				if (from1 || size1 || offset.dirty) {
					//console.log("from:", from, "size:", size, "offset:", offset);
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

			function fixSize(value, tileSize) {
				var r = value % tileSize;
				value = value + tileSize;
				if (r != 0) {
					value += tileSize - r;
				}

				return value;
			}

			var fixFrom = (function () {
				var result = { value: 0, offset: 0 },
					offset;

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

var Transformer = (function () {
	var global = this;
	
	var clean = [];

	function Transformer(force3d) {
		if (clean.length > 0) {
			var _ = clean.pop();
			Transformer.apply(_, arguments);
			return _;
		}
		else if (this === global) {
			return Transformer.apply({ constructor: Transformer }, arguments);
		}

		this.force3d = (force3d != null ? force3d : true);
		this.transform = "";
	}
	Transformer.prototype = {
		force3d: true,

		string: "",
		toString: function () {
			return this.transform;
		},

		translate: function (x, y, z) {
			this.string += "" +
				"translate" + (Transformer.has3d ? "3d" : "") +
				"(" +
					 x + "px," + y + "px" +
					(Transformer.has3d ?
						(
							z != null ? "px," + z :
							this.force3d ? ",0" :
							""
						) :
						""
					) +
				")" +
			"";

			return this;
		},

		apply: function (style) {
			style[Transformer.cssProperty] = this.string;
			return this;
		},
		reset: function () {
			this.string = "";
			return this;
		},
		destroy: function () {
			this.reset();
			clean.push(this);
		}
	};

	var style = document.createElement("test").style;
	Transformer.cssProperty = (
		(style["transform"] != null) ? "transform" :
		(style["-webkit-transform"] != null) ? "-webkit-transform" :
		(style["-moz-transform"] != null) ? "-moz-transform" :
		(style["-ms-transform"] != null) ? "-ms-transform" :
		(style["-o-transform"] != null) ? "-o-transform" :
		""
	);
	style = null;

	Transformer.has3d = (
		window.matchMedia &&
		window.matchMedia("(" + Transformer.cssProperty + "-3d)").matches
	);

	return Transformer;
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
	body {margin:0;}\
	\
	#container {position:relative; float:left;}\
	#container #port {overflow:hidden; border:2px solid hsl(0,0%,85%);}\
	#container #port canvas {box-shadow:0 0 5px hsl(0,0%,50%); background:hsl(0,0%,85%);}\
	#container #resize {\
		display:block; cursor:nwse-resize;\
		position:absolute; bottom:-20px; right:-20px;\
		width:20px; height:20px; background:hsl(0,0%,50%);\
	}\
";

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
			x: 480, y: 320,
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
		width: 300, height: 300
	});
	if (Transformer.has3d) {
		buffer.canvas.style[Transformer.cssProperty] = "translateZ(0)";
	}
	port.appendChild(buffer.canvas);
	port.view.size.update();

	buffer.resize(480, 320); buffer.moveTo(0, 51); buffer.render();
	//buffer.resize(buffer.map.height - (buffer.map.tiles.size * 2)); debugger; buffer.render();

	(function () { // controls
		var action = { none: 0, move: 1, resize: 2 };
		var state = {
			x: 0, y: 0,
			action: action.none
		};

		document.getElementById("resize")[eventTarget.add]("mousedown", function (e) {
			if (!e) { e = window.event; }

			state.x = e.pageX;
			state.y = e.pageY;

			state.action = action.resize;

			window[eventTarget.add]("mousemove", mousemove);

			e.preventDefault();
		});

		port[eventTarget.add]("mousedown", function (e) {
			if (!e) { e = window.event; }

			state.x = e.pageX;
			state.y = e.pageY;

			state.action = action.move;

			window[eventTarget.add]("mousemove", mousemove);

			e.preventDefault();
		});

		var mousemove = (function () {
			var x = y = 0;
			var view = port.view;

			return function mousemove(e) {
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
		})();

		window[eventTarget.add]("mouseup", function (e) {
			if (!state.action) { return; }
			if (!e) { e = window.event; }

			state.action = action.none;

			window[eventTarget.remove]("mousemove", mousemove);

			e.preventDefault();
		});
	})();


	var offset = buffer.view.offset,
		offsetTransform = new Transformer(true);

	//requestAnimationFrame(function raf() {
	//	buffer.render();

	//	if (offset.dirty) {
	//		offsetTransform
	//			.reset()
	//			.translate(offset.x, offset.y)
	//			.apply(buffer.canvas.style);

	//		offset.dirty = null;
	//	}

	//	requestAnimationFrame(raf);
	//});
});
