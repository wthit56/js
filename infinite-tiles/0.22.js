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

		this.offset = { x: 0, y: 0, dirty: false };

		this.view = {
			_dirty: {
				from: { x: 0, y: 0 },
				size: { x: 0, y: 0 }
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

			offset: { x: 0, y: 0 }
		};
	}
	TileBuffer.prototype = {
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
			function render() {
				var canvas = this.canvas;
				var context = this.canvas.context;

				var map = this.map;
				var tileSize = map.tiles.size;

				var view = this.view;

				var from0 = view.from,
					from1 = from0.dirty,
					from = from1 || from0,
					fromMax = from0.max;

				var size0 = view.size,
					size1 = size0.dirty,
					size = size1 || size0;

				var offset = view.offset;

				// size is dirty
				if (size1) {
					// fix values
					size1.x = fixSize(size1.x);
					size1.y = fixSize(size1.y);

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
						// re-calculate maximum x and y
						fromMax.x = map.width - size1.x;
						fromMax.y = map.height - size1.y;

						// from not changed
						if (!from1) {
							from1 = from0.dirty = from =
								this.view._dirty.from;
							from1.x = from0.x - offset.x;
							from1.y = from0.y - offset.y;
						}
					}
				}

				// from is dirty
				if (from1) {
					var fix;

					fix = fixFrom(from1.x, fromMax.x, tileSize);
					from1.x = fix.value;
					offset.x = fix.offset;

					fix = fixFrom(from1.y, fromMax.y, tileSize);
					from1.y = fix.value;
					offset.y = fix.offset;

					if ((from1.x == from0.x) && (from1.y == from0.x)) {
						from1 = from0.dirty = null;
						from = from0;
					}
				}

				if (
					size1 &&
					(
						(from0.x > from.x + size.x) ||
						(from0.x + size0.x < from.x)
					) &&
					(
						(from0.y > from.y + size.y) ||
						(from0.y + size0.y < from.y)
					)
				) {
					//fo > fi + si;
					//fo - fi - si > 0;

					//fo + so < fi;
					//fo + so - fi < 0;
					//(fo + so - fi) * -1 > 0;
					//(-fo - so + fi) > 0;
					//fi - fo - so > 0;
				}

				// clear
				var background = this.map.background;
				if (background) {
					context.fillStyle = background;
					context.fillRect(0, 0, canvas.width, canvas.height);
				}
				else {
					context.clearRect(0, 0, canvas.width, canvas.height);
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

			function fixSize(value, tileSize) {
				var r = value % tileSize;
				value = value + tileSize;
				if (r != 0) {
					value += tileSize - r;
				}

				return value;
			}

			var fixFrom = (function () {
				var result = { value: 0, offset: 0 };

				return function fixFrom(value, max, tileSize) {
					var offset = 0;

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

new TileBuffer({
	background: "white",
	tiles: {
		render: function (context, x, y) { },
		size: 50
	},
	width: 1000, height: 1000
});
