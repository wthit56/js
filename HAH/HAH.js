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

		// board
		var board = this.HTML.board = HTML.appendChild(document.createElement("DIV"));
		board.className = "board";
		board.style.width = width + "em";
		board.style.height = (height - 0.5) + "em";

		// find width of wide row
		var widthMod = (width % 2),
			widest = ((width - widthMod) / 2) + 1;

		// find number of rows
		var heightMod = (height % 2),
			rows = ((height - heightMod) * 2) + (heightMod ? 1 : 0);

		console.log(widest, rows);

		var hexes = this.hexes = []; // stores all hexes
		// hex board navigation
		var up = (widest * -2) + 1,
			topLeft = -widest,
			topRight = -widest + 1;
		var otherHex; // stores "other" hex for linking

		console.log(topLeft, up, topRight);

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

				// link adjacent hexes
				// top left
				if ((x > initialX) && (y > 0)) {
					otherHex = hexes[h + topLeft]; // find other hex
					if (otherHex) { // hex found
						newHex.adjacent[5] = otherHex; // link new to adjacent
						otherHex.adjacent[2] = newHex; // link adjacent to new
					}
				}
				if (y > 0) {
					// top
					otherHex = hexes[h + up]; // find other hex
					if (otherHex) {
						newHex.adjacent[0] = otherHex; // link new to adjacent
						otherHex.adjacent[3] = newHex; // link adjacent to new
					}
				}
				if (x < widest - 1) {
					// top right
					otherHex = hexes[h + topRight]; // find other hex
					if (otherHex) {
						newHex.adjacent[1] = otherHex; // link new to adjacent
						otherHex.adjacent[4] = newHex; // link adjacent to new
					} 
				}

				if (left) {
					newHex.HTML.className += " left";
					left = false;
				}
				row.appendChild(newHex.HTML);
				hexes.push(newHex);

				h++;
				x++;
			}

			y++;
		}

		newHex = otherHex = null;

		board.appendChild(document.createElement("BR"));
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

		function Hex(game) {
			this.Game = game;

			var HTML = this.HTML = document.createElement("DIV");
			HTML.className = "hex";
			HTML.Hex = this;

			var THIS = this;

			var sides = this.sides = new Array(6);
			sides.Hex = this;
			sides.get = getShifted;

			var adjacent = this.adjacent = [];
			adjacent.Hex = this;
			adjacent.get = getShifted;

			var taken = marks.taken;
			taken.length = 6;
			var s = 0, taken = marks.taken;
			while (s < 6) {
				var markIndex = (marks.length * Math.random()) | 0;
				if (taken[markIndex] !== true) {
					var newSide = sides[s] = side.clone(marks[markIndex]);
					newSide.style.WebkitTransform = "rotate(" + (180 + (s * 60)) + "deg)";
					HTML.appendChild(newSide);

					taken[markIndex] = true;
					s++;
				}
			}
			taken.length = 0;

			this.dirty = true;
		}
		Hex.prototype = {
			Game: null, // parent Game

			shift: 0,
			adjacent: { // []
				Hex: null, // containing Hex
				get: getShifted
			},
			sides: { // []
				Hex: null, // containing Hex
				get: getShifted
			},

			dirty: true,
			render: function (time) {
				if (!this.dirty) { return; }

				updateSide.call(this, 0);
				updateSide.call(this, 1);
				updateSide.call(this, 2);
				updateSide.call(this, 3);
				updateSide.call(this, 4);
				updateSide.call(this, 5);
			}
		};

		function getShifted(index) {
			return this[Math.loop(this.Hex.shift + index, 0, 6)];
		}
		function updateSide(index) {
			var adjacent = this.adjacent.get(index);
			if (adjacent) {
				var side = this.sides.get(index);
				var adjacentSide = adjacent.sides.get(index + 3);
				var colour = ((side.mark === adjacentSide.mark) ? "red" : null);
				var style = side.style;
				if (style.borderBottomColor != colour) {
					style.borderBottomColor = colour;
				}
			}
		}

		return Hex;
	})();

	return Game;
})();