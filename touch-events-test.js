// data:text/html;ascii,<script src="http://localhost:45917/test.js"></script>

var log = (function () {
	function map(v) {
		return JSON.stringify(v);
	}

	return function (message) {
		if (!log.html) { return; }

		var container = log.html;
		var line = document.createElement("P");
		line.innerHTML = Array.prototype.map.call(arguments, map).join(" ");

		if (container.childNodes) {
			container.insertBefore(line, container.childNodes[0]);
		}
		else {
			container.appendChild(line);
		}

		while (container.offsetHeight > window.innerHeight) {
			container.removeChild(
				container.childNodes[container.childNodes.length - 1]
			);
		}
	}
})();

var eventTarget = {
	add: (
		window.addEventListener ? "addEventListener" :
		window.attachEvent ? "attachEvent" :
		""
	),
	remove: (
		window.removeEventListener ? "removeEventListener" :
		window.detachEvent ? "detachEvent" :
		""
	)
};

document.head.appendChild(document.createElement("STYLE")).innerHTML = "\
	#log {}\
	#log p {float:left; background:#eee;}\
";

window[eventTarget.add]("load", function () {
	document.body.innerHTML = "<div id='log'></div>";
	log.html = document.getElementById("log");

	function log_event(e) {
		log(e.type, e.pageX, e.pageY);
		e.preventDefault();
	}
	window[eventTarget.add]("mousedown", log_event);
	window[eventTarget.add]("mousemove", log_event);
	window[eventTarget.add]("mouseup", log_event);
	window[eventTarget.add]("touchstart", log_event);
	window[eventTarget.add]("touchmove", log_event);
	window[eventTarget.add]("touchend", log_event);
	window[eventTarget.add]("touchcancel", log_event);
});
