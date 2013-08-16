var Game = (function () {
	var Game = (function () {
		function Game(width, height, radius) {
			var HTML = this.HTML = document.createElement("DIV");
			HTML.style.fontSize = radius + "px";
			HTML.className = "board";

			var up = -(width + width - 1),
				topLeft = -width,
				topRight = -(width - 1);

			var widthLong = (width % 2);
			widthLong = (width - widthLong) / 2 + ((widthLong > 0) ? 1 : 0);

			var heightLong = (height % 2);
			heightLong = (height - heightLong) * 2 + ((heightLong > 0) ? 1 : 0);

			var hexes = this.hexes = [];
			var row, even
			var i = 0;
			for (var h = 0; h < heightLong; h++) {
				even = ((h + 1) % 2 === 0);

				row = HTML.appendChild(document.createElement("DIV"));
				row.className = "row" + (even ? " even" : "");

				for (var w = even ? 0 : 1; w < widthLong; w++) {
					var hex = new Hex();
					var linked;

					linked = hexes[i + up];
					if (linked) {
						hex.sides.links[0] = linked;
						linked.sides.links[3] = hex;
					}

					linked = hexes[i + topRight];
					if (linked) {
						hex.sides.links[1] = linked;
						linked.sides.links[4] = hex;
					}

					linked = hexes[i + topLeft];
					if (linked) {
						hex.sides.links[5] = linked;
						linked.sides.links[2] = hex;
					}

					hexes.push(hex);
					row.appendChild(hex.HTML);
					i++;
				}
			}
		}
		Game.prototype = {
			HTML: null,

			hexes: null,
			render: function () {
				for (var i = 0, l = this.hexes.length; i < l; i++) {
					this.hexes[i].render();
				}
			},

			findCentres: function () {
				for (var i = 0, l = this.hexes.length; i < l; i++) {
					this.hexes[i].centre.find();
				}
			}
		};

		return Game;
	})();


	var Hex = (function () {
		if (!Math.round.precision) { throw new ReferenceError("Math.round doesn't have precision."); }

		var deg_rad = Math.PI / 180;
		var rad_deg = 180 / Math.PI;
		var deg360_rad = 360 * deg_rad;
		var deg6th_rad = 360 / 6 * deg_rad;

		var handlers = {
			scroll: function (e) {
				e.stopPropagation();
				e.preventDefault();
				this.input.scroll.value += scrollWheel.get(e) * ((e.pageX - this.centre.x) < 0 ? -1 : 1);
			}
		};

		var marks = "ABCDEF";
		var side, sides, sidesTaken = [];
		function Hex() {
			var HTML = this.HTML = document.createElement("DIV");
			HTML.className = "hex";

			this.shift = 0;
			this.rotation = 0;

			var THIS = this;

			var scroll = function (e) { return handlers.scroll.call(THIS, e); };
			scroll.value = 0;
			scrollWheel.add(HTML, scroll);

			this.input = {
				scroll: scroll
			};

			sides = this.sides = new Array(6);
			sides.links = new Array(6);
			sides.render = Hex.prototype.sides.render;
			sidesTaken.length = 6;
			for (var i = 0; i < 6; i++) {
				while (true) {
					side = (Math.random() * 6) | 0;
					if (sidesTaken[side] !== true) { break; }
				}

				sidesTaken[side] = true;

				side = new Side(THIS, marks[side], i);
				sides[i] = side;

				HTML.appendChild(side.HTML);
			}
			sidesTaken.length = 0;
			sides.render();
			sides = null;

			this.centre = {
				Hex: THIS,
				x: 0, y: 0,
				find: Hex.prototype.centre.find
			};
		}
		Hex.prototype = {
			shift: 0, rotation: 0,
			input: { scroll: null },
			check: function () { },

			sides: {
				links: null,
				render: function () {
					this[0].render();
					this[1].render();
					this[2].render();
					this[3].render();
					this[4].render();
					this[5].render();
				}
			},
			getSide: function (shift) {
				return this.sides[Math.loop(shift + this.shift, 0, 6)];
			},

			centre: {
				Hex: null,
				x: 0, y: 0,
				find: function () {
					this.x = this.Hex.HTML.offsetLeft;
					this.y = this.Hex.HTML.offsetTop;
				}
			},

			render: function () {
				var input = this.input;

				var rotation = this.rotation;

				var dirty = false;

				var scroll = input.scroll.value;
				if (scroll != 0) {
					shift = this.shift + ((scroll / 3) | 0);
					shift = this.shift = (((shift % 6) + 6) % 6);

					rotation = this.rotation = shift * deg6th_rad;
					input.scroll.value = scroll % 3;

					dirty = true;
				}

				if (dirty) {
					dirty = false;

					this.sides.render();

					this.HTML.style.WebkitTransform = "rotate(" + rotation + "rad)";
				}
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
				mark.className = "mark-position";
				mark.appendChild(document.createElement("SPAN")).className = "mark";

				return template;
			})();

			function Side(hex, mark, shift) {
				this.Hex = hex;

				var HTML = this.HTML = template.cloneNode(true);
				HTML.className += " " + mark;
				HTML.invalid = HTML.childNodes[0];
				HTML.childNodes[1].childNodes[0].innerText = mark;
				HTML.style.WebkitTransform = "rotate(" + (180 + (shift * 60)) + "deg)";

				this.mark = mark;
				this.shift = shift;
			}
			Side.prototype = {
				Hex: null,
				mark: null, shift: null,
				render: function () {
					var opacity = ((this.mark === "C") && (Math.loop(this.Hex.shift + this.shift, 0, 6) === 0))
						? 1 : 0;

					var invalidStyle = this.HTML.invalid.style;
					if (invalidStyle.opacity != opacity) {
						invalidStyle.opacity = opacity;
					}
				},

				HTML: null
			};

			return Side;
		})();

		return Hex;
	})();

	return Game;
})();