if (!window.importScript) {
	window.importScript = function (src, type) {
		var script = document.createElement("SCRIPT");
		script.src = src;
		script.type = type || "text/javascript";
		document.head.appendChild(script);
	};
}