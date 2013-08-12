if (!window.TileBuffer) {
	window.TileBuffer = (function () {
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
}