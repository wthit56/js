// data:text/html;ascii,<script src="http://localhost:45917/objects/tests/TileBuffer-Drag-port-1.0.js"></script>

// importScript, eventTarget
window.eventTarget||(window.eventTarget=function(){return window.addEventListener&&window.removeEventListener?{add:"addEventListener",remove:"removeEventListener"}:window.attachEvent&&window.detachEvent?{add:"attachEvent",remove:"detachEvent"}:void 0}()),window.importScript||(window.importScript=function(a,b){var c=document.createElement("SCRIPT");c.src=a,c.type=b||"text/javascript",document.head.appendChild(c)});

importScript("http://192.168.0.9:45917/shims/raf-caf.js");
importScript("http://192.168.0.9:45917/shims/Object.create.js");
importScript("http://192.168.0.9:45917/shims/eventTarget.js");

importScript("http://192.168.0.9:45917/helpers/position.js");

importScript("http://192.168.0.9:45917/objects/Drag.js");
importScript("http://192.168.0.9:45917/objects/Tilebuffer.js");

document.head.appendChild(document.createElement("STYLE")).innerHTML = "\
	html{\
		-webkit-text-size-adjust:100%;\
		-ms-text-size-adjust:100%;\
	}\
	body {margin:0;}\
	\
	#container {position:relative; float:left;}\
	#container #port {\
		overflow:hidden; position:relative;\
		border:2px solid hsl(0,0%,85%);\
	}\
	#container #port canvas {\
		/*box-shadow:0 0 5px hsl(0,0%,50%);*/ background:hsl(0,0%,85%);\
		position:absolute;\
	}\
	#container #resize {\
		display:block; cursor:nwse-resize;\
		position:absolute; bottom:0px; right:0px;\
		width:50px; height:50px;\
		background:rgba(255,255,255,0.5);\
		border:solid black; border-width:0 5px 5px 0;\
	}\
";

var meta = document.head.appendChild(document.createElement("META"));
meta.name = "viewport";
meta.content = "width=device-width, initial-scale=1, maximum-scale=1";

var dummy = document.createElement("_");
dummy.innerHTML = '\
	<div id="container">\
		<div id="port"></div>\
		<span id="resize"></span>\
	</div>\
';

var port = (function () {
	var port = dummy.querySelector("#port");
	port.view = {
		camera: {
			x: 0, y: 0,
			update: function () {
				buffer.moveTo(this.x, this.y);
			}
		},
		size: {
			x: window.innerWidth - 50, y: window.innerHeight - 50,
			update: function () {
				buffer.resize(this.x, this.y);

				port.style.width = this.x + "px";
				port.style.height = this.y + "px";
			}
		}
	};

	return port;
})();

var tileSize = 50;
var mapX = screen.width * 10; mapX = mapX - (mapX % tileSize);
var mapY = screen.height * 10; mapY = mapY - (mapY % tileSize);
var buffer;

var tiles = new Image();
tiles.src = "http://localhost:45917/objects/tests/tiles.png";

window[eventTarget.add]("load", function () {
	while (dummy.childNodes.length) {
		document.body.appendChild(dummy.childNodes[0]);
	}
	dummy = null;

	buffer = new TileBuffer(
		{
			background: "white",
			tiles: {
				render: (function () {
					var cache = {},
						key = "", tile, tileSize;

					return function (context, x, y) {
						key = x + "," + y, tileSize = this.size, tile=cache[key];
						if (tile == null) {
							tile = cache[key] = {
								x: ((Math.random() * 2) | 0) * tileSize,
								y: ((Math.random() * 2) | 0) * tileSize
							};
						}

						if (tile) {
							//context.fillStyle = "black";
							//(tile.x >= 50) && context.fillRect(x, y, 50, 50);

							context.drawImage(
								tiles,
								tile.x, tile.y, tileSize, tileSize,
								x, y, tileSize, tileSize
							);

							//context.drawImage(tiles, 0, 0);
						}

						tile = null;
					};
				})(),
				size: tileSize
			},
			width: mapX, height: mapY
		},
		{ single: false }
	);
	port.view.camera.update();
	port.view.size.update();
	buffer.render();
	position(buffer.canvas.style, 0, 0);

	var canvas = buffer.canvas;
	port.appendChild(buffer.canvas);
	if (!buffer.config.single) {
		port.appendChild(canvas.alt);
		hide(canvas.alt);
	}

	function hide(canvas) {
		//position(canvas.style, -canvas.width, -canvas.width);
		canvas.style.opacity = 0;
	}
	function show(canvas) {
		//position(canvas.style, offset.x, offset.y);
		canvas.style.opacity = 1;
	}

	var move = {
		drag: null,
		move: function (e) { e.preventDefault(); },
		end: function (e) {
			move.drag = null;
			e.preventDefault();
		}
	};
	Drag.hook(port, function (e) {
		move.drag = new Drag(e, move.move, move.end);
		e.preventDefault();
	});

	var size = {
		drag: null,
		move: function (e) {
			e.preventDefault();
		},
		end: function (e) {
			size.drag = null;
			e.preventDefault();
		}
	};
	Drag.hook(resize, function (e) {
		size.drag = new Drag(e, size.move, size.end);
		e.preventDefault();
	});

	var diff, render = false;
	var view = port.view, offset = buffer.view.offset;
	requestAnimationFrame(function raf() {
		render = false;

		if (move.drag) {
			diff = move.drag.position.diff;
			if (diff.dirty) {
				diff = diff.get();

				view.camera.x -= diff.x;
				view.camera.y -= diff.y;
				view.camera.update();

				render = true;
			}
		}

		if (size.drag) {
			diff = size.drag.position.diff;
			if (diff.dirty) {
				diff = diff.get();
				view.size.x += diff.x;
				view.size.y += diff.y;
				view.size.update();
				render = true;
			}
		}

		if (render) {
			buffer.render();

			if (!buffer.config.single && canvas.dirty) {
				console.timeStamp("swapping");
				canvas.dirty = false;
				hide(canvas);
				canvas = canvas.alt;
				show(canvas);

				if (!offset.dirty) {
					position(canvas.style, offset.x, offset.y);
				}
			}

			if (offset.dirty) {
				position(canvas.style, offset.x, offset.y);
				offset.dirty = null;
			}
		}

		requestAnimationFrame(raf);
	});
});
