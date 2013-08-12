if (!window.position) {
	window.position = (function () {
		var style = document.createElement("_").style;
		var transform = (
			(style["transform"] != null) ? "transform" :
			(style["-webkit-transform"] != null) ? "-webkit-transform" :
			(style["-moz-transform"] != null) ? "-moz-transform" :
			(style["-ms-transform"] != null) ? "-ms-transform" :
			(style["-o-transform"] != null) ? "-o-transform" :
			""
		);
		style = null;

		if (transform) {
			var has3d = (
				window.matchMedia &&
				window.matchMedia("(" + transform + "-3d)").matches
			);

			var template = "translate" + (has3d ? "3d" : "") + "({x}px,{y}px" + (has3d ? ",0" : "") + ")";
			return function position(style, x, y) {
				style[transform] = template.replace("{x}", x).replace("{y}", y);
			};
		}
		else {
			return function (style, x, y) {
				style.marginLeft = x + "px";
				style.marginTop = y + "px";
			}
		}
	})();
}