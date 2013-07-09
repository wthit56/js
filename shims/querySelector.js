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

if (!RegExp.prototype.forEach) {
	RegExp.prototype.forEach = (function (global) {
		return function (input, callback) {
			var found, lastIndex = this.lastIndex = 0;

			while (true) {
				found = this.exec(input);
				if (!found) { break; }

				if (this.lastIndex === lastIndex) {
					this.lastIndex++;
					continue;
				}
				lastIndex = this.lastIndex;

				found.splice(found.length, 0, found.index, input);
				callback.apply(global, found);
			}
		}
	})(this);
}
if (!String.prototype.forEachMatch) {
	String.prototype.forEachMatch = function (regex, callback) {
		return regex.forEach(this, callback);
	};
}

if (!RegExp.prototype.map) {
	RegExp.prototype.map = (function () {
		return function (input, mapping) {
			var returnValue = [];
			this.forEach(input, function () {
				returnValue.push(mapping.apply(this, arguments));
			});
			return returnValue;
		};
	})();
}
if (!String.prototype.mapMatches) {
	String.prototype.mapMatches = function (regex, mapping) {
		return regex.map(this, mapping);
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
	function qsa(selectors) {
		findSelectors.forEach(selectors, selector);
		var localReturn = returnValue;
		returnValue = undefined;
		return localReturn;
	}

	var selector = (function () {
		var findElements = /((?:[^'"\s+~>]*(?:(["'])(?:(?:\\|(?!\2))[\W\w])*\2)?)+)/g;
		var found, lastIndex;

		function selector(match, selector) {
			console.group("parsing selector: " + selector);
			findElements.map(selector, element);
			console.groupEnd();
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

					this.classes.length = 0;
					for (var key in this.classes.dictionary) {
						delete this.classes.dictionary[key];
					}

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

			function element(match, element) {
				console.group("parsing element: " + element);

				element = findParts.map(element, createPartCheck);
				if (build.failed) {
					throw new SyntaxError("Query '" + element + "' not a valid selector.");
				}

				var func = "";
				if (build.classes.length) {
					func += "var className = ' ' + this.className + ' ';\n\n";
				}
				if (build.attrs.length) {
					func += "var attrs = {\n\t" + build.attrs.map(mapAttrs).join(",\n\t") + "\n};\n\n";
				}
				if (build.classedAttrs.length) {
					func += "var classedAttrs = {\n" + build.classedAttrs.map(mapAttrs).join(",\n\t") + "\n};\n\n";
				}
				if (build.needsHash) {
					func += "" +
						"var hash = window.location.hash;\n" +
						"if(hash){ hash = hash.substring(1); }" +
					"\n\n";
				}

				func += "" +
					"return (\n" +
						"(\n\t" +
							element.filter(isNotNull).join(") &&\n\t(") +
						")" +
						(build.pseudo.length ? " &&\n\t(arguments.callee.pseudoCheck.call(this))" : "") +
					"\n);";

				element = new Function(func);
				if (build.pseudo.length) {
					var pseudos = build.pseudo;
					element.pseudoCheck = function () {
						return pseudoCheck.apply(this, pseudos);
					};
				}
				if (build.needsChildAt) {
					element.isChildAt = isChildAt;
				}
				if (build.needsOfTypeAt) {
					element.isOfTypeAt = isOfTypeAt;
				}

				console.log(JSON.stringify(build, null, "	"));

				element.tag = build.tag;
				element.name = build.name;
				element.id = build.id;
				element.classes = build.classes; delete element.classes.dictionary;

				func = ""; build.reset();
				console.groupEnd();

				return element;
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
										default: build.failed = true;
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
								return "arguments.callee.isChildAt.call(this, 0)";
							case "last-child":
								build.needsChildAt = true;
								return "arguments.callee.isChildAt.call(this, -1)";
							case "nth-child":
								pseudoValue = parseInt(pseudoValue);
								if (isNaN(pseudoValue) || (pseudoValue < 0)) { build.failed = true; return; }
								build.needsChildAt = true;
								return "arguments.callee.isChildAt.call(this, " + pseudoValue + ")";
							case "nth-last-child":
								pseudoValue = parseInt(pseudoValue);
								if (isNaN(pseudoValue) || (pseudoValue < 1)) { build.failed = true; return; }
								build.needsChildAt = true;
								return "arguments.callee.isChildAt.call(this, -" + pseudoValue + ")";

							case "first-of-type":
								build.needsOfTypeAt = true;
								return "arguments.callee.isOfTypeAt.call(this, 0)";
							case "last-of-type":
								build.needsOfTypeAt = true;
								return "arguments.callee.isOfTypeAt.call(this, -1)";
							case "nth-of-type":
								pseudoValue = parseInt(pseudoValue);
								if (isNaN(pseudoValue) || (pseudoValue < 0)) { build.failed = true; return; }
								build.needsOfTypeAt = true;
								return "arguments.callee.isOfTypeAt.call(this, " + pseudoValue + ")";
							case "nth-last-of-type":
								pseudoValue = parseInt(pseudoValue);
								if (isNaN(pseudoValue) || (pseudoValue < 1)) { build.failed = true; return; }
								build.needsOfTypeAt = true;
								return "arguments.callee.isOfTypeAt.call(this, -" + pseudoValue + ")";
						}
					}
					throw new SyntaxError("Query '" + match + "' not a valid selector.");
				}
				else if (named) {
					var namedStr = named.escape();

					switch (namedType) {
						case "#":
							build.id = named;
							return "this.id === '" + namedStr + "'";
						case ".":
							if (!build.classes.dictionary[named]) {
								console.log("class: " + named);
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

		var check = window.check = element(null, "div#id.class[attr][attr=''][attr-complete=value][ attr-lang = 'lang-'][attr-spaced~=class][attr-lang|=lang][attr-spaced^=starts-with][attr-spaced$=ends-with][attr-spaced*=contains][attr-single='quote\"'][attr-double=\"quote'\"][attr-square='bracket]']:first-child:first-of-type");
		//debugger;
		console.log(
			check.call(document.getElementsByTagName("DIV")[0])
		);

		return selector;
	})();

	return qsa;
})();

//qsa("body div#id.class[attr][attr=''][attr-complete=value][ attr-complete = 'value'][attr-spaced~=class][attr-lang|=lang][attr-spaced^=starts-with][attr-spaced$=ends-with][attr-spaced*=contains][attr-single='quote\"'][attr-double=\"quote'\"][attr-square='bracket]']:not([attr='value)]']) + div span ~ code > found, body #not-id");
//qsa("tag#id.class");