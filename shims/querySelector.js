var findString = /(["'])((?:(?=\\|(?!\1))[\W\w])*)\1/;

if (!String.prototype.escape) {
	String.prototype.escape = (function () {
		var findUnsafe = /\\?(['"{}<>])/g;

		return function () {
			return this.replace(findUnsafe, "\\$1");
		};
	})();
}
if (!String.prototype.unescape) {
	String.prototype.unescape = (function () {
		var findDoubleQuotes = /\\?"/g;

		return function () {
			var string;
			eval("string = \"" + string.replace(findDoubleQuotes, "\\\"") + "\";");
			return string;
		};
	})();
}

if (!Array.prototype.forEach) {
	Array.prototype.forEach = function (callback, context) {
		if (context === undefined) { context = window; }
		var i = 0, l = this.length;
		while (i < l) {
			callback.call(context, this[i], i, this);
			i++;
		}
	};
}
if (!Array.prototype.some) {
	Array.prototype.some = function (callback, context) {
		if (context === undefined) { context = window; }
		var i = 0, l = this.length;
		while (i < l) {
			if (callback.call(context, this[i], i, this) === true) { return true; }
			i++;
		}

		return false;
	};
}
if (!Array.prototype.map) {
	Array.prototype.map = function (callback) {
		var mapped = new Array(this.length);
		
		var i = 0, l = this.length;
		while (i < l) {
			mapped[i] = callback(this[i], i, this);
			i++;
		}

		return mapped;
	};
}
if (!Array.prototype.filter) {
	Array.prototype.filter = function (callback) {
		var filtered = [];
		
		var i = 0, l = this.length;
		while (i < l) {
			if (callback(this[i], i, this)) { filtered.push(this[i]); }
			i++;
		}

		return filtered;
	};
}

if (!NodeList.prototype.filter) {
	NodeList.prototype.filter = function (check) {
		return Array.prototype.filter.call(this, check);
	};
}

if (!RegExp.prototype.forEach) {
	RegExp.prototype.forEach = (function (global) {
		return function (input, callback, some) {
			var found, result, lastIndex = this.lastIndex = 0;

			while (true) {
				found = this.exec(input);
				if (!found) { break; }

				if (this.lastIndex === lastIndex) {
					this.lastIndex++;
					continue;
				}
				lastIndex = this.lastIndex;

				found.push(found.index, input);
				var result = callback.apply(global, found);
				if (some && (result === true)) { return true; }
			}

			if (some) { return false; }
		}
	})(this);
}
if (!String.prototype.forEachMatch) {
	String.prototype.forEachMatch = function (regex, callback) {
		return regex.forEach(this, callback);
	};
}

if (!RegExp.prototype.map) {
	RegExp.prototype.map = function (input, mapping) {
			var returnValue = [];
			this.forEach(input, function () {
				returnValue.push(mapping.apply(this, arguments));
			});
			return returnValue;
		};
}
if (!String.prototype.mapMatches) {
	String.prototype.mapMatches = function (regex, mapping) {
		return regex.map(this, mapping);
	};
}

if (!RegExp.prototype.some) {
	String.prototype.some = (function () {
		return function (input, check) {
			return this.forEach(input, check, true);
		}
	})();
}

if (!String.prototype.someMatches) {
	String.prototype.someMatches = function (regex, check) {
		return regex.some(this, check);
	};
}

///((?:[^'",]*(?:(["'])(?:(?:\\|(?!\2))[\W\w])*\2)?)+)(?:,\s*|$)/g.forEach(
//	"body div.class[attr='com,ma'][attr2=\"com,ma\"], found",
//	function (match, found) {
//		console.log("found: " + found);
//	}
//);

///((?:[^'"\s]*(?:(["'])(?:(?:\\|(?!\2))[\W\w])*\2)?)+)/g.forEach(
//	"found",
//	function (match, found) {
//		console.log("found value: " + found);
//	}
//);



var qsa = (function () {
	var findSelectors = /((?:[^'",]*(?:(["'])(?:(?:\\|(?!\2))[\W\w])*\2)?)+)(?:,\s*|$)/g;
	var found, lastIndex;
	var returnValue;

	var first;
	function qsa(selectors, getFirst) {
		first = !!getFirst;
		findSelectors.forEach(selectors, selector);
		var localReturn = returnValue;
		returnValue = undefined;
		return localReturn;
	}

	var selector = (function () {
		var findElements = /((?:[^'"\s+~>]*(?:(["'])(?:(?:\\|(?!\2))[\W\w])*\2)?)+)/g;

		var selector = selectorHandler = function selector(match, selector, from) {
			if (!(selector instanceof Array)) {
				selector = findElements.map(selector, element);
			}

			console.group("parsing selector: " + selector.map(function (e) { return e.original }).join(" "));

			var i = selector.length - 1, check;
			// find last id
			if (!from) {
				var base;
				while (i >= 0) {
					check = selector[i];
					if (check.id) {
						base = document.getElementById(check.id);

						if (base && check(base) && checkUp(selector, i, base)) {
							if (i < selector.length - 1) {
								return selectorHandler(null, selector.slice(i + 1), base);
							}
							else {
								return base;
							}
						}
						else {
							return null;
						}
					}
					i--;
				}
			}

			if (!from) { from = document; }
			var list;
			i = selector.length - 1;
			var lastUsed = null, newList;
			while (i >= 0) {
				check = selector[i];
				if (check.hasName) {
					console.log("name: " + check.hasName);
					newList = getShorterList(list, from.getElementsByName(check.hasName));
					if (newList !== list) {
						list = newList;
						lastUsed = i;
						if (list.length <= 1) { break; }
					}
				}
				if (check.classes.length) {
					check.classes.some(function (className) {
						console.log("class: " + className);
						newList = getShorterList(list, from.getElementsByName(className));
						if (newList !== list) {
							list = newList;
							lastUsed = i;
							if (list.length <= 1) { return true; }
						}
					});
					if (list.length <= 1) { break; }
				}
				if (check.tag) {
					console.log("tagName: " + check.tag);
					newList = getShorterList(list, from.getElementsByTagName(check.tag));
					if (newList !== list) {
						list = newList;
						lastUsed = i;
						if (list.length <= 0) { break; }
					}
				}g

				i--;
			}

			if (!list) { return null; }
			else {
				newList = null;
				list = list.filter(function (node) {
					return (
						selector[lastUsed](node) &&
						checkUp(selector, lastUsed, node, from)
					);
				});


				if (lastUsed === selector.length - 1) {
					console.groupEnd();
					return list;
				}
			}

			console.groupEnd();
			return null;
		};

		function getShorterList(listA, listB) {
			return (listA && (!listB || (listA.length < listB.length)))
				? listA : listB;
		}

		var checkUp = function (selector, from, element, to) {
			if (!to) { to = document; }

			// TODO: relation selector

			var check;

			while (true) {
				from--;
				if (from <= 0) { break; }

				check = selector[from];
				while (element) {
					element = element.parentNode;
					if (!element || (element === to)) { return false; }
					if (check(element)) { break; }
				}
			}

			return true;
		};

		var element = (function () {
			// var findString = /(["'])((?:(?:\\|(?!\1))[\W\w])*)\1/;
			// /(?:\[\s*([^~|^$*\]=\s]+)\s*(?:([~|^$*])?=\s*(?:(["'])([^\3]*?)\3|([^\]]*)))?\])|(?:::?([^#.+~>[:(\s]+)(?:\(([^\)]*)\))?)|(?:(^|[#.]|::?)([^#.+~>[:(\s]+))/g
			var findAttr = /\[\s*([^~|^$*=\]\s]*)\s*(?:([~|^$*])?=\s*(?:([^"'\s\]]*)|(["'])((?:(?=\\|(?!\4))[\W\w])*)\4)?)?\s*\]/g;
			//var findPseudo = /::?([^#.+~>[:(\s]*)(?:\(((?:[^\)'"]*(?:(["']?)((?:(?=\\|(?!\3)))[\W\w])*\3))*)*\))?/g;
			//var findPseudo = /::?([^#.+~>[:(\s]*)(?:\(((?:[^\)'"]*(?:(["'])(?:(?=\\|(?!\3))[\W\w])*\3))*)*\))?/g;
			var findPseudo = /::?([^#.+~>[:(\s]*)(?:\(((?:[^\)'"]*(?:(["'])(?:\\\3|(?!\3)[\W\w])*\3)*)*)\))?/g;
			var findNamed = /(^|[#.]?)([^#.+~>[:(\s]*)/g;

			var findParts = new RegExp(
				findAttr.source + "|" +
				findPseudo.source.replace(/\\3/g, "\\8") + "|" +
				findNamed.source,
				"g"
			);
			//console.log(findParts);

			var build = {
				tag: null, name: null, id: null,
				needsHash: false, needsChildAt: false, needsOfTypeAt: false,
				classes: [], attrs: [], classedAttrs: [], pseudo: [],
				failed: false,

				reset: function () {
					this.tag = this.name = this.id = null;
					this.needsHash = this.needsChildAt = this.needsOftypeAt = null;

					this.classes = [];
					this.classes.dictionary = {};

					this.attrs.length = 0;
					for (var key in this.attrs.dictionary) {
						delete this.attrs.dictionary[key];
					}

					this.classedAttrs.length = 0;
					for (var key in this.classedAttrs.dictionary) {
						delete this.classedAttrs.dictionary[key];
					}

					this.failed = false;
				}
			};
			build.classes.dictionary = {};
			build.attrs.dictionary = {};
			build.classedAttrs.dictionary = {}; build.classedAttrs.classed = true;

			var cache = {};

			function element(match, element) {
				if (cache[element]) { return cache[element]; }

				var built = findParts.map(element, createPartCheck);
				if (build.failed) {
					throw new SyntaxError("Query '" + element + "' not a valid selector.");
				}

				built = new Function(
					"self",
					((build.classes.length) ?
						 "var className = ' ' + this.className + ' ';\n\n" : "") +
					((build.attrs.length) ?
						 "var attrs = {\n\t" + build.attrs.map(mapAttrs).join(",\n\t") + "\n};\n\n" : "") +
					((build.classedAttrs.length) ?
						 "var classedAttrs = {\n" + build.classedAttrs.map(mapAttrs).join(",\n\t") + "\n};\n\n" : "") +
					((build.needsHash) ?
						"var hash = window.location.hash;\n" +
						"if(hash){ hash = hash.substring(1); }\n\n" : "") +
					"return (\n" +
						"(\n\t" +
							built.filter(isNotNull).join(") &&\n\t(") +
						")" +
						(build.pseudo.length ? " &&\n\t(self.pseudoCheck.call(this))" : "") +
					"\n);"
				);
				var wrapped = function (node) {
					return built.call(node, wrapped);
				};
				wrapped.original = element;

				if (build.pseudo.length) {
					var pseudos = build.pseudo;
					wrapped.pseudoCheck = function () {
						return pseudoCheck.apply(this, pseudos);
					};
				}
				if (build.needsChildAt) {
					wrapped.isChildAt = isChildAt;
				}
				if (build.needsOfTypeAt) {
					wrapped.isOfTypeAt = isOfTypeAt;
				}

				//console.log(JSON.stringify(build, null, "	"));

				wrapped.tag = build.tag;
				wrapped.hasName = build.name;
				wrapped.id = build.id;
				wrapped.classes = build.classes; delete wrapped.classes.dictionary;

				func = ""; build.reset();
				console.groupEnd();

				cache[element] = wrapped;
				return wrapped;
			}
			function isOfTypeAt(n) {
				var parent = this.parentNode;
				var siblings = (parent.children || parent.childNodes);
				var sibling;
				var tagName = this.tagName;
				var i, t = 0;

				if (n >= 0) {
					i = t = 0;
					var l = siblings.length;
					while (i < l) {
						sibling = siblings[i];
						if (sibling === this) {
							return (t === n);
						}
						else if (sibling.tagName === tagName) {
							t++;
							if (t > n) { return false; }
						}

						i++;
					}
				}
				else {
					n = -n;
					i = t = 1; l = siblings.length;
					while (l) {
						sibling = siblings[l];

						if (sibling === this) {
							return (t === n);
						}
						else if (sibling.tagName === tagName) {
							t++;
							if (t > n) { return false; }
						}

						i++; l--;
					}
				}

				return false;
			}
			function isChildAt(n) {
				var parent = this.parentNode;
				var siblings = parent.children;

				if (siblings) { // elements only
					if (n >= 0) { return (siblings[n] === this); }
					else { return (siblings[siblings.length + n] === this); }
				}
				else { // elements and text nodes
					siblings = parent.childNodes;
					var sibling;
					var i, e, l;
					if (n >= 0) {
						var sibling;
						var i = e = 0, l = siblings.length;
						while (i < l) {
							sibling = siblings[i];
							if (sibling.nodeType === 1) {
								if (sibling === this) { return true; }
								e++;
								if (e > n) { return false; }
							}

							i++;
						}
					}
					else {
						i = e = 1; l = siblings.length;
						while (i < l) {
							sibling = siblings[l];
							if (sibling.nodeType === 1) {
								if (sibling === this) { return true; }
								e++;
								if (e > n) { return false; }
							}
							i++; l--;
						}
					}
				}

				return false;
			}
			function isNotNull(value) { return (value !== null); }
			function mapAttrs(name, index, names) {
				return name = "" +
					"'" + name + "': " +
					(names.classed ? "' '+" : "") +
						"this.getAttribute('" + name + "')" +
					(names.classed ? "+' '" : "") +
				"";
			}
			function pseudoCheck(pseudos) {
				var i = -1, l = arguments.length;
				var pseudo, working;
				while (true) {
					pseudo = arguments[++i];
					if (!pseudo) { return true; }

					switch (pseudo.name) {
						case "matches": case "not":
							if (selector(null, pseudo.value)(this)) {
								if (pseudo.name === "not") { return false; }
							}
							else if (pseudo.name === "matches") { return false; }
							break;
					}
				}
			}

			function createPartCheck(match,
				attrName, attrType, attrValue, attrQuote, attrQuotedValue,
				pseudoName, pseudoValue, pseudoQuote,
				namedType, named
			) {
				//console.log(arguments);

				if (attrName) {
					if (attrType === "~") {
						if (!build.classedAttrs.dictionary[attrName]) {
							build.classedAttrs.push(attrName);
							build.classedAttrs.dictionary[attrName] = true;
						}
					}
					else {
						if (!build.attrs.dictionary[attrName]) {
							build.attrs.push(attrName);
							build.attrs.dictionary[attrName] = true;
						}
					}

					var attrNameStr = attrName.escape();
					if (!attrValue) { attrValue = attrQuotedValue; }

					if (attrValue != null) {
						var attrValueStr = attrValue.escape();
						switch (attrType) {
							case "~":
								return "classedAttrs['" + attrNameStr + "'].indexOf(' " + attrValueStr + " ')";
							case "|":
								return "attrs['" + attrNameStr + "'].indexOf('" + attrValueStr + "-') === 0";
							case "^":
								return "attrs['" + attrNameStr + "'].indexOf('" + attrValueStr + "') === 0";
							case "$":
								return "attrs['" + attrNameStr + "'].lastIndexOf('" + attrValueStr + "') === (attrs['" + attrNameStr + "'].length - " + attrValue.length + ")";
							case "*":
								return "attrs['" + attrNameStr + "'].indexOf('" + attrValueStr + "') !== -1";
							default:
								if (attrName === "name") { build.name = attrValue; }
								return "attrs['" + attrNameStr + "'] === '" + attrValueStr + "'";
						}
					}
					else {
						return "attrs['" + attrNameStr + "'] != null";
					}
				}
				else if (pseudoName) {
					if ((pseudoName === "not") || (pseudoName === "match")) {
						build.pseudo.push({ name: pseudoName, value: pseudoValue });
						return null;
					}
					else {
						switch (pseudoName) {
							case "focus":
								return "document.activeElement === this";
								break;
							case "empty":
								return "this.childNodes.length === 0"
								break;

							case "target":
								build.needsHash = true;
								return "(hash && (this.id === hash))";
								break;

							case "checked":
								if (build.tagName) {
									switch (build.tagName) {
										case "option":
											return "this.selected";
											break;
										case "input":
											return "((this.type === 'radio') || (this.type === 'checkbox')) && (this.checked)";
											break;
										default:
											build.failed = true;
											return;
									}
								}
								else {
									return "\n" +
										"\t((this.tagName === 'option') && (this.selected)) ||\n" +
										"\t(\n" +
										"\t\t(this.tagName === 'input') &&\n" +
										"\t\t((this.type === 'radio') || (this.type==='checkbox')) &&\n" +
										"\t\t(this.checked)\n" +
										"\t)\n" +
									"";
								}
								break;

							case "disabled":
								return "this.disabled";
							case "enabled":
								return "!this.disabled";

							case "first-child":
								build.needsChildAt = true;
								return "self.isChildAt.call(this, 0)";
							case "last-child":
								build.needsChildAt = true;
								return "self.isChildAt.call(this, -1)";
							case "nth-child":
								pseudoValue = parseInt(pseudoValue);
								if (isNaN(pseudoValue) || (pseudoValue < 0)) { build.failed = true; return; }
								build.needsChildAt = true;
								return "self.isChildAt.call(this, " + pseudoValue + ")";
							case "nth-last-child":
								pseudoValue = parseInt(pseudoValue);
								if (isNaN(pseudoValue) || (pseudoValue < 1)) { build.failed = true; return; }
								build.needsChildAt = true;
								return "self.isChildAt.call(this, -" + pseudoValue + ")";

							case "first-of-type":
								build.needsOfTypeAt = true;
								return "self.isOfTypeAt.call(this, 0)";
							case "last-of-type":
								build.needsOfTypeAt = true;
								return "self.isOfTypeAt.call(this, -1)";
							case "nth-of-type":
								pseudoValue = parseInt(pseudoValue);
								if (isNaN(pseudoValue) || (pseudoValue < 0)) { build.failed = true; return; }
								build.needsOfTypeAt = true;
								return "self.isOfTypeAt.call(this, " + pseudoValue + ")";
							case "nth-last-of-type":
								pseudoValue = parseInt(pseudoValue);
								if (isNaN(pseudoValue) || (pseudoValue < 1)) { build.failed = true; return; }
								build.needsOfTypeAt = true;
								return "self.isOfTypeAt.call(this, -" + pseudoValue + ")";

							case "root":
								if ((build.tag != null) && (build.tag !== "html")) {
									build.failed = true;
									return;
								}
								else {
									build.tag = "html";
									return "this.tagName === 'html'";
								}

							default:
								build.failed = true;
								return;
						}
					}
				}
				else if (named) {
					var namedStr = named.escape();

					switch (namedType) {
						case "#":
							build.id = named;
							return "this.id === '" + namedStr + "'";
						case ".":
							if (!build.classes.dictionary[named]) {
								build.classes.push(named);
								build.classes.dictionary[named] = true;
								return "className.indexOf(' " + namedStr + " ') !== -1";
							}
						default:
							build.tag = named;
							return "this.tagName.toLowerCase() === '" + namedStr.toLowerCase() + "'";
					}
				}

				return "true";
			}

			return element;
		})();

		//console.log(
		//	element(null, "div#id.class[attr][attr=''][attr-complete=value][ attr-lang = 'lang-'][attr-spaced~=class][attr-lang|=lang][attr-spaced^=starts-with][attr-spaced$=ends-with][attr-spaced*=contains][attr-single='quote\"'][attr-double=\"quote'\"][attr-square='bracket]']:first-child:first-of-type")
		//		.call(document.getElementsByTagName("DIV")[0])
		//);

		console.log(
			selector(null, "body div#id p span")
		);

		return selector;
	})();

	return qsa;
})();

//qsa("body div#id.class[attr][attr=''][attr-complete=value][ attr-complete = 'value'][attr-spaced~=class][attr-lang|=lang][attr-spaced^=starts-with][attr-spaced$=ends-with][attr-spaced*=contains][attr-single='quote\"'][attr-double=\"quote'\"][attr-square='bracket]']:not([attr='value)]']) + div span ~ code > found, body #not-id");
//qsa("tag#id.class");