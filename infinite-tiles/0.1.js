// data:text/html;ascii,<script src="http://localhost:45917/infinite-tiles/0.1.js"></script>

function Canvas2D() {
	var canvas = document.createElement("CANVAS");
	canvas.context = canvas.getContext("2d");
	return canvas;
}

var canvas = Canvas2D();
canvas.style.WebkitBoxShadow = "0 0 5px hsl(0,0%,50%)";
canvas.width = 480;
canvas.height = 320;

function createImage(colour) {
	var canvas = document.createElement("CANVAS");
	canvas.width = 50; canvas.height = 50;
	if (colour) {
		var ctx=canvas.getContext("2d");
		ctx.fillStyle = colour;
		ctx.fillRect(0, 0, 50, 50);
	}
	return canvas;	
}

var tiles = [createImage("hsl(0,0%,50%)"), createImage()];

var tileBuffer = (function () {
	function getMapTile(x, y) {
		return tiles[Math.floor(Math.random() * 2)];
	}

	function renderArea(buffer, fromX, fromY, amountX, amountY, tileSize) {
		var ctx = buffer.context;
		for (var x = 0; x < amountX; x++) {
			for (var y = 0; y < amountY; y++) {
				ctx.drawImage(getMapTile(fromX + x, fromY + y), x * tileSize, y * tileSize);
			}
		}
	}

	return function tileBuffer(target, tileSize) {
		var canvas = Canvas2D();
		canvas.width = target.width - (target.width % tileSize) + (tileSize * 2);
		canvas.height = target.height - (target.height % tileSize) + (tileSize * 2);
		canvas.style.WebkitBoxShadow = "0 0 5px hsl(0,0%,50%)";
		canvas.style.margin = "0 10px";
		var ctx = canvas.context;

		var tilesX = canvas.width / tileSize,
			tilesY = canvas.height / tileSize;

		renderArea(canvas, 0, 0, tilesX, tilesY, tileSize);

		var posX = 0, posY = 0;
		var tileX = 0, tileY = 0;
		var drawX = 0, drawY = 0;
		var offsetX = 0, offsetY = 0;

		return {
			canvas: canvas, context: ctx,
			setPosition: function (x, y) {

				// view left of rendered, render left
				if (x <= posX) {
					var newPosX = x - (x % tileSize) - tileSize;
					var newTileX = newPosX / tileSize;
					tileX = posX / tileSize;
					renderArea(canvas, newTileX, 0, tileX - newTileX, tilesY);
					//console.log("render left " + (posX = );
				}
				// view right of rendered, render right
				else if (x - posX >= tileSize) {
					console.log("render right " + (posX = x - (x % tileSize)));
				}

				//if ((diffX > 0) && (diffX <= tileSize)) {
				//	console.log("render left ("+x+" "+posX+") " + (posX = x - (x % tileSize) - tileSize));
				//}
				//else if (diffX > tileSize) {
				//	console.log("render right ("+x+" "+posX+") " + (posX = x - (x % tileSize)));
				//}

				//posX = x - (x % tileSize);

				if (y < posY) {
					console.log("render up " + (posX = y - (y % tileSize)));
				}
				else if (y - posY > tileSize) {
					console.log("render down " + (posX = y - (y % tileSize)));
				}
				//posY = y - (y % tileSize);

				/*
				if (
				((offsetX == 0) && (posX != 0)) || ((offsetY == 0) && (posY != 0))
				) { }
				*/

				drawX = -x % tileSize; drawY = -y % tileSize;
			},
			render: function () {
				var ctx = target.context;
				ctx.clearRect(0, 0, target.width, target.height);
				ctx.drawImage(canvas, drawX, drawY);
			}
		};
	}
})();

var buffer = tileBuffer(canvas, 50);
buffer.render();

var AEL = (window.addEventListener || window.attachEvent);

AEL.call(window, "load", function () {
	document.body.appendChild(canvas);

	buffer.canvas.style.width = "200px";
	document.body.appendChild(buffer.canvas);
});

var camera = {
	x: 0, y: 0,
	moveBy: function (x, y) {
		this.x += x;
		this.y += y;

		buffer.setPosition(-this.x, -this.y);
		buffer.render();
	}
};

AEL.call(window, "keydown", function (e) {
	switch (e.which) {
		case 38: // up
			camera.moveBy(0, 10);
			break;
		case 40: // down
			camera.moveBy(0, -10);
			break;
		case 37: // left
			camera.moveBy(10, 0);
			break;
		case 39: // right
			camera.moveBy(-10, 0);
			break;
	}
});
