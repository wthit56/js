if (!window.TileBuffer) {
	window.TileBuffer = (function () {
		var dummy = document.createElement("CANVAS");
		if (!dummy.getContext || !dummy.getContext("2d")) {
			var r = new Boolean(false);
			r.message = "Browser does not support the Canvas Element's 2D context.";
			return r;
		}
		dummy = null;

		function TileBuffer(tileSize, background) {
			var canvas = this.canvas = document.createElement("CANVAS");
			canvas.width = canvas.height = 0;
			canvas.context = canvas.getContext("2d");
			canvas.dirtySize = false;

			var alt = canvas.alt = document.createElement("CANVAS");
			alt.width = alt.height = 0;
			alt.context = alt.getContext("2d");
			alt.alt = canvas;
			alt.dirtySize = false;

			canvas.dirty = false;

			this.view = {
				_dirty: {
					from: { x: 0, y: 0 },
					offset: { x: 0, y: 0 },
					size: { x: 0, y: 0 }
				},
				from: {
					x: 0, y: 0,
					max: { x: 0, y: 0, dirty: false },
					offset: { x: 0, y: 0, dirty: null },
					dirty: null
				},
				size: {
					x: 0, y: 0,
					max: { x: 0, y: 0, dirty: false },
					dirty: null
				}
			};

			this.tileSize = Math.max(0, tileSize);
			this.background = background;

			this.singleBuffer = false;
			this.renderArea = null;
		}
		TileBuffer.prototype = {
			tileSize: 1, background: null,
			singleBuffer: false,
			renderArea: null,

			view: null,

			getOffset: (function () {
				var offset;
				return function TileBuffer_getOffset() {
					offset = this.view.from.offset;
					if (offset.dirty) {
						offset.dirty = null;
						return offset;
					}
				};
			})(),

			setFrom: (function () {
				var from, dirty;
				return function TileBuffer_setFrom(x, y) {
					from = this.view.from;
					dirty = from.dirty = this.view._dirty.from;
					dirty.x = x; dirty.y = y;

					return this;
				};
			})(),
			setSize: (function () {
				var size, dirty;
				return function TileBuffer_setSize(x, y) {
					size = this.view.size;
					dirty = size.dirty = this.view._dirty.size;
					dirty.x = x; dirty.y = y;

					return this;
				};
			})(),

			setMaxSize: (function () {
				var sMax;
				return function TileBuffer_setMaxSize(width, height) {
					sMax = this.view.size.max;
					if ((sMax.x != width) || (sMax.y != height)) {
						sMax.dirty = true;
						sMax.x = width; sMax.y = height;
						recalcMaxFrom.call(this);
					}

					return this;
				};
			})(),

			render: (function () {
				var from, from0, from1;
				var offset0, offset1;
				var size, size0, size1, sizeMax;
				var tileSize;

				var canvas, alt, context;
				var background;

				var left, right, top, bottom;
				var iLeft, iRight, iTop, iBottom;
				var renderArea;

				var fix;

				function TileBuffer_render() {
					// find tileSize
					tileSize = this.tileSize;
					// tileSize should be a minimum of 1
					if (this.tileSize < 1) {
						tileSize = this.tileSize = 1;
					}

					// find size objects
					size0 = this.view.size;
					size1 = size0.dirty;
					size = size1 || size0;

					// find from objects
					from0 = this.view.from;
					from1 = from0.dirty;
					from = from1 || from0;
					fromMax = from0.max;
					offset0 = from0.offset;

					// size is dirty...
					if (size1) {
						// ...so perform initial corrections

						// fix size to cover requested view
						sizeMax = size0.max;
						size1.x = fixSize(size1.x, tileSize, sizeMax.x);
						size1.y = fixSize(size1.y, tileSize, sizeMax.y);

						// size still dirty
						if ((size1.x != size0.x) || (size1.y != size0.y)) {
							// from not dirty...
							if (!from1) {
								// ...so make dirty
								from = from1 = from0.dirty = this.view._dirty.from;

								// reset value
								from1.x = from0.x - offset0.x;
								from1.x = from0.y - offset0.y;
							}

							// recalculate max
							fromMax.x = size0.max.x - size1.x;
							fromMax.y = size0.max.y - size1.y;
						}
						// size no longer dirty...
						else {
							// ...so clean it
							size1 = size0.dirty = null;
							size = size0;
						}
					}

					// from is dirty...
					if (from1) {
						// ...so perform initial corrections

						// make offset dirty
						offset1 = offset0.dirty = this.view._dirty.offset;

						// fix values
						fix = fixFrom(from1.x, tileSize, fromMax.x);
						from1.x = fix.value;
						offset1.x = fix.offset;

						fix = fixFrom(from1.y, tileSize, fromMax.y);
						from1.y = fix.value;
						offset1.y = fix.offset;

						fix = false;

						if ((offset0.x != offset1.x) || (offset0.y != offset1.y)) {
							offset0.x = offset1.x;
							offset0.y = offset1.y;
						}
						else {
							offset0.dirty = null;
						}

						if ((from1.x == from0.x) && (from1.y == from0.y)) {
							from1 = from0.dirty = null;
							from = from0;
						}
					}

					// view is dirty
					if (from1 || size1) {
						// find canvasses
						canvas = this.canvas;
						alt = canvas.alt;
						context = alt.context;

						var resized = false;

						if (size1 || alt.dirtySize) {
							if (alt.width != size.x) {
								alt.width = size.x;
								resized = true;
							}
							if (alt.height != size.y) {
								alt.height = size.y;
								resized = true;
							}

							alt.dirtySize = false;

							if (size1) { canvas.dirtySize = true; }
						}

						context.save();
						{
							// clear
							background = this.background;
							if (background != null) {
								if (context.fillStyle != background) {
									context.fillStyle = background;
								}
								context.fillRect(0, 0, size.x, size.y);
							}
							else if (!resized) {
								context.clearRect(0, 0, size.x, size.y);
							}

							// translate to new drawing position
							context.translate(-from.x, -from.y);

							// find rendering telemetry
							//	- outer
							left = from.x; right = from.x + size.x;
							top = from.y; bottom = from.y + size.y;
							//	- inner
							iLeft = Math.min(from.x, Math.max(left, from0.x));
							iRight = Math.max(from.x, Math.min(right, from0.x + size0.x));
							iTop = Math.min(from.y, Math.max(top, from0.y));
							iBottom = Math.max(from.y, Math.min(bottom, from0.y + size0.y));

							iLeft = Math.max(left, from0.x);
							iRight = Math.min(right, from0.x + size0.x);
							iTop = Math.max(top, from0.y);
							iBottom = Math.min(bottom, from0.y + size0.y);

							// find rendering function
							renderArea = this.renderArea;

							// old view still visible in new view...
							if (
								((size0.x > 0) && (size0.y > 0)) &&
								(
									(iLeft < right) && (iTop < bottom) &&
									(iRight > left) && (iBottom > top)
								)
							) {
								// ...so render old view into new view
								context.drawImage(canvas, from0.x, from0.y);

								// render strips
								if (top < bottom) {
									if (left < iLeft) { // left
										renderArea(context, left, top, iLeft, bottom);
									}
									if (iRight < right) { // right
										renderArea(context, iRight, top, right, bottom);
									}
								}
								if (iLeft < iRight) {
									if (top < iTop) { // top
										renderArea(context, iLeft, top, iRight, iTop);
									}
									if (iBottom < bottom) { // bottom
										renderArea(context, iLeft, iBottom, iRight, bottom);
									}
								}
							}
							// old view no longer visible...
							else {
								// ...so render completely new view
								renderArea(context, left, top, right, bottom);
							}
						}
						context.restore();

						// set view to new view
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

						if (this.singleBuffer) {
							if (canvas.dirtySize) {
								if (canvas.width != size.x) { canvas.width = size.x; }
								if (canvas.height != size.y) { canvas.height = size.y; }
							}

							canvas.context.drawImage(alt, 0, 0);
						}
						else {
							this.canvas = alt;
							return alt;
						}
					}
				}

				var fixSize = (function () {
					var over;
					return function fixSize(value, tileSize, max) {
						over = value % tileSize;
						value += tileSize;
						if (over) { value += tileSize - over; }
						if (value > max) { return max; }
						return value;
					};
				})();
				var fixFrom = (function () {
					var result = { value: null, offset: null },
						offset;
					return function (value, tileSize, max) {
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

				return TileBuffer_render;
			})()
		};

		var recalcMaxFrom = (function () {
			var fMax, size, sMax,
				x, y;
			return function recalcMaxFrom() {
				fMax = this.view.from.max;
				size = this.view.size;
				sMax = size.max;
				x = sMax - size.x;
				y = sMax - size.y;

				if ((fMax.x != x) || (fMax.y != y)) {
					fMax.dirty = true;
					fMax.x = x; fMax.y = y;
				}
			};
		})();

		return TileBuffer;
	})();
}