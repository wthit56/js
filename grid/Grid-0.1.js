var Grid = (function () {
	function Grid() {
		var canvas = this.canvas = document.createElement("CANVAS");
		canvas.width = canvas.height = 0;
		canvas.context = canvas.getContext("2d");

		this.view = {
			scale: { x: 1, y: 1 },
			axis: { x: 0, y: 0 },
			dirty: false
		};
		this.size = { x: 0, y: 0, dirty: false };

		this.rendering = [];
	}
	Grid.prototype = {
		view: null, size: null,

		rendering: null,

		setSize: (function () {
			var size;

			return function (width, height) {
				size = this.size;
				if ((size.x != width) || (size.y != height)) {
					size.x = width;
					size.y = height;
					size.dirty = true;
				}

				return this;
			};
		})(),

		setScale: (function () {
			var view, scale;

			return function (x, y) {
				view = this.view;
				scale = view.scale;
				if ((scale.x != x) || (scale.y != y)) {
					scale.x = x;
					scale.y = y;
					view.dirty = true;
				}

				return this;
			};
		})(),
		setAxis: (function () {
			var view, axis;

			return function (x, y) {
				view = this.view;
				axis = view.axis;
				if ((axis.x != x) || (axis.y != y)) {
					axis.x = x;
					axis.y = y;
					view.dirty = true;
				}

				return this;
			};
		})(),

		render: (function () {
			var canvas, context;
			var view, scale, axis;
			var size;
			var rendering,
				i, c, l,
				x, xl, y, yl,
				unitX, unitY;

			var left, right, top, bottom;

			return function () {
				view = this.view;
				size = this.size;

				if (view.dirty || size.dirty) {
					canvas = this.canvas;

					canvas.width = size.x;
					if (canvas.height != size.y) {
						canvas.height = size.y;
					}
					size.dirty = false;

					context = canvas.context;

					scale = view.scale;
					axis = view.axis;

					context.save();
					{
						context.translate(axis.x, axis.y);

						left = -axis.x;
						right = left + size.x;
						top = -axis.y;
						bottom = top + size.y;

						rendering = this.rendering;
						i = 0, l = rendering.length;
						while (i < l) {
							c = rendering[i];

							context.lineWidth = ((c.width > 0.5) ? c.width - 0.5 : c.width);
							if (context.strokeStyle != c.colour) {
								context.strokeStyle = c.colour;
							}

							context.beginPath();

							unit = c.unit;
							unitX = unit * scale.x;
							unitY = unit * scale.y;

							if (unit === 0) {
								if (
									(axis.y > -(c.width / 2)) &&
									(axis.y < size.y + (c.width / 2))
								) {
									context.moveTo(left, 0);
									context.lineTo(right, 0);
								}
								if (
									(axis.x > -(c.width / 2)) &&
									(axis.x < size.x + (c.width / 2))
								) {
									context.moveTo(0, top);
									context.lineTo(0, bottom);
								}
							}
							else {
								if (
									((c.minScale == null) || (c.minScale <= scale.x)) &&
									((c.maxScale == null) || (c.maxScale >= scale.x))
								) {
									x = left - (left % unitX);
									if (x + (c.width / 2) < left) { x += unitX; }
									xl = right + c.width;
									while (x < xl) {
										context.moveTo(x, top);
										context.lineTo(x, bottom);

										x += unitX;
									}
								}

								if (
									((c.minScale == null) || (c.minScale <= scale.y)) &&
									((c.maxScale == null) || (c.maxScale >= scale.y))
								) {
									y = top - (top % unitY);
									if (y + (c.width / 2) < top) { y += unitY; }
									yl = bottom + (c.width / 2);
									while (y < yl) {
										context.moveTo(left, y);
										context.lineTo(right, y);

										y += unitY;
									}
								}
							}

							context.stroke();

							i++;
						}

						c = null;
					}
					context.restore();

					view.dirty = false;
				}
			}
		})()
	};

	return Grid;
})();
