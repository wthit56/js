// data:text/html;ascii,<script src="http://localhost:45917/objects/tests/TileBuffer-scroll-0.1.js"></script>

document.head.appendChild(document.createElement("STYLE")).innerHTML = "" +
	"body {margin:5px;}"+
	"canvas {box-shadow:0 0 5px hsl(0,0%,50%); background:hsl(0,0%,90%); margin:5px;}";

function Canvas2D(width, height) {
	var canvas = document.createElement("CANVAS");
	canvas.context = canvas.getContext("2d");
	if (width != null) { canvas.width = width; }
	if (height != null) { canvas.height = height; }
	return canvas;
}

function importScript(src, type) {
	var script = document.createElement("SCRIPT");
	script.src = src;
	script.type = type || "text/javascript";
	document.head.appendChild(script);
}


importScript("http://localhost:45917/shims/raf-caf.js");

var AEL = (window.addEventListener || window.attachEvent);
AEL.call(window, "load", function () {
	var tile = 100;


	var view = new Canvas2D(300, 300);
	var vcontext = view.context;
	vcontext.fillStyle = "white";

	var buffer = new Canvas2D(view.width + tile, view.height + tile);
	buffer._page = 1;
	var bcontext = buffer.context;

	bcontext.fillStyle = "white";
	bcontext.fillRect(0, 0, buffer.width, buffer.height);

	bcontext.fillStyle = "hsl(0,0%,50%)";
	for (var x = 0, xl = buffer.width; x < xl; x += tile) {
		for (var y = 0, yl = buffer.width; y < yl; y += tile) {
			if ((Math.random() * 2) | 0) {
				bcontext.fillRect(x, y, tile, tile);
			}
		}
	}

	var buffer2 = new Canvas2D(buffer.width, buffer.height);
	buffer2._page = 2;
	var b2context = buffer2.context;

	var offhand;

	var from = 0, speed = 100 / 1000, offset = 0,
		buffered = 0, newbuffered, bufferdiff;
	var start, end,
		x, y;

	var last = Date.now(), current, delta;
	context = view.context;
	requestAnimationFrame(function raf() {
		current = Date.now();
		delta = current - last;

		from += delta * speed;

		if (buffered - from < -tile) {
			newbuffered = from - (from % tile);
			bufferdiff = newbuffered - buffered;
			if (bufferdiff > buffer.width) {
				bufferdiff = buffer.width;
			}

			b2context.fillStyle = "white";
			b2context.fillRect(0, 0, buffer2.width, buffer2.height);
			b2context.drawImage(buffer, -bufferdiff, -bufferdiff);

			b2context.fillStyle = "hsl(0,0%,50%)";

			start = buffer.width - bufferdiff; end = buffer.width;
			x = start; y = 0;
			while (true) {
				if (y >= end) {
					break;
				}

				while (true) {
					if (x >= end) {
						break;
					}

					if ((Math.random() * 2) | 0) {
						b2context.fillRect(x, y, tile, tile);
					}

					x += tile;
				}

				y += tile;
				if (y < start) { x = start; }
				else { x = 0; }
			}

			buffered = newbuffered;

			offhand = buffer;

			bcontext = b2context;
			buffer = buffer2;

			buffer2 = offhand;
			b2context = buffer2.context;

			offhand = null;
		}

		offset = -from % tile;

		vcontext.fillRect(0, 0, view.width, view.height);
		vcontext.drawImage(buffer, offset, offset);

		last = current;
		requestAnimationFrame(raf);
	});

	function cleanup() {

	}


	document.body.appendChild(buffer).style.width = "200px";
	document.body.appendChild(buffer2).style.width = "200px";
	document.body.appendChild(view);
});
