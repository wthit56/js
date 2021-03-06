if (!window.Replacer) {
	window.Replacer = (function () {
		function Replacer(find, replace) {
			var fn = function (input) {
				return input.replace(fn.find, fn.replace);
			}

			fn.find = find;
			fn.replace = replace;

			return fn;
		}

		Replacer.aggregate = (function () {
			var i, c, l, lastIndex;
			var findA = [];

			var groups = (function () {
				var groupsRegex;

				return function groups(find) {
					if (typeof (find) === "string") { return 0; }

					groupsRegex = new RegExp("$|" + find.source);
					return groupsRegex.exec("").length - 1;
				};
			})();

			function fixRegexGroups(find, offset) {
				return find.replace(/(\\)([1-9])/g, function (match, left, groupIndex) {
					groupIndex = (+groupIndex + offset);
					if (groupIndex > 9) {
						throw new Error("Replacer.aggregate fixRegexGroups failed: fixed groupIndex was greater than 9. Source: " + find);
					}

					return left + groupIndex;
				});
			}

			function setFlags(flags) {
				var base = this.find.base;
				this.find = new RegExp(this.find.source, flags);
				this.find.base = base;
				return this;
			}

			var replaceStringFunction = (function () {
				var find = /\$(?:(\$)|(&)|(`)|(')|(\d+))/g,
				replace = function (match, dollar, all, before, after, group) {
					return (
						dollar ? "$"
						: before ? args.input.substring(0, args.offset)
						: after ? args.input.substring(args.offset + args.match.length)
						: group ? ((args[group] != null) ? args[group] : match)
						: args.match // defualt OR all
					);
				},
				args;

				function generateReplacement(inputArgs, replaceString) {
					args = inputArgs;
					args.match = args[0];
					args.offset = args[args.length - 2];
					args.input = args[args.length - 1];

					return replaceString.replace(find, replace);
				}

				function replaceStringFunction(replaceString) {
					var fn = function () {
						return generateReplacement(arguments, replaceString);
					};
					fn.base = replaceString;
					fn.toString = function () { return this.base + "\n" + Function.prototype.toString.call(this); };
					return fn;
				};

				replaceStringFunction.empty = (function () {
					function empty() { return ""; };
					empty.toString = function () { return "[empty string]"; }
					return empty;
				})();

				return replaceStringFunction;
			})();

			return function Replacer_aggregate(replacers) {
				if (replacers instanceof Array) {
					return Replacer_aggregate.apply(this, replacers);
				}

				var find, replace, findA = [], replaceA = {};
				i = 0, c, l = arguments.length, lastIndex = 1;
				while (i < l) {
					c = arguments[i];

					find = (
						(typeof (c.find) === "string")
							? ("\\" + c.find.split("").join("\\"))
							: fixRegexGroups(c.find.source, lastIndex)
					);
					replace = (
						(typeof (c.replace) === "string")
							? ((c.replace === "")
								? replaceStringFunction.empty
								: replaceStringFunction(c.replace))
							: c.replace
					);
					replace.groups = groups(c.find);

					findA.push(find);
					replaceA[lastIndex] = replace;
					lastIndex += 1 + replace.groups;

					i++;
				}

				// create new find and replace
				find = new RegExp("(" + findA.join(")|(") + ")", "g");
				find.base = findA;
				replace = (function () {
					var index;

					return function () {
						for (index in replaceA) {
							if (arguments[index] !== undefined) {
								var args = Array.prototype.slice.call(arguments, +index, +index + replaceA[index].groups + 1);
								args.push(arguments[arguments.length - 2], arguments[arguments.length - 1]);

								return replaceA[index].apply(this, args);
							}
						}
					};
				})();

				// return
				var fn = function (input) {
					return input.replace(find, replace);
				};
				fn.find = find;
				fn.replace = replace;
				fn.replace.base = replaceA;
				fn.setFlags = setFlags;
				return fn;
			};
		})();

		return Replacer;
	})();
}