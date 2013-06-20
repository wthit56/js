// data:text/html;ascii,<script src="http://localhost:45917/infinite-tiles/0.11.js"></script>

var global = this;

function importScript(src, type) {
	var script = document.createElement("SCRIPT");
	script.src = src;
	script.type = type || "text/javascript";
	document.head.appendChild(script);
}

function Canvas2D(width, height) {
	var canvas = document.createElement("CANVAS");
	canvas.context = canvas.getContext("2d");
	if (width != null) { canvas.width = width; }
	if (height != null) { canvas.height = height; }
	return canvas;
}

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

		this.offset = { x: 0, y: 0 };

		this.render = function () {
			return TileBuffer.prototype.render.apply(this, arguments);
		};
		this.render.view = {
			from: { x: 0, y: 0, change: { x: 0, y: 0, dirty: false} },
			size: { x: 0, y: 0, change: { x: 0, y: 0, dirty: false} }
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

			// assignment
			if ((-tileSize >= (diff = (x + (tileSize * 2)) - size.x)) || (diff >= tileSize)) {
				change.x = x - (x % tileSize) + (tileSize * 2);
				change.dirty = true;
			}
			// assignment
			if ((-tileSize >= (diff = (y + (tileSize * 2)) - size.y)) || (diff >= tileSize)) {
				change.y = y - (y % tileSize) + (tileSize * 2);
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

		render: function () {
			var change,
				view = this.render.view,
				context = this.canvas.context;
			var tileSize = this.map.tiles.size;

			var size = view.size, from = view.from;

			var debug = this.debug;

			// render when from point has changed
			change = from.change;
			if (change.dirty) {
				// calculate offsets
				this.offset.x = change.x % tileSize;
				this.offset.y = change.y % tileSize;
				change.dirty = false;
			}

			// render when size has changed
			change = size.change;
			if (change.dirty) {
				this.double.width = change.x;
				this.double.height = change.y;
				this.double.context.drawImage(this.canvas, 0, 0);

				this.canvas.width = change.x;
				this.canvas.height = change.y;
				if (this.background) {
					context.fillStyle = this.background;
					context.fillRect(0, 0, change.x, change.y);
				}
				context.drawImage(this.double, 0, 0);

				var fromX = (from.x + size.x), fromTileX = fromX / tileSize,
					toX = (from.x + change.x), toTileX = toX / tileSize;
				var fromY = (from.y + size.y), fromTileY = fromY / tileSize,
					toY = (from.y + change.y), toTileY = toY / tileSize;

				for (var x = fromX, tileX = fromTileX; x < toX; x += tileSize, tileX++) {
					for (var y = from.y, tileY = from.y / tileSize; y < toY; y += tileSize, tileY++) {
						this.map.draw(context, tileX, tileY, x, y);
					}
				}

				for (var x = from.x, tileX = from.x / tileSize; x < fromX; x += tileSize, tileX++) {
					for (var y = fromY, tileY = fromTileY; y < toY; y += tileSize, tileY++) {
						this.map.draw(context, tileX, tileY, x, y);
					}
				}

				if (debug) {
					var debugContext = debug.context;

					debug.width = change.x;
					debug.height = change.y;

					// copy buffer
					debugContext.drawImage(this.canvas, 0, 0);

					// render x
					debugContext.fillStyle = "rgba(255,0,0,0.25)";
					debugContext.fillRect(fromX, from.y, toX - fromX, toY - from.y);

					// render y
					debugContext.fillStyle = "rgba(0,0,255,0.25)";
					debugContext.fillRect(from.x, fromY, fromX - from.x, toY - fromY);
				}

				// update current view size to newly rendered view
				size.x = change.x;
				size.y = change.y;
				// size change has been rendered; no longer dirty
				change.dirty = false;
			}

			return this;
		}
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


document.head.appendChild(document.createElement("STYLE")).innerHTML = "" +
	"body {margin:0;}" +
	"canvas {box-shadow:0 0 5px hsl(0,0%,50%); margin:10px; margin-right:0; max-width:300px; max-width:200px;}" +
	"canvas#view {margin-right:10px; float:right; max-width:none;}";

var background = "white";

var view = new Canvas2D(480,320);
view.id = "view";
view.context.fillStyle = background;

var buffer = new TileBuffer.debug(
	{
		tiles: tiles,
		draw: function (context, tileX, tileY, x, y) {
			context.drawImage(this.tiles[Math.random() * 2 | 0], x, y);
			return this;
		}
	},
	background
);

var AEL = (window.addEventListener || window.attachEvent);
AEL.call(window, "load", function () {
	document.body.appendChild(view);
	document.body.appendChild(buffer.canvas);
	document.body.appendChild(buffer.debug);
	document.body.appendChild(buffer.double).style.marginTop = 0;

	buffer.moveTo(-(50 - ((view.width % 50) / 2)), -(50 - ((view.height % 50) / 2)));
	buffer.resize(view.width, view.height);
});
AEL.call(window, "keydown", function (e) {
	if (!e) { e = window.event; }

	switch (e.keyCode || e.which || e.charCode) {
		case 38: // up
			// assignment
			if (e.ctrlKey) { buffer.resize(view.width, (view.height -= 10)); }
			else { buffer.moveBy(0, -10); }
			e.preventDefault();
			break;
		case 40: // down
			// assignment
			if (e.ctrlKey) { buffer.resize(view.width, (view.height += 10)); }
			else { buffer.moveBy(0, 10); }
			e.preventDefault();
			break;
		case 37: // left
			// assignment
			if (e.ctrlKey) { buffer.resize((view.width += 10), view.height); }
			else { buffer.moveBy(10, 0); }
			e.preventDefault();
			break;
		case 39: // right
			// assignment
			if (e.ctrlKey) { buffer.resize((view.width -= 10), view.height); }
			else { buffer.moveBy(-10, 0); }
			e.preventDefault();
			break;
	}

	if (e.ctrlKey) { console.log("size: ", view.width, view.height); }
	else { console.log("from: ", buffer.render.view.from.change); }
});

importScript("http://localhost:45917/shims/raf-caf.js");
requestAnimationFrame(function raf() {
	buffer.render();

	var context = view.context;
	context.fillRect(0, 0, view.width, view.height);
	context.drawImage(buffer.canvas, buffer.offset.x, buffer.offset.y);

	requestAnimationFrame(raf);
});
