// data:text/html;ascii,<script src="http://localhost:45917/infinite-tiles/test.js"></script>

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

importScript("http://localhost:45917/infinite-tiles/0.12.js");
importScript("http://localhost:45917/shims/raf-caf.js");

document.head.appendChild(document.createElement("STYLE")).innerHTML = "" +
	"body {margin:0;}" +
	"canvas {box-shadow:0 0 5px hsl(0,0%,50%); margin:10px; margin-right:0; max-width:300px; max-width:200px;}" +
	"canvas#view {margin-right:10px; float:right; max-width:none;}";


var AEL = (window.addEventListener || window.attachEvent);
AEL.call(window, "load", function () {
	var background = "white";

	var view = new Canvas2D(480, 320);
	view.id = "view";
	view.context.fillStyle = background;

	var buffer = window.buffer = new TileBuffer.debug(
		{
			tiles: tiles,
			draw: function (context, tileX, tileY, x, y) {
				context.drawImage(this.tiles[Math.random() * 2 | 0], x, y);
				return this;
			}
		},
		background
	);


	document.body.appendChild(view);
	document.body.appendChild(buffer.canvas);
	document.body.appendChild(buffer.debug);
	document.body.appendChild(buffer.double).style.marginTop = 0;

	//buffer.resize(view.width, view.height);
	//buffer.moveTo(-(50 - ((view.width % 50) / 2)), -(50 - ((view.height % 50) / 2)));
	//buffer.render();

	buffer.render();
	//buffer.moveTo(100, 100);
	//buffer.render();

	requestAnimationFrame(function raf() {
		buffer.render();

		var context = view.context;
		context.fillRect(0, 0, view.width, view.height);
		context.drawImage(buffer.canvas, buffer.offset.x, buffer.offset.y);

		requestAnimationFrame(raf);
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
});
