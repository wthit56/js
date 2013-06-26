// data:text/html;ascii,<script src="http://localhost:45917/objects/versions/TileBuffer-0.12.js"></script>

var global = this;

var TileBuffer = (function () {
	function TileBuffer(map, background) {
		if (this === global) {
			if (Object.create) {
				var obj = Object.create(TileBuffer.prototype);
				obj.constructor = TileBuffer;
				TileBuffer.apply(obj, arguments);
				return obj;
			}
			else {
				throw new Error("TileBuffer should be created using the new keyword.");
			}
		}

		this.tiles = tiles;
		this.map = map;
		this.background = background;

		this.canvas = new Canvas2D();
		this.double = new Canvas2D();

		var tileSize = map.tiles.size;

		this.offset = { x: -tileSize, y: -tileSize };

		this.render = function () {
			return TileBuffer.prototype.render.apply(this, arguments);
		};
		this.render.view = {
			from: { x: 0, y: 0, change: { x: 0, y: 0, dirty: false} },
			size: { x: 0, y: 0, change: { x: 300, y: 150, dirty: true} }
		};
	};
	TileBuffer.prototype = {
		debug: false,

		tiles: null, map: null,
		background: null,

		canvas: null, double: null,
		offset: null,

		resize: function (x, y) {
			var tileSize = this.map.tiles.size;
			var size = this.render.view.size;
			var change = size.change;

			var diff;

			//// assignment
			//if ((-tileSize >= (diff = (x + (tileSize * 2)) - size.x)) || (diff >= tileSize)) {
			//	change.x = x - (x % tileSize) + (tileSize * 2);
			//	change.dirty = true;
			//}
			//// assignment
			//if ((-tileSize >= (diff = (y + (tileSize * 2)) - size.y)) || (diff >= tileSize)) {
			//	change.y = y - (y % tileSize) + (tileSize * 2);
			//	change.dirty = true;
			//}

			if ((x != size.x) || (y != size.y)) {
				change.x = x;
				change.y = y;
				change.dirty = true;
			}

			return this;
		},

		moveBy: function (x, y) {
			var change = this.render.view.from.change;

			if ((x != 0) || (y != 0)) {
				change.x += x;
				change.y += y;
				change.dirty = true;
			}

			return this;
		},
		moveTo: function (x, y) {
			var change = this.render.view.from.change;

			if ((x != change.x) || (y != change.y)) {
				change.x = x;
				change.y = y;
				change.dirty = true;
			}

			return this;
		},

		render: (function () {
			var shift = { x: 0, y: 0 };

			var up = { from: 0, to: 0, render: false },
				down = { from: 0, to: 0, render: false },
				left = { from: 0, to: 0, render: false },
				right = { from: 0, to: 0, render: false };

			var horizon = { left: 0, right: 0 };

			function roundDown(value, tileSize) {
				return value - (value % tileSize);
			}
			function roundUp(value, tileSize) {
				return value - (value % tileSize) + tileSize;
			}

			return function TileBuffer_render() {
				var view = this.render.view;
				var from = view.from,
					size = view.size;

				var debug = this.debug;

				var change, current,
					tileSize = this.map.tiles.size;

				this.offset.x = from.change.x % tileSize;
				this.offset.y = from.change.y % tileSize;

				if (
					size.change.dirty &&
					(size.x == 0) && (size.y == 0) &&
					(size.change.x > 0) && (size.change.y > 0)
				) {
					from.change.x = roundDown(from.change.x, tileSize);
					from.change.y = roundDown(from.change.y, tileSize);

					size.change.x = roundUp(size.change.x, tileSize);
					size.change.y = roundUp(size.change.y, tileSize);

					left.from = from.change.x;
					left.to = left.from + size.change.x;
					left.render = true;
				}
				else {
					horizon.left = from.change.x;
					horizon.right = horizon.left + size.x;

					if (from.change.dirty) {
						{ // check x
							current = from.x;
							change = horizon.left = from.change.x =
								roundDown(from.change.x, tileSize);

							// view moving left
							if (change < current) {
								shift.x = current - change;

								left.from = change;
								left.to = current;
								left.render = true;

								horizon.left = left.to;
							}
							// view moving right
							// (this will only be triggered when 'change' is 
							//  tileSize to the right of 'current')
							else if (change > current) {
								size.change.x = roundUp(size.change.x, tileSize);

								shift.x = current - change;

								right.from = current + size.x;
								right.to = change + size.change.x;
								right.render = true;

								horizon.right = right.from;
							}
						}

						{ // check y
							current = from.y;
							change = from.change.y = roundDown(from.change.y, tileSize);

							// view moving up
							if (change < current) {
								shift.y = current - change;

								up.from = change;
								up.to = up.from + shift.y;
								up.render = true;
							}
							// view moving down
							else if (change > current) {
								size.change.y = roundUp(size.change.y, tileSize);

								shift.y = current - change;

								down.from = current + change;
								down.to = change + size.change.y;
								down.render = true;
							}
						}

						if ((from.change.x == from.x) && (from.change.y == from.y)) {
							from.change.dirty = false;
						}
						else {
							from.x = from.change.x;
							from.y = from.change.y;
						}
					}

					if (size.change.dirty) {
						// view width expanding
						if (!right.render && (shift.x + size.x < size.change.x)) {
							right.from = from.change.x + shift.x + size.x;
							right.to = from.change.x + shift.x + size.change.x;
							right.render = true;
							horizon.right = right.from;
						}

						// view height expanding
						if (!down.render && (size.y + shift.y < size.change.y)) {
							down.from = from.change.y + shift.y + size.y;
							down.to = from.change.y + shift.y + size.change.y;
							down.render = true;
						}
					}
				}

				if (debug && (from.change.dirty || size.change.dirty)) {
					var debugContext = debug.context;

					debug.width = size.change.x + 20;
					debug.height = size.change.y + 20;

					// copy buffer
					debugContext.drawImage(this.canvas, 0, 0);

					debugContext.save();
					debugContext.translate(-from.change.x + 10, -from.change.y + 10);

					// render left/right
					debugContext.fillStyle = "rgba(255,0,0,0.25)";
					if (left.render) {
						debugContext.fillRect(left.from, from.change.y, left.to - left.from, size.change.y);
					}
					if (right.render) {
						debugContext.fillRect(right.from, from.change.y, right.to - right.from, size.change.y);
					}

					// render top/bottom
					debugContext.fillStyle = "rgba(0,0,255,0.25)";
					if (up.render) {
						debugContext.fillRect(horizon.left, up.from, horizon.right - horizon.left, up.to - up.from);
					}
					if (down.render) {
						debugContext.fillRect(horizon.left, down.from, horizon.right - horizon.left, down.to - down.from);
					}

					debugContext.restore();
				}

				shift.x = shift.y = 0;

				left.render = false;
				right.render = false;
				up.render = false;
				down.render = false;

				horizon.x = horizon.y = 0;

				from.x = from.change.x;
				from.y = from.change.y;
				from.change.dirty = false;

				size.x = size.change.x;
				size.y = size.change.y;
				size.change.dirty = false;

				return this;
			};
		})()
	};

	TileBuffer.debug = function (map, background) {
		var buffer = TileBuffer.apply(global, arguments);
		buffer.debug = new Canvas2D();
		return buffer;
	};

	return TileBuffer;
})();

var tiles = (function () {
	var tiles = [
		new Canvas2D(50,50),
		(function () {
			var canvas = new Canvas2D(50,50);
			canvas.width = 50;
			canvas.height = 50;
			
			var context = canvas.context;
			{
				context.fillStyle = "hsl(0,0%,50%)";
				context.fillRect(0, 0, 50, 50);
			}

			return canvas;
		})()
	];
	tiles.size = 50;

	return tiles;
})();

//function test(f) {
//	var tile = 50, from = -5;
//	console.log((10) + " > " + f(from, 10, tile));
//	console.log((50) + " > " + f(from, 50, tile));
//	console.log((60) + " > " + f(from, 60, tile));
//	console.log((110) + " > " + f(from, 110, tile));
//}
//test(function (from, x, tile) { return Math.abs(x - (x % tile) - from) >= tile; });
