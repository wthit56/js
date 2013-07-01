if (!window.TileBuffer) {
	window.TileBuffer = (function () {
		var dummy = document.createElement("CANVAS");
		if (!dummy.getContext || !dummy.getContext("2d")) {
			var r = new Boolean(false);
			r.message = "Browser does not support the Canvas Element's 2D context.";
			return r;
		}
		dummy = null;

		function TileBuffer(tileSize) {
			var canvas = this.canvas = document.createElement("CANVAS");
			canvas.width = canvas.height = 0;
			canvas.context = canvas.getContext("2d");
			canvas.sizeDirty = false;

			var alt = canvas.alt = document.createElement("CANVAS");
			alt.width = alt.height = 0;
			alt.context = alt.getContext("2d");
			alt.alt = canvas;
			alt.sizeDirty = false;

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

			this.singleBuffer = false;
			this.renderArea = null;
		}
		TileBuffer.prototype = {
			// size of a tile (square)
			tileSize: 1,

			// background colour to be used to clear the canvas
			background: null,

			// should a single buffer be used?
			//	if set to true, the same canvas instance will alwyas be up to date,
			//	requiring no swapping.
			// this would be somewhat slower,
			//	but could be easier if the DOM is being used to show the buffer
			singleBuffer: false,

			// draws to given context
			//	the area described by fromX, fromY, toX and toY
			renderArea: function (context, fromX, fromY, toX, toY) { },

			// holds the new and old view object data,
			//	as well as "dirty" object cache
			//	NOTE: not for public access and update
			view: null,

			// returns offset if dirty, otherwise returns undefined
			//	and cleans offset
			getChangedOffset: (function () {
				var offset;

				return function TileBuffer_getOffset() {
					offset = this.view.from.offset;
					if (offset.dirty) {
						offset.dirty = null;
						return offset;
					}
				};
			})(),

			// sets and dirties "from"
			//	to given x and y coordinates
			//	returns this, for chaining
			setFrom: (function () {
				var from, dirty;

				return function TileBuffer_setFrom(x, y) {
					from = this.view.from;
					dirty = from.dirty = this.view._dirty.from;
					dirty.x = x; dirty.y = y;

					return this;
				};
			})(),
			// sets and dirties size
			//	to given width and height
			//	returns this, for chaining
			setSize: (function () {
				var size, dirty;

				return function TileBuffer_setSize(width, height) {
					size = this.view.size;
					dirty = size.dirty = this.view._dirty.size;
					dirty.x = width; dirty.y = height;

					return this;
				};
			})(),

			// sets maximum (map) size
			//	to given width and height
			//	returns this, for chaining
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

			// renders buffer if necessary
			//	returns newly-rendered-to canvas if it is not the "current" canvas (this.canvas),
			//	otherwise returns undefined.
			// therefore, if not using the singleBuffer option, this.render() will only return when
			//	new canvas should be used instead of old one
			render: (function () {
				// shorthand variables for accessing properties of "this" TileBuffer
				var from, from0, from1;
				var offset0, offset1;
				var size, size0, size1, sizeMax;
				var tileSize;

				var canvas, alt, context;
				var background, renderArea;

				// temporary variables to hold calculations
				var left, right, top, bottom;
				var iLeft, iRight, iTop, iBottom;
				var fix, resize;

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

					// find offset object
					offset0 = from0.offset;

					// size is dirty...
					if (size1) {
						// ...so perform corrections

						// find max size object
						sizeMax = size0.max;

						// fix size to cover requested view by one whole tile
						size1.x = fixSize(size1.x, tileSize, sizeMax.x);
						size1.y = fixSize(size1.y, tileSize, sizeMax.y);

						// size still dirty...
						if ((size1.x != size0.x) || (size1.y != size0.y)) {
							// ...so perform corrections

							// from is not dirty...
							if (!from1) {
								// ...so make it dirty
								from = from1 = from0.dirty = this.view._dirty.from;

								// reset "from" value to original
								//	this will trigger recalculation of "from" later
								from1.x = from0.x - offset0.x;
								from1.y = from0.y - offset0.y;
							}

							// recalculate maximum "from" position
							fromMax.x = size0.max.x - size1.x;
							fromMax.y = size0.max.y - size1.y;
						}
						// size is no longer dirty...
						else {
							// ...so clean it
							size1 = size0.dirty = null;
							size = size0;
						}
					}

					// from is dirty...
					if (from1) {
						// ...so perform corrections

						// make offset dirty
						offset1 = offset0.dirty = this.view._dirty.offset;

						// fix "from" and offset x values
						fix = fixFrom(from1.x, tileSize, fromMax.x);
						from1.x = fix.value;
						offset1.x = fix.offset;
						// fix "from" and offset y values
						fix = fixFrom(from1.y, tileSize, fromMax.y);
						from1.y = fix.value;
						offset1.y = fix.offset;

						// offset is still dirty...
						if ((offset0.x != offset1.x) || (offset0.y != offset1.y)) {
							// ...so set current values
							offset0.x = offset1.x;
							offset0.y = offset1.y;
						}
						// offset is no longer dirty...
						else {
							// ...so clean it
							offset0.dirty = null;
						}

						// "from" is no longer dirty...
						if ((from1.x == from0.x) && (from1.y == from0.y)) {
							// ...so clean it
							from1 = from0.dirty = null;
							from = from0;
						}
					}

					// view is dirty...
					if (from1 || size1) {
						// ...so render new view

						// find canvasses
						canvas = this.canvas;
						alt = canvas.alt;
						context = alt.context;

						resized = false; // has the canvas been resized?

						// size is dirty...
						//	or size was dirty in a previous render
						//	but canvas was not resized...
						if (size1 || alt.sizeDirty) {
							// ...so change canvas' size

							// canvas width needs changing...
							if (alt.width != size.x) {
								// ...so change it
								alt.width = size.x;
								resized = true; // the canvas has been resized
							}
							// canvas height needs changing...
							if (alt.height != size.y) {
								// ...so change it
								alt.height = size.y;
								resized = true; // the canvas has been resized
							}

							alt.sizeDirty = false; // canvas size has been changed

							// size is dirty...
							if (size1) {
								// ...so "other" canvas size needs to be changed
								//	when it needs to be drawn to next
								canvas.sizeDirty = true;
							}
						}

						context.save();
						{
							background = this.background; // find the given background colour

							// background has been set...
							if (background != null) { // assignment
								// ...so fill the canvas with the given colour

								// fillStyle needs to change...
								if (context.fillStyle != background) {
									// ...so set to background
									context.fillStyle = background;
								}

								// fill canvas with colour
								context.fillRect(0, 0, size.x, size.y);
							}
							// background has not been set
							//	and canvas has not been resized...
							else if (!resized) {
								// ...so clear canvas
								context.clearRect(0, 0, size.x, size.y);
							}

							// offset drawing position to move it to coordinates (0, 0)
							context.translate(-from.x, -from.y);
							// this means that when drawing at "from" position
							//	the piexels will end up at the top-left of the canvas

							// find outer (new) rendering telemetry
							left = from.x; right = from.x + size.x;
							top = from.y; bottom = from.y + size.y;

							// find inner (old) rendering telemetry
							iLeft = Math.max(left, from0.x); // left <= iLeft
							iRight = Math.min(from0.x + size0.x, right); // iRight <= right
							iTop = Math.max(top, from0.y); // top <= iTop
							iBottom = Math.min(from0.y + size0.y, bottom); // iBottom <= bottom

							// find rendering function
							renderArea = this.renderArea;

							if (
							// old view has a visible size...
								((size0.x > 0) && (size0.y > 0)) &&
							// ...and is still visible in new view...
								(
									(iLeft < right) && (iTop < bottom) &&
									(iRight > left) && (iBottom > top)
								)
							) {
								// ...so render old view into new view
								context.drawImage(canvas, from0.x, from0.y);

								// left/right areas have height...
								if (top < bottom) {
									// ...so render left/right areas

									// left area has width...
									if (left < iLeft) {
										// ...so render left area
										renderArea(context, left, top, iLeft, bottom);
									}
									// right area has width...
									if (iRight < right) {
										// ...so render right area
										renderArea(context, iRight, top, right, bottom);
									}
								}
								// top/bottom areas have width...
								if (iLeft < iRight) {
									// ...so render top/bottom areas

									// top area has height...
									if (top < iTop) {
										// ...so render top area
										renderArea(context, iLeft, top, iRight, iTop);
									}
									// bottom area has height...
									if (iBottom < bottom) {
										// ...so render bottom area
										renderArea(context, iLeft, iBottom, iRight, bottom);
									}
								}
							}
							// old view is no longer visible...
							else {
								// ...so render entire new view
								renderArea(context, left, top, right, bottom);
							}
						}
						context.restore();

						// from was dirty...
						if (from1) {
							// ...so update new view with old values...
							from0.x = from1.x;
							from0.y = from1.y;
							// ...and clean
							from0.dirty = null;
						}
						// size was dirty...
						if (size1) {
							// ...so update new view with old values...
							size0.x = size1.x;
							size0.y = size1.y;
							// ...and clean
							size0.dirty = null;
						}

						// singleBuffer option on...
						if (this.singleBuffer) {
							// ...so copy new canvas contents to "other" canvas

							// "other" canvas needs resizing...
							if (canvas.sizeDirty) {
								// ...so resize

								// width needs changing...
								if (canvas.width != size.x) {
									// ...so change width to new size
									canvas.width = size.x;
								}
								// height needs changing...
								if (canvas.height != size.y) {
									// ...so change height to new size
									canvas.height = size.y;
								}

								// "other" canvas size no longer needs changing
								canvas.sizeDirty = false;
							}

							// draw new canvas contents to "other" canvas
							canvas.context.drawImage(alt, 0, 0);
						}
						// singleBuffer option off...
						else {
							// ...so swap canvas references...
							this.canvas = alt;
							// ...and return changed canvas
							return alt;
						}
					}
				}

				// returns new size value
				//	based on given value, tileSize, and maximum value
				var fixSize = (function () {
					var over;

					// returns a value that will include a round number of tileSize
					//	plus one whole extra tileSize
					return function fixSize(value, tileSize, max) {
						over = value % tileSize;
						value += tileSize;
						if (over) { value += tileSize - over; }
						if (value > max) { return max; }
						return value;
					};
				})();

				// returns "result" object that includes new "from" and offset values
				//	based on given value, tileSize and maximum value
				//	NOTE: result object will be reused,
				//		and so should not be stored and reused at a later time
				var fixFrom = (function () {
					var result = { value: null, offset: null },
						offset;

					// map starts at (0, 0)
					// maximum value = (map size) - (buffer size)

					return function (value, tileSize, max) {
						// value is off left/top edge
						if (value < 0) {
							offset = -value;
							value = 0;
						}
						// value would result in right edge
						//	being further than the map allows
						else if (value > max) {
							offset = max - value;
							value = max;
						}
						// value is safely within the map
						else {
							offset = -value % tileSize;
							value = value + offset;
						}

						// set result values...
						result.value = value;
						result.offset = offset;
						// ...and return
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