// data:text/html;ascii,<script src="http://localhost:45917/test.js"></script>

// importScript, eventTarget
window.eventTarget||(window.eventTarget=function(){return window.addEventListener&&window.removeEventListener?{add:"addEventListener",remove:"removeEventListener"}:window.attachEvent&&window.detachEvent?{add:"attachEvent",remove:"detachEvent"}:void 0}()),window.importScript||(window.importScript=function(a,b){var c=document.createElement("SCRIPT");c.src=a,c.type=b||"text/javascript",document.head.appendChild(c)});

importScript("http://192.168.0.9:45917/shims/raf-caf.js");
importScript("http://192.168.0.9:45917/shims/eventTarget.js");

importScript("http://192.168.0.9:45917/helpers/position.js");

importScript("http://192.168.0.9:45917/objects/Tilebuffer.js");

document.head.appendChild(document.createElement("STYLE")).innerHTML = "\
	html{\
		-webkit-text-size-adjust:100%;\
		-ms-text-size-adjust:100%;\
	}\
	body {margin:0;}\
	\
	#port {overflow:hidden;}\
";

var meta = document.head.appendChild(document.createElement("META"));
meta.name = "viewport";
meta.content = "width=device-width, initial-scale=1, maximum-scale=1";

window[eventTarget.add]("load", function () {
	var tileSize = 50;
	var mapX = window.innerWidth * 3; mapX = mapX - (mapX % tileSize);
	var mapY = window.innerHeight * 3; mapY = mapY - (mapY % tileSize);
	var buffer = new TileBuffer(
		{
			background: "white",
			tiles: {
				render: (function () {
					var cache = {},
						key = "";

					return function (context, x, y) {
						key = x + "," + y;
						if (cache[key] == null) {
							cache[key] = ((Math.random() * 2) | 0);
						}

						if (cache[key]) {
							if (context.fillStyle != "hsl(0,0%,50%)") {
								context.fillStyle = "hsl(0,0%,50%)";
							}
							context.fillRect(x, y, this.size, this.size);
						}
					};
				})(),
				size: tileSize
			},
			width: mapX, height: mapY
		},
		{ asDOM: true }
	);
	buffer.resize(window.innerWidth, window.innerHeight);

	document.body.innerHTML = "\
		<div id='port'></div>\
	";

	var port = document.getElementById("port");
	port.appendChild(buffer.canvas);
	port.style.width = window.innerWidth + "px";
	port.style.height = window.innerHeight + "px";

	var current = { x: 0, y: 0 },
		size = 20;
	var offset = buffer.view.offset;
	requestAnimationFrame(function raf() {
		current.x += size;
		current.y += size;

		buffer.moveTo(current.x, current.y);

		buffer.render();
		if (offset.dirty) {
			position(buffer.canvas.style, offset.x, offset.y);
			offset.dirty = null;
		}

		requestAnimationFrame(raf);
	});

});
