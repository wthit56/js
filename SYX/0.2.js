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

String.prototype.useSpaces=(function(){
	var find=/\t/g, replace="    ";

	return function useSpaces(tabWidth){
			if(tabWidth==null){tabWidth=4;}
			if(tabWidth!=replace.length){replace=new Array(tabWidth+1).join(" ");}
			return this.replace(find, replace);
	};
})();


function SYX(code, type) {
  	code = code.trimLines().removeIndent()//.useSpaces();

  	if (type && SYX[type]) {
  		code = SYX[type](code);
  	}

  	return code;
}

SYX["text/javascript"] = (function () {

	var part = new String("<span class=\"{class}\">{content}</span>");
	part.open = new String("<span class=\"{class}\">");
	part.close = new String("</span>");

	var parts = [
		{ // string
			find: /("|')((?:\\?[\W\w])*?)(\2)/,
			replace: (function () {
				var template = new String(
					part.replace("{class}", "string").replace("{content}",
						part.replace("{class}", "string left").replace("{content}", "{left}") +
						part.replace("{class}", "string content").replace("{content}", "{content}") +
						part.replace("{class}", "string right").replace("{content}", "{right}")
					)
				);

				return function (left, content, right) {
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

		{ // operator
			find: (function () {
				//var crement = ,
				//	comparison = {
				//		equality: ,
				//		relative: 
				//	},
				//	logical = 
				//	arithmetic = ,
				//	bit = 
				//	assignment = /=/,
				//	conditional = ,
				//	comma = /,/;

				return new RegExp(
					"((" +
					[
						/\+\+|--/.source, // other
				// assignable
							"(?:(" + /\+|-|\*|\/|%/.source + ")" + // arithmetic
							"|(" + /&|\||\^|~|<<|>>>|>>/.source + ")|\b)" + // bitwise
							"(=)?", // assigning,
						/=/.source, // assignment
						/((?:(!)|=)=(=)?)|((<|>)(=)?)/.source, // comparison
						/&&|\|\||!/.source, // logical
						/[\?:,]/.source // other
					].join(")|(") +
					"))",
				"g");
			})(),
			replace: function (
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
				var names = {
					"++": "increment",
					"--": "decrement",

					"+": "add",
					"-": "subtract",
					"*": "multiply",
					"/": "divide",

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
				var name = "operator";

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
			}
		},

		{ // dot property accessor
			find: /(\.(?=\D))/,
			replace: function (match) {
				return part.replace("{class}", "property-accessor dot").replace("{content}", match);
			}
		},

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
