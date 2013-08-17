var Game = (function () {
	function Game(width, height) {
		var HTML = this.HTML = document.createElement("DIV");
		HTML.className = "game";

		var board = this.HTML.board = HTML.appendChild(document.createElement("DIV"));
		board.className = "board";

		var widthMod = (width % 2),
			evenWidth = ((width - widthMod) / 2) + (widthMod ? 1 : 0);

		var heightMod = (height % 2),
			rows = ((height - heightMod) * 2) + (heightMod ? 1 : 0);

		console.log(evenWidth, rows);

		var hexes = this.hexes = [];

		var x, y = 0, left = false;
		while (y < rows) {
			var even = (((y + 1) % 2) === 0);

			var row = board.appendChild(document.createElement("DIV"));
			row.className = "row" + (even ? " even" : "") + ((y === 0) ? " first" : "");

			left = true;
			x = (even ? 0 : 1);
			while (x < evenWidth) {
				var newHex = new Hex(this);
				if (left) {
					newHex.HTML.className += " left";
					left = false;
				}
				row.appendChild(newHex.HTML);
				hexes.push(newHex);

				x++;
			}

			y++;
		}

		board.appendChild(document.createElement("BR"));
	}
	Game.prototype = {
		HTML: null
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

			var THIS = this;

			var sides = this.sides = new Array(6);
			sides.get = function (index) {
				return Hex.prototype.sides.get.call(THIS, index);
			};

			var taken = marks.taken;
			taken.length = 6;
			var s = 0;
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
		}
		Hex.prototype = {
			shift: 0,

			sides: { // []
				get: function (index) {
					return this.sides[Math.loop(this.shift + index, 0, 6)];
				}
			}
		};

		return Hex;
	})();

	return Game;
})();