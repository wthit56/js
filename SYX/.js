// requirements
if (!window.Replacer) { throw new Error("Replacer required"); }

// console shim
(function () {
	if (!window.console) { window.console = {}; }
	if (!console.log) { console.log = function () { }; }
	if (!console.group) { console.group = function () { console.log(name); }; }
	if (!console.groupCollapsed) { console.groupCollapsed = console.group; }
	if (!console.groupEnd) { console.groupEnd = function () { }; }
})();

String.prototype.removeIndent = (function () {
	var shortestIndent = -1, tabs = /^(\t*)\S/gm, match,
  	        find = /[\w\W]*/g, replace = "";

	return function removeIndent() {
		shortestIndent = -1, tabs.lastIndex = 0;
		match = tabs.exec(this);
		while (match) {
			if ((shortestIndent < 0) || (shortestIndent > match[0].length)) {
				shortestIndent = match[1].length;
			}
			match = tabs.exec(this);
		}
		find = new RegExp("^\\t{" + shortestIndent + "}", "gm");
		return this.replace(find, replace);
		match = null;
	};
})();

String.prototype.trimLines = (function () {
  	var find = /^[^\S\t]*|\s*$/g, replace = "";

  	return function trimLines() {
  		return this.replace(find, replace);
  	};
})();

String.prototype.useSpaces = (function () {
	var find = /\t/g, replace = "    ";

	return function useSpaces(tabWidth) {
		if (tabWidth == null) { tabWidth = 4; }
		if (tabWidth != replace.length) { replace = new Array(tabWidth + 1).join(" "); }
		return this.replace(find, replace);
	};
})();


function SYX(code, type, spaces) {
	code = code.trimLines().removeIndent();
  	if (spaces != null) { code = code.useSpaces(spaces); }

  	if (type && SYX[type]) {
  		code = SYX[type](code);
  	}

  	return code;
}

