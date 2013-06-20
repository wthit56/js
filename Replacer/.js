var Replacer = (function () {
	function Replacer(find, replace, options) {
		find = (
			(find instanceof RegExp) ? find
			: (typeof find === "string") ? new RegExp("\\" + find.split("").join("\\"), options)
			: null
		);
		if (find === null) { throw new Error("Invalid 'find' parameter."); }

		var fn = function (input) {
			return input.replace(find, replace);
		};
		fn.find = find;
		fn.replace = replace;
		fn.options = options || (
			(find.global ? "g" : "") +
			(find.ignoreCase ? "i" : "") +
			(find.multiline ? "m" : "") +
			(find.sticky ? "y" : "")
		);

		return fn;
	}

	var slice = Array.prototype.slice;
	Replacer.aggregate = function (find_replace) {
		if (replacers instanceof Array) {
			return Replacer.aggregate.apply(this, replacers);
		}

		var find = [], replacers = {}, last = 1, options = "";

		var i = 0, c, l = arguments.length;
		while (i < l) {
			c = arguments[i];
			find.push(c.find.source);
			replacers[last] = c.replace;
			last += c.replace.length;
			if (c.options != null) {
				options += c.options;
			}

			i++;
		}

		options = (
			((options.indexOf("g") + 1) ? "g" : "") +
			((options.indexOf("i") + 1) ? "i" : "") +
			((options.indexOf("m") + 1) ? "m" : "") +
			((options.indexOf("y") + 1) ? "y" : "")
		);

		find = new RegExp("(" + find.join(")|(") + ")", options);

		var index;
		var replace = function () {
			for (index in replacers) {
				if (arguments[index] !== undefined) {
					return replacers[index].apply(this, slice.call(arguments, +index, +index + replacers[index].length));
				}
			}
		};

		return function (input) {
			return input.replace(find, replace);
		};
	};

	return Replacer;
})();