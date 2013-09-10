var Game = (function () {
	// board creation variables
	var row; // current row element
	var even; // true when current row is even
	var h; // hex count
	var initialX; // initial x value for current row
	var x, y; // current x and y board position
	var left; // is first hex in current row
	var newHex;

	function Game(width, height) {
		// game container element
		var HTML = this.HTML = document.createElement("DIV");
		HTML.className = "game";
		document.body.appendChild(HTML);

		// board
		var board = this.HTML.board = HTML.appendChild(document.createElement("DIV"));
		board.className = "board";

		// find width of wide row
		var widthMod = (width % 2),
			widest = ((width - widthMod) / 2) + 1;

		// find number of rows
		var heightMod = (height % 2),
			rows = ((height - heightMod) * 2) + (heightMod ? 1 : 0);

		console.log(width, height);
		board.style.width = (width - (0.1333333333333333 * (widthMod ? 2 : 3))) + "em";
		board.style.height = (height + (heightMod ? 0 : 0.5)) + "em";

		var hexes = this.hexes = []; // stores all hexes
		// hex board navigation
		var top = (widest * -2) + 1,
			topLeft = -widest,
			topRight = -widest + 1;
		var otherHex; // stores "other" hex for linking

		// set initial values for board creation
		h = 0, y = 0;
		// for every row
		while (y < rows) {
			even = (((y + 1) % 2) === 0); // true when row is even

			// row element
			row = board.appendChild(document.createElement("DIV"));
			// even rows will have "even" class
			// the first row will have "first" class
			row.className = "row" + (even ? " even" : "") + ((y === 0) ? " first" : "");

			// set initial values for hex creation on the current row
			left = true; // current hex is first on row
			initialX = x = ((even && widthMod) ? 0 : 1); // there will be one less hex on this row
			// when row and width are even

			// for every hex on this row
			while (x < widest) {
				// create new hex
				newHex = new Hex(this);
				newHex.centre.x = 0.5 + (even ? 0 : 0.8660254037844386) + ((x - initialX) * 1.7320508075688772);
				newHex.centre.y = 0.5 + (y * 0.5);
				newHex.shift = (6 * Math.random()) | 0;

				if (left) {
					newHex.HTML.className += " left";
					left = false;
				}
				row.appendChild(newHex.HTML);
				hexes.push(newHex);

				// link adjacent hexes
				//	the only available hexes will be on the previous row
				if (y > 0) {
					// top-left
					if (!even || (x > initialX)) {
						otherHex = hexes[h + topLeft]; // find other hex
						if (otherHex) { // hex found
							newHex.adjacent[5] = otherHex; // link new to adjacent
							otherHex.adjacent[2] = newHex; // link adjacent to new
						}
						else { throw new ReferenceError("No top-left Hex found to link."); }
					}

					// top
					if (y > 1) {
						otherHex = hexes[h + top]; // find other hex
						if (otherHex) {
							newHex.adjacent[0] = otherHex; // link new to adjacent
							otherHex.adjacent[3] = newHex; // link adjacent to new
						}
						else { throw new ReferenceError("No top Hex found to link."); }
					}

					// top-right
					if (!even || (x < widest - 1)) {
						otherHex = hexes[h + topRight]; // find other hex
						if (otherHex) {
							newHex.adjacent[1] = otherHex; // link new to adjacent
							otherHex.adjacent[4] = newHex; // link adjacent to new
						}
						else { throw new ReferenceError("No top-right Hex found to link."); }
					}
				}

				h++;
				x++;
			}

			y++;
		}

		newHex = otherHex = null;

		board.appendChild(document.createElement("BR"));

		this.telemetry = {
			Game: this, offset: { x: 0, y: 0 }, fontSize: 150,
			update: Game.prototype.telemetry.update
		};
	}
	Game.prototype = {
		HTML: null,

		render: function () {
			var time = +new Date();

			var hexes = this.hexes, hex;
			var i = 0, l = hexes.length;
			while (i < l) {
				hex = hexes[i];
				if (hex.dirty) {
					hex.render();
				}

				i++;
			}
		},
		telemetry: {
			Game: null, // containing Game object
			fontSize: 150, offset: { x: 0, y: 0 },
			update: function () {
				var HTML = this.Game.HTML;
				HTML.style.width = window.innerWidth + "px";
				HTML.style.height = window.innerHeight + "px";

				var board = HTML.board;
				this.offset.x = (board.parentNode.offsetWidth - board.offsetWidth) / 2;
				this.offset.y = (board.parentNode.offsetHeight - board.offsetHeight) / 2;
			}
		}
	};

	var Hex = (function () {
		var marks = new String("ABCDEF");
		marks.taken = [];

		var side = (function () {
			var side = document.createElement("SPAN");
			side.className = "side";

			side.appendChild(document.createElement("SPAN")).className = "invalid";

			var markPosition = side.appendChild(document.createElement("SPAN"));
			markPosition.className = "mark-position";

			markPosition.appendChild(document.createElement("SPAN")).className = "mark";

			side.clone = function (mark) {
				var newSide = this.cloneNode(true);

				newSide.mark = mark;
				newSide.className = "side " + mark;
				newSide.childNodes[1].childNodes[0].innerHTML = mark;

				newSide.invalid = newSide.childNodes[0];

				return newSide;
			};

			return side;
		})();

		function scroll(e) {
			var scroll = scrollWheel.getY(e);
			if (scroll) {
				var Hex = e.target.Hex || e.target.parentNode.Hex || e.target.parentNode.parentNode.Hex || e.target.parentNode.parentNode.parentNode.Hex;
				if (!Hex) { console.error("Not a valid scroll: ", e); }

				var Game = Hex.Game;
				var left = (e.pageX < Game.telemetry.offset.x + (Hex.centre.x * Game.telemetry.fontSize));
				Hex.shift = Math.loop(Hex.shift + (scroll / 3 * (left ? -1 : 1)), 0, 6);

				console.log(Hex.shift);

				Hex.dirty = true;
				Hex.render();

				for (var i = 0; i < 6; i++) {
					var otherHex = Hex.adjacent[i];
					if (otherHex) {
						otherHex.dirty = true;
						otherHex.render();
					}
				}
			}
		}

		function Hex(game) {
			this.Game = game;

			var HTML = this.HTML = document.createElement("DIV");
			HTML.className = "hex";
			HTML.Hex = this;

			var THIS = this;

			var sides = this.sides = new Array(6);
			sides.Hex = this;
			sides.get = Hex.prototype.sides.get;

			var adjacent = this.adjacent = [];
			adjacent.Hex = this;
			adjacent.get = Hex.prototype.adjacent.get;

			var taken = marks.taken;
			taken.length = 6;
			var s = 0, taken = marks.taken;
			while (s < 6) {
				var markIndex = (marks.length * Math.random()) | 0;
				if (taken[markIndex] !== true) {
					var newSide = sides[s] = side.clone(marks[markIndex]);
					newSide.style.WebkitTransform = "rotate(" + (-180 + (s * 60)) + "deg)";
					HTML.appendChild(newSide);

					taken[markIndex] = true;
					s++;
				}
			}
			taken.length = 0;

			this.dirty = true;

			this.centre = { x: 0, y: 0 };
			scrollWheel.add(HTML, scroll);
		}
		Hex.prototype = {
			HTML: null, // HTML Element
			Game: null, // parent Game

			centre: { x: 0, y: 0 },

			shift: 0,
			adjacent: { // []
				Hex: null, // containing Hex
				get: function (index) {
					return this[Math.loop(index, 0, 6)];
				}
			},
			sides: { // []
				Hex: null, // containing Hex
				get: function (index) {
					return this[Math.loop(index - this.Hex.shift, 0, 6)];
				}
			},

			dirty: true,
			render: function (time) {
				if (!this.dirty) { return; }

				this.HTML.style.WebkitTransform = "rotate(" + (this.shift * 60) + "deg)";

				updateSide.call(this, 0);
				updateSide.call(this, 1);
				updateSide.call(this, 2);
				updateSide.call(this, 3);
				updateSide.call(this, 4);
				updateSide.call(this, 5);

				this.dirty = false;
			}
		};

		function updateSide(index) {
			var adjacent = this.adjacent.get(index);
			var side = this.sides.get(index);
			var colour;
			if (adjacent) {
				var adjacentSide = adjacent.sides.get(index + 3);
				colour = ((side.mark === adjacentSide.mark) ? "red" : null);
			}
			else {
				colour = null;
			}

			var style = side.style;
			if (style.borderBottomColor != colour) {
				style.borderBottomColor = colour;
			}
		}

		return Hex;
	})();

	return Game;
})();