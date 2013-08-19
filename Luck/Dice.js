if (!Object.create) {
	Object.create = (function () {
		function F() { }

		return function Object_create(prototype) {
			F.prototype = prototype;
			return new F();
		}
	})();
}

var Die = (function () {
	var Die = {};

	Die["3D"] = Die["3d"] = (function () {
		var className = "die _3D _3d _";

		function Die_3D(value) {
			value = value || 6;

			var HTML = this.HTML = document.createElement("DIV");
			HTML.className = className + value;

			var sides = HTML.appendChild(document.createElement("DIV"));
			sides.className = "sides";

			HTML[1] = sides.appendChild(side.create(1));
			HTML[2] = sides.appendChild(side.create(2));
			HTML[3] = sides.appendChild(side.create(3));
			HTML[4] = sides.appendChild(side.create(4));
			HTML[5] = sides.appendChild(side.create(5));
			HTML[6] = sides.appendChild(side.create(6));

			this.value = value;
		}
		Die_3D.prototype = {
			HTML: null,

			value: 6,
			setValue: function (value) {
				if (this.value === value) { return; }

				this.value = value;
				this.HTML.className = className + value;
			}
		};

		var side = {
			className: "side _",
			create: function (value) {
				var side = document.createElement("DIV");
				side.className = this.className + value;
				side.appendChild(pips.cloneNode(true));

				return side;
			}
		};

		return Die_3D;
	})();

	Die["2D"] = Die["2d"] = (function () {
		var p; // pip counter
		var className = "die _2D _2d _";

		function Die_2D(value) {
			value = value || 6;

			var HTML = this.HTML = document.createElement("DIV");
			HTML.className = className + value;

			var display = HTML.display = HTML.appendChild(document.createElement("DIV"));
			display.className = "_" + value;
			display.appendChild(pips.cloneNode(true));

			this.value = value;
		}
		Die_2D.prototype = {
			HTML: null, value: 6,

			setValue: function (value) {
				if (this.value === value) { return; }

				this.value = value;
				this.HTML.display.className = "_" + value;
			}
		};

		return Die_2D;
	})();

	var pips = (function () {
		var pips = document.createDocumentFragment();

		var pip = document.createElement("SPAN");
		pip.className = "pip ";
		pip.innerHTML = "&#149;";

		pips.appendChild(pip.cloneNode(true)).className += "topLeft";
		pips.appendChild(pip.cloneNode(true)).className += "topRight";
		pips.appendChild(pip.cloneNode(true)).className += "middleLeft";
		pips.appendChild(pip.cloneNode(true)).className += "middle";
		pips.appendChild(pip.cloneNode(true)).className += "middleRight";
		pips.appendChild(pip.cloneNode(true)).className += "bottomLeft";
		pips.appendChild(pip.cloneNode(true)).className += "bottomRight";

		return pips;
	})();

	return Die;
})();
