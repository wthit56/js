// http://jrmoran.com/playground/markdown-live-editor/
if (!window.MDE) {
	window.MDE = (function () {
		if (!window.getSelection) {
			return function () {
				this.HTML = document.createElement("TEXTAREA");
			};
		}

		function MDE() {
			var HTML = this.HTML = document.createElement("DIV");
			HTML.className = "MDE";

			var _ = this;
			HTML[eventTarget.add]("click", function (e) { return click.call(_, e); });
			HTML[eventTarget.add]("keyup", function (e) { return keyup.call(_, e); });

			HTML.appendChild(new Line(this).HTML);
		}
		MDE.prototype = {
			HTML: null,
			focussedLine: null
		};

		function click(e) {
			var last = this.HTML.childNodes[this.HTML.childNodes.length - 1];
			last.focus();
			last.setSelectionRange(last.value.length, last.value.length);
		}
		var keyup = (function () {
			function keyup(e) {
				var line = this.focussedLine;
				if (line) {
					console.log(findRange(line));
				}
			}

			var selection, range, returned;
			var i, l;
			function findRange(line) {
				line = line.HTML;
				selection = window.getSelection();
				for (i = 0, l = selection.rangeCount; i < l; i++) {
					range = selection.getRangeAt(i);
					console.log(range);
					if (range.commonAncestorContainer === line) {
						return range.startOffset;
					}
				}
			}

			return keyup;
		})();

		var Line = (function () {
			function Line(MDE) {
				var HTML = this.HTML = document.createElement("TEXTAREA");
				HTML.className = "line";

				var _ = this;
				HTML[eventTarget.add]("click", click);
				HTML[eventTarget.add]("focus", function (e) { return focus.call(_, e); });
				HTML[eventTarget.add]("blur", function (e) { return blur.call(_, e); });

				this.MDE = MDE;
			}
			Line.prototype = {
				HTML: null,
				MDE: null
			};

			function click(e) {
				e.stopPropagation();
				e.preventDefault();
			}
			function focus(e) {
				this.MDE.focussedLine = this;
			}
			function blur(e) {
				this.MDE.focussedLine = null;
			}

			return Line;
		})();

		return MDE;
	})();
}