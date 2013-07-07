var qsa = (function () {
  	var findSelectors = /([\W\w]*?)(?:,\s*|$)/g;

  	function qsa(selectors) {
  		var input = selectors, selectors = [];

  		var exec, oldIndex = -1;
  		while ((exec = findSelectors.exec(input)) && (exec.index != oldIndex)) {
  			if (exec[0]) {
  				selectors.push(parseSelector(exec[1]));
  			}
  			oldIndex = exec.index;
  		}
  		findSelectors.lastIndex = 0;

  		return selectors;
  	}

  	var parseSelector = (function () {
  		var findLastID = /(([\W\w]*)\s+)?(\S*)#([\W\w]+?)(?:([.*|[+~>:])|\s+|$)/;
  		var findElement = /(\S+?(\[[^\]]*\])*(\([^)]\))*)+/g;
  		var findLastClass = /(([\W\w]*)\s+)?\.([\W\w]+?)(?:([.*|[+~>:])|\s+|$)/;
  		var findLastTag = /(([\W\w]*)\s+)?([^.#:][\W\w]*?)(?:([.*|[+~>:])|\s+|$)/;
		var exec, lastIndex;
  		var left, right, current;
  		var i, l, upElement, candidate;

  		return function parseSelector(selector, first) {
  			console.group(selector);
  			{
  				if (exec = findLastID.exec(selector)) { // assignment
  					left = exec[2].match(findElement);
  					right = selector.substring(exec[1].length).match(findElement);

  					current = document.getElementById(exec[4]);
  					if (!current) { return null; }
  					if (exec[3]) {
  						if (!selectorMatcher(right[0])(current)) { return null; }
  						else { console.log("found: ", current, " as basis"); }
  					}

  					i = left.length;
  					var parent = current;
  					while (upElement = left[--i]) {
  						if (!(upElement instanceof Function)) {
  							upElement = left[i] = selectorMatcher(upElement);
  						}

  						while (parent = parent.parentNode) {
  							if (upElement(parent)) { break; }
  						}

  						if (!parent) { return null; }
  						else { console.log("found parent: ", parent); }
  					}

  					i = 0, l = right.length, candidate = current, candidates;
					//var byClass=findLastClass(



  					//while ((exec = findElement.exec(selector)) && (findLastID.lastIndex != lastIndex)) {
  					//  selectorMatcher(exec[0]);
  					//  lastIndex = exec.lastIndex;
  					//}
  				}
  			}
  			console.groupEnd();
  		};
  	})();

  	var selectorMatcher = (function () {
  		function selectorMatcher(selector, not) {
  			console.group("selectorMatcher: " + selector);
  			{
  				// "[attr][attr=value][attr='value]'][attr=\"value]\"]".match(/\[([^~|^$*=\]\s]+)(=(?:(["'])([^\3]*)\3|[^\]]*))?\]/g)
  				var findParts = /(?:\[\s*([^~|^$*\]=\s]+)\s*(?:([~|^$*])?=\s*(?:(["'])([^\3]*?)\3|([^\]]*)))?\])|(?:::?([^#.+~>[:(\s]+)(?:\(([^\)]*)\))?)|(?:(^|[#.]|::?)([^#.+~>[:(\s]+))/g;
  				var exec, lastIndex = -1;
  				var func = [];
  				while ((exec = findParts.exec(selector)) && (findParts.lastIndex != lastIndex)) {
  					func.push(parse.apply(this, exec));
  					lastIndex = exec.lastIndex;
  				}
  			}
  			console.groupEnd();

  			func = "var attrValue;\nreturn (\n\t(" + func.join(") " + (not ? "||" : "&&") + "\n\t(") + ")\n);";
  			return new Function("e", func);
  		};

  		var findEscaped = /\\|\n|'/g;
  		function parse(
  	        match,
  	        attrName, attrType, attrQuote, attrValueQuoted, attrValue,
  	        pseudo, pseudoArg,
  	        nameType, name
  	    ) {
  			if (attrName) {
  				attrValue = (attrValue || attrValueQuoted);
  				if (attrValue) { attrValue = attrValue.replace(findEscaped, "\\$&"); }

  				switch (attrType) {
  					case "~": return "(' ' + e.getAttribute('" + attrName + "') + ' ').indexOf('" + attrValue + "')";
  					case "|": return "e.getAttribute('" + attrName + "').indexOf('" + attrValue + "-') === 0";
  					case "^": return "e.getAttribute('" + attrName + "').indexOf('" + attrValue + "') === 0";
  					case "$": return "(attrValue = e.getAttribute('" + attrName + "')) && attrValue.indexOf('" + attrValue + "') === (attrValue.length - " + attrValue.length + ")";
  					case "*": return "e.getAttribute('" + attrName + "').indexOf('" + attrValue + "') !== -1";
  				}

  				if (attrValue) {
  					return "e.getAttribute('" + attrName + "') === '" + attrValue + "'";
  				}
  				else {
  					return "e.getAttribute('" + attrName + "') !== null";
  				}
  			}

  			if (name) {
  				name = name.replace(findEscaped, "\\$&");

  				switch (nameType) {
  					case "#": return "e.id === '" + name + "'";
  					case ".": return "(' ' + e.className + ' ').indexOf(' " + name + " ') !== -1";
  					default: return "e.tagName.toLowerCase() === '" + name + "'";
  				}
  			}

  			if (pseudo) {
  				if (pseudo === "not") {

  				}

  				return "'pseudo " + pseudo + "(" + pseudoArg + ")'";
  			}

  			console.log("could not parse: ", arguments);
  			return "true";
  		}

  		return selectorMatcher;
  	})();

  	return qsa;
})();
