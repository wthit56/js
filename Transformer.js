if (undefined === window.Transformer) {
	var Transformer = (function () {
		var global = this;

		var clean = [];

		function Transformer(force3d) {
			if (clean.length > 0) {
				var _ = clean.pop();
				Transformer.apply(_, arguments);
				return _;
			}
			else if (this === global) {
				return Transformer.apply({ constructor: Transformer }, arguments);
			}

			this.force3d = (force3d != null ? force3d : true);
			this.transform = "";
		}
		Transformer.prototype = {
			force3d: true,

			string: "",
			toString: function () {
				return this.transform;
			},

			translate: function (x, y, z) {
				this.string += "" +
				"translate" + (Transformer.has3d ? "3d" : "") +
				"(" +
					 x + "px," + y + "px" +
					(Transformer.has3d ?
						(
							z != null ? "px," + z :
							this.force3d ? ",0" :
							""
						) :
						""
					) +
				")" +
			"";

				return this;
			},

			apply: function (style) {
				style[Transformer.cssProperty] = this.string;
				return this;
			},
			reset: function () {
				this.string = "";
				return this;
			},
			destroy: function () {
				this.reset();
				clean.push(this);
			}
		};

		var style = document.createElement("test").style;
		Transformer.cssProperty = (
			(style["transform"] != null) ? "transform" :
			(style["-webkit-transform"] != null) ? "-webkit-transform" :
			(style["-moz-transform"] != null) ? "-moz-transform" :
			(style["-ms-transform"] != null) ? "-ms-transform" :
			(style["-o-transform"] != null) ? "-o-transform" :
			""
		);
		style = null;

		Transformer.has3d = (
			window.matchMedia &&
			window.matchMedia("(" + Transformer.cssProperty + "-3d)").matches
		);

		return Transformer;
	})();
}