// data:text/html;ascii,<script src="http://localhost:45917/objects/versions/TileBuffer-0.22.js"></script>

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


document.head.appendChild(document.createElement("STYLE")).innerHTML = "\
	body {margin:5px; font-family:sans-serif; line-height:1.4;}\
	\
	.container {\
		float:left; padding:5px; margin:5px;\
		box-shadow:0 0 5px hsl(0,0%,50%);\
		text-align:center;\
	}\
	.container span {display:block;}\
	.container canvas {background:hsl(0,0%,85%); border:2px solid hsl(0,0%,85%);}\
	";

var AEL = (
	window.addEventListener ? "addEventListener" :
	window.attachEvent ? "attachEvent" :
	""
);

var map = {
	background: "white",
	tiles: {
		render: function (context, x, y) { },
		size: 50
	},
	width: 300, height: 300
};

function test(label, initial, change) {
	var buffer = new TileBuffer(map);
	buffer._showEfficiency = 10;

	var container = document.createElement("DIV");
	container.className = "container";
	var info = container.appendChild(document.createElement("SPAN"));
	info.innerHTML = label;

	container.appendChild(buffer.canvas);
	document.body.appendChild(container);

	buffer.resize(initial.size.x, initial.size.y);
	buffer.moveTo(initial.from.x, initial.from.y);
	buffer.render();

	for (var i = 2; i < arguments.length; i++) {
		var change = arguments[i];
		if (change.size) {
			buffer.resize(change.size.x, change.size.y);
		}
		if (change.from) {
			buffer.moveTo(change.from.x, change.from.y);
		}
		buffer.render();
	}

	var offset = buffer.view.offset;
	if (offset) {
		var from = change.from || initial.from;
		info.innerHTML += "<br/>(" + from.x + ", " + from.y + ") &gt; (" + offset.x + ", " + offset.y + ")";
	}

	return buffer;
}

window[AEL]("load", function () {
	test("Map too small",
		{ from: { x: -50, y: -50 }, size: { x: 400, y: 400} },
		{}
	);

	test("Covered Bottom",
		{ from: { x: 0, y: 0 }, size: { x: 0, y: 0} },
		{ from: { x: 0, y: 50 }, size: { x: 50, y: 50} }
	);
	test("Covered Right",
		{ from: { x: 0, y: 0 }, size: { x: 0, y: 0} },
		{ from: { x: 50, y: 0 }, size: { x: 50, y: 50} }
	);

	test("Zoom out",
		{ from: { x: 100, y: 100 }, size: { x: 0, y: 0} },
		{ from: { x: 50, y: 50 }, size: { x: 100, y: 100} }
	);
	test("Zoom in",
		{ from: { x: 50, y: 50 }, size: { x: 100, y: 100} },
		{ from: { x: 100, y: 100 }, size: { x: 0, y: 0} }
	);

	test("Top left",
		{ from: { x: 100, y: 100 }, size: { x: 0, y: 0} },
		{ from: { x: -55, y: -55} }
	);
	test("Bottom right",
		{ from: { x: 100, y: 100 }, size: { x: 0, y: 0} },
		{ from: { x: 305, y: 305} }
	);
});
