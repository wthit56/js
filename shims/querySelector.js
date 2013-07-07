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
		var exec, lastIndex;
  		var left, right, current;
  		var i, l, upElement, candidate;

  		function parseSelector(selector, first) {
  			console.group(selector);
  			{
  				if (exec = findLastID.exec(selector)) { // assignment
  					left = exec[2];
  					right = selector.substring(exec[1].length);

  					current = document.getElementById(exec[4]);
  					if (!current) { return null; }
  					if (exec[3]) {
  						if (!selectorMatcher(right[0])(current)) { return null; }
  						else { console.log("found: ", current, " as basis"); }
  					}

  					//i = left.length;
  					//var parent = current;
  					//while (upElement = left[--i]) { // assignment
  					//	if (!(upElement instanceof Function)) {
  					//		upElement = left[i] = selectorMatcher(upElement);
  					//	}

  					//	while (parent = parent.parentNode) { // assignment
  					//		if (upElement(parent)) { break; }
  					//	}

  					//	if (!parent) { return null; }
  					//	else { console.log("found parent: ", parent); }
  					//}

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


		return parseSelector;
  	})();

  	var selectorMatcher = (function () {
  		var cache={};
		
		function selectorMatcher(selector, not) {
			
	  		if(cache[selector]){
				console.log("cached");
				return cache[selector];
			}

  			// "[attr][attr=value][attr='value]'][attr=\"value]\"]".match(/\[([^~|^$*=\]\s]+)(=(?:(["'])([^\3]*)\3|[^\]]*))?\]/g)
  			var findParts = /(?:\[\s*([^~|^$*\]=\s]+)\s*(?:([~|^$*])?=\s*(?:(["'])([^\3]*?)\3|([^\]]*)))?\])|(?:::?([^#.+~>[:(\s]+)(?:\(([^\)]*)\))?)|(?:(^|[#.]|::?)([^#.+~>[:(\s]+))/g;
  			var exec, lastIndex = -1;
  			var func = [];
  			while ((exec = findParts.exec(selector)) && (findParts.lastIndex != lastIndex)) {
  				func.push(parse.apply(this, exec));
  				lastIndex = exec.lastIndex;
  			}

  			return (cache[selector] = new Function("e", "var attrValue;\nreturn (\n\t(" + func.join(") " + (not ? "||" : "&&") + "\n\t(") + ")\n);"));
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

	function parentFound(trail, from, to){
		to=to||document;
		
		var i = trail.length;
  		var current = from;
  		while (current = trail[--i]) { // assignment
  			if (!(current instanceof Function)) {
  				current = trail[i] = selectorMatcher(current);
  			}

  			while ((from = from.parentNode) && (from!=to)) { // assignment
  				if (current(from)) { break; }
  			}

  			if (!from) { return false; }
  			else { console.log("found parent: ", from); }
  		}

		return true;
	}
	//console.group("parentFound");
	//console.log(parentFound(["body", "div"], document.getElementsByClassName("classy")[0]));
	//console.groupEnd();

	function childFound(trail, from){
		from=from||document;
		var findTagAndClasses=/(?:^|(\.))([^#.*|[+~>:]+)((?=\s|$))?/g;
			
		var i=0;
		var current=from;

		// find last class/tag
		var i=trail.length, last;
		var candidate, candidates=[], c;
		while(last=trail[--i]){ // assignment
			var needCheck=false;

			while(candidate=findTagAndClasses.exec(last)){
				if(!candidate[3]){
					needCheck=true;
				}
				
				if(candidate[1]){ // class
					candidate=from.getElementsByClassName(candidate[2]);
				}
				else{ // element
					candidate=from.getElementsByTagName(candidate[2]);
				}
				// TODO: add name

				if(candidate.length>0){
					candidates.push(candidate);
				}
			}

			if(candidates.length>0){
				if(needCheck){candidates.check=selectorMatcher(last);}
				break;
			}
		}

		if(candidates.length<=0){return false;}

		candidates.sort(function(a,b){return a.length-b.length });
		console.log("candidates: ", candidates);

		var found=false;
		if(i>0){
			trail=trail.slice(0,i);
			c=-1;
			var n, node;
			while(candidate=candidates[++c]){ // assignment
				n=-1;
				while((node=candidate[++n]) && !parentFound(trail, node, from)){
					var b;
				}
			
				if(node){
					return true;
				}
			}
		}

		return false;
	}
	console.group("childFound");
	//console.log(childFound(["div#id", "found.classy", ":hover"], document));
	console.log(childFound(["div", "[attr]"], document));
	console.groupEnd();

  	return qsa;
})();
