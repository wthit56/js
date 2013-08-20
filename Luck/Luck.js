var used = (function () {
	var HTML = document.getElementById("used");

	var a = 1, b;
	while (a <= 6) {
		b = 1;
		while (b <= 6) {
			var roll = HTML.appendChild(document.createElement("DIV"));
			roll.className = "roll";
			roll.a = a; roll.b = b;
			roll.used = false;

			on(roll, "click", click);

			roll.appendChild(new Die["2D"](a).HTML);
			roll.appendChild(new Die["2D"](b).HTML);

			b++;
		}
		a++;
	}

	function click(e) {
		var HTML = e.target;
		if (HTML.className.indexOf("pip ") === 0) { HTML = HTML.parentNode; }
		if (HTML.className.indexOf("_") === 0) { HTML = HTML.parentNode; }
		if (HTML.className.indexOf("die ") === 0) { HTML = HTML.parentNode; }
		if (HTML.used) { return; }

		used.use.roll(HTML);
	}

	var used = { count: 0 };
	used.use = function (a, b) {
		var roll = HTML.childNodes[((a - 1) * 6) + (b - 1)];
		if (!roll) { return false; }

		return used.use.roll(roll);
	};
	used.use.roll = function (roll) {
		if (roll.used) { return false; }

		roll.className += " used";
		roll.used = true;

		used.count++;

		if (used.count === (6 * 6)) { console.log("complete"); }

		return true;
	}

	return used;
})();