SYX["text/javascript"] = (function () {

	var part = new String("<span class=\"{class}\">{content}</span>");
	part.open = new String("<span class=\"{class}\">");
	part.close = new String("</span>");


	return Replacer.aggregate(
		{ // string
			find: /("|')((?:\\?[\W\w])*?)(\1)/,
			replace: (function () {
				var template = new String(
					part.replace("{class}", "string").replace("{content}",
						part.replace("{class}", "string left").replace("{content}", "{left}") +
						part.replace("{class}", "string content").replace("{content}", "{content}") +
						part.replace("{class}", "string right").replace("{content}", "{right}")
					)
				);

				return function (match, left, content, right) {
					return template.replace("{left}", left).replace("{content}", content).replace("{right}", right);
				};
			})()
		},

		{ // comment
			find: /((\/\/)([^\r\n]*))|((\/\*)((?:\n|.)*?)(\*\/))/,
			replace: (function () {
				var templates = {
					single: part.replace("{class}", "comment single-line").replace("{content}",
						part.replace("{class}", "comment left").replace("{content}", "{left}") +
						part.replace("{class}", "comment content")
					),
					multi: part.replace("{class}", "comment multi-line").replace("{content}",
						part.replace("{class}", "comment left").replace("{content}", "{left}") +
						part.replace("{class}", "comment content") +
						part.replace("{class}", "comment right").replace("{content}", "{right}")
					)
				};

				return function (
					match,
					is_single, single_left, single_content,
					is_multi, multi_left, multi_content, multi_right
				) {
					if (is_single) {
						return templates.single.replace("{left}", single_left).replace("{content}", single_content);
					}
					else if (is_multi) {
						return templates.multi.replace("{left}", multi_left).replace("{content}", multi_content).replace("{right}", multi_right);
					}
				};
			})()
		},

		{ // numbers (hex 0-9, integer, decimal)
			find: /(0x)?(\d+)((\.)(\d*))?/,
			replace: function (match, hex, integer, decimal, point, fraction) {
				if (hex) {
					return part.replace("{class}", "number hexadecimal").replace("{content}",
						part.replace("{class}", "number hexadecimal left").replace("{content}", hex) +
						part.replace("{class}", "number hexadecimal value").replace("{content}", integer)
					);
				}
				else if (decimal) {
					return part.replace("{class}", "number decimal").replace("{content}",
						part.replace("{class}", "number decimal integer").replace("{content}", integer) +
						part.replace("{class}", "number decimal point").replace("{content}", point) +
						part.replace("{class}", "number decimal fraction").replace("{content}", fraction)
					);
				}
				else {
					return part.replace("{class}", "number integer")
						.replace("{content}", integer);
				}
			}
		},

		{ // regex
			find: /(\/)((?:\S*?\/?)*?)(\/)([gimy]{0,4})/,
			replace: function (match, left, pattern, right, flags) {
				return part.replace("{class}", "regexp short-hand").replace("{content}",
					part.replace("{class}", "regexp short-hand left").replace("{content}", left) +
					part.replace("{class}", "regexp short-hand pattern")
						.replace("{content}", pattern) +
					part.replace("{class}", "regexp short-hand left").replace("{content}", right) +
					part.replace("{class}", "regexp short-hand flags").replace("{content}", flags)
				);
			}
		},

		{ // keyword
			find: /\b(var|let|if|else if|else|while|do|for|return|in|instanceof|function|new|with|typeof|try|catch|finally|null|break|continue)\b/,
			replace: function (keyword) {
				return part.replace("{class}", "keyword " + keyword).replace("{content}", keyword);
			}
		},

		{ // boolean
			find: /\b(true|false)\b/,
			replace: function (boolean) {
				return part.replace("{class}", "boolean " + boolean).replace("{content}", boolean);
			}
		},

		(function () {
			var names = {
				"++": "increment",
				"--": "decrement",

				"+": "add",
				"-": "subtract",
				"*": "multiply",
				"/": "divide",
				"%": "modulus",

				"&": "and",
				"|": "or",
				"^": "xor",
				"~": "not",
				"<<": "shift-left",
				">>": "shift-right",
				">>>": "shift-right-zero-fill",

				"&&": "and",
				"||": "or",
				"!": "not",

				">": "greater-than",
				"<": "less-than",

				"=": "assign",

				"?": "conditional",
				":": "colon",
				",": "comma"
			};

			function op_type(type) {
				return function (match) {
					return part.replace(
						"{class}",
						"operator" +
						(type ? " " + type : "") +
						" " + names[match]
					).replace("{content}", match);
				};
			}

			function op_assignable(type) {
				return function (match, operator, assigning) {
					return part.replace(
						"{class}",
						"operator assignable" +
						" " + type +
						" " + names[operator] +
						(assigning ? " assignment" : "")
					).replace("{content}", match);
				};
			}

			return Replacer.aggregate(
				{ // crement
					find: /\+\+|--/,
					replace: op_type("crement")
				},

				{ // logical
					find: /&&|\|\|/,
					replace: op_type("logical")
				},

				Replacer.aggregate( // assignable
					{ // arithmetic
					find: /(\+|-|\*|\/|%)(=)?/,
					replace: op_assignable("arithmetic")
				},
					{ // bitwise
						find: /(&|\||\^|~|<<|>>>|>>)(=)?/,
						replace: op_assignable("bitwise")
					}
				),

				Replacer.aggregate( // comparison
					{ // equality
					find: /(?:(!)|=)=(=)?/,
					replace: function (match, not, strict) {
						return part.replace(
								"{class}",
								"operator comparison equality" +
								(not ? " not-equal" : "") +
								(strict ? " strict" : "")
							).replace("{content}", match);
					}
				},
					{ // relative
						find: /(<|>)(=)?/,
						replace: function (match, than, or_equal_to) {
							return part.replace(
								"{class}",
								"operator comparison relative" +
								" " + (names[than]) +
								(or_equal_to ? " or-equal-to" : "")
							).replace("{content}", match);
						}
					}
				),

				{ // assignment
					find: /=/,
					replace: function (match) {
						return part.replace("{class}", "operator assignment")
							.replace("{content}", match)
					}
				},

				{ // logical not
					find: /!/,
					replace: function (match) {
						return part.replace("{class}", "operator logical not")
							.replace("{content}", match);
					}
				},

				{ // other
					find: /[?:,]/,
					replace: op_type("")
				}
			);
		})(),

		{ // dot property accessor
			find: /(\.(?=\D))/,
			replace: function (match) {
				return part.replace("{class}", "property-accessor dot").replace("{content}", match);
			}
		},

		{ // square bracket
			find: /(\[)|(\])/,
			replace: (function () {
				var isArray = /[\s=(\[]/,
					isArrayNesting = [];

				return function (match, left, right, index, input) {
					if (left) {
						if ((index == 0) || (isArray.test(input[index - 1]))) {
							isArrayNesting.push(true);
							return part.open.replace("{class}", "short-hand array") +
								part.replace("{class}", "short-hand array left")
									.replace("{content}", match);
						}
						else {
							isArrayNesting.push(false);
							return part.open.replace("{class}", "property-accessor bracket") +
								part.replace("{class}", "property-accessor bracket left")
									.replace("{content}", match);
						}
					}
					else if (right) {
						if (isArrayNesting.pop()) {
							return part.replace("{class}", "short-hand array right").replace("{content}", match) +
								part.close;
						}
						else {
							return part.replace("{class}", "property-accessor bracket right").replace("{content}", match) +
								part.close;
						}
					}

					return match;
				};
			})()
		}
	);


	{ // operator
		//find: (function () {
		//	return new RegExp(
		//		"((" +
		//		[
		//			/=/.source, // assignment
		//			/((?:(!)|=)=(=)?)|((<|>)(=)?)/.source, // comparison
		//			/&&|\|\||!/.source, // logical
		//			/[\?:,]/.source // other
		//		].join(")|(") +
		//		"))",
		//	"g");
		//})(),
		replace: (function () {
			var names = {
			};
			var name;

			return function (
				match,
				operator,
				crement,
				assignable,
					arithmetic, bitwise,
					assigning,
				assignment,
				comparison,
					equality, not, strict,
					relative, than, or_equal_to,
				logical,
				other
			) {
				name = "operator";

				if (crement || logical) {
					if (crement) { name += " crement"; }
					else if (logical) { name += " logical"; }

					name += " " + names[crement || logical];
				}
				else if (comparison) {
					name += " comparison" + (
						equality ? (
								(not ? " not" : "") +
								(equality ? " equality" : "") +
								(strict ? " strict" : "")
						)
						: relative ? (
								" " + (names[than]) +
								(or_equal_to ? " or-equal-to" : "")
						)
						: ""
					);
				}
				else if (assignable) {
					if (arithmetic) { name += " arithmetic"; }
					else if (bitwise) { name += " bitwise"; }

					if (arithmetic || bitwise) { name += " " + names[arithmetic || bitwise]; }
					if (assigning) { name += " assigning"; }
				}
				else if (assignment) { name += " assignment"; }
				else if (other) {
					name += " " + names[other];
				}

				return part.replace("{class}", name).replace("{content}", operator);
			};
		})()
	};

	var parts = [


	//{ // bracket property accessor
	//	find:/\[|\]/
	//}

	// member
	];

	var slice = Array.prototype.slice;

	var p, find = [], replace, replacers = {}, last = 1;
	for (var i = 0, l = parts.length; i < l; i++) {
		p = parts[i];
		find.push(p.find.source);
		replacers[last] = p.replace;
		last += 1 + p.replace.length;
	}
	console.log(replacers);


	find = new RegExp("(" + find.join(")|(") + ")", "g");
	console.log(find);
	replace = function () {
		for (var index in replacers) {
			if (arguments[index] !== undefined) {
				return replacers[index].apply(this, slice.call(arguments, +index + 1, +index + 1 + replacers[index].length));
			}
		}
	};

	return function (code) {
		return code.replace(find, replace);
	};
})();
