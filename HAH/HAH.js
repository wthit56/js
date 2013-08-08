var Hex = (function () {
	if (!Math.round.precision) { throw new ReferenceError("Math.round doesn't have precision."); }

	var deg_rad = Math.PI / 180;
	var rad_deg = 180 / Math.PI;
	var deg360_rad = 360 * deg_rad;
	var deg6th_rad = 360 / 6 * deg_rad;


	function Hex() {
		var HTML = this.HTML = document.createElement("DIV");
		HTML.className = "hex";

		var THIS = this;

		var scroll = this.input.scroll = function (e) { return handlers.scroll.call(THIS, e); };
		scroll.value = 0;
		scrollWheel.add(HTML, scroll);

		var hexSides = this.sides = new Array(6);
		sides.prep();
		for (var i = 0; i < 6; i++) {
			var hexSide = sides.get();
			HTML.appendChild(hexSide);
		}
		this.marks = sides.marks;
		sides.reset();

		this.shift = 0;
		this.rotation = 0;
	}
	Hex.prototype = {
		marks: "ABCDEF", shift: 0, rotation: 0,
		input: { scroll: null },
		check: function () { },

		render: function () {
			var input = this.input;

			var rotation = this.rotation;

			var scroll = input.scroll.value;
			if (scroll != 0) {
				shift = this.shift + (scroll / 3) | 0;
				shift = this.shift = (((shift % 6) + 6) % 6);

				rotation = this.rotation = shift * deg6th_rad;
				input.scroll.value = scroll % 3;
			}

			this.HTML.style.WebkitTransform = "rotate(" + rotation + "rad)";
		}
	};

	var handlers = {
		scroll: function (e) {
			this.input.scroll.value += scrollWheel.get(e);
		}
	};

	Hex.snapRotation = function (radians) {
		return Math.round(Math.loop(radians, 0, deg360_rad), deg6th_rad);
	};
	Hex.findShift = function (radians) {
		return Math.round(Math.loop(radians, 0, deg360_rad) / deg6th_rad);
	};

	var Side = (function () {
		var template = (function () {
			var template = document.createElement("SPAN");
			template.className = "side";

			var invalid = template.appendChild(document.createElement("SPAN"));
			invalid.className = "invalid";

			var mark = template.appendChild(document.createElement("SPAN"));
			mark.className = "mark";
			mark.appendChild(document.createElement("SPAN"));

			return template;
		})();

		function Side(hex, mark, shift) {
			this.Hex = hex;

			var HTML = this.HTML = template.cloneNode(true);
			HTML.childNodes[1].childNodes[0].innerText = mark;
			HTML.style.WebkitTransform = "rotate(" + (shift * 60) + "deg)";

			this.shift = shift;
		}
		Side.prototype = {
			Hex: null,

			HTML: null, shift: null,

			dirty: false,
			render: function () {
				if (!this.dirty) { return; }

				this.dirty = false;
				this.Hex.shift + this.shift;
			}
		};

		return Side;

		//var sides = [];
		//sides.template = (function () {
		//	var sideTemplate = document.createElement("SPAN");
		//	sideTemplate.className = "side";

		//	var invalid = sideTemplate.appendChild(document.createElement("SPAN"));
		//	invalid.className = "invalid";

		//	var mark = sideTemplate.appendChild(document.createElement("SPAN"));
		//	mark.className = "mark";
		//	mark.appendChild(document.createElement("SPAN"));

		//	return sideTemplate;
		//})();
		//sides.possibleMarks = "ABCDEF";
		//sides.prep = function () {
		//	this.length = this.possibleMarks.length;
		//};
		//sides.got = 0;
		//sides.get = function () {
		//	var possibles = this.possibleMarks;
		//	if (this.got >= possibles.length) { return null; }

		//	var side;
		//	while (true) {
		//		side = (Math.random() * possibles.length) | 0;
		//		if (this[side] !== true) { break; }
		//	}

		//	this[side] = true;
		//	side = possibles[side];
		//	this.marks += side;

		//	var sideClone = this.template.cloneNode(true);
		//	sideClone.className += " " + side;
		//	sideClone.childNodes[1].childNodes[0].innerHTML = side;
		//	sideClone.style.WebkitTransform = "rotate(" + (180 + (sides.got * 60)) + "deg)";

		//	this.got++;

		//	return sideClone;
		//};
		//sides.reset = function () {
		//	this.length = 0;
		//	this.got = 0;
		//};

		//return sides;
	})();

	return Hex;
})();
