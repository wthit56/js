if (!window.MDE) {
	window.MDE = (function () {
		function MDE() {
			var HTML = this.HTML = document.createElement("DIV");
			HTML.className = "MDE";
			HTML[eventTarget.add]("click", function (e) {
				console.log("MDE focussed");
				var last = HTML.childNodes[HTML.childNodes.length - 1];
				//last.focus();
				console.log(last.value.length);
				last.setSelectionRange(last.value.length,last.value.length);
			});

			HTML.appendChild(new Line().HTML);
		}
		MDE.prototype = {
			HTML: null
		};

		var Line = (function () {
			function Line() {
				var HTML = this.HTML = document.createElement("TEXTAREA");
				HTML.className = "line";
				HTML[eventTarget.add]("click", function (e) {
					console.log("Line focussed");
					e.stopPropagation();
					e.preventDefault();
				});
			}
			Line.prototype = {
				HTML: null
			};

			return Line;
		})();

		return MDE;
	})();
}