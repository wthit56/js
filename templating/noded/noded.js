var noded = (function () {
	function noded(html) {
		var proxy = document.createElement("PROXY");
		proxy.innerHTML = html;

		var parsed = [], nodes = proxy.childNodes;
		var i = 0, l = nodes.length;
		while (i < l) {
			parse(parsed, nodes[i]);
			i++;
		}
	}

	
	function parse(parsed, dom) {

		if (dom.nodeType === 1) {
			console.group(dom.tagName);

			// attributes
			var attrs = dom.attributes;
			console.log("attrs:", attrs);

			var i = 0, l = attrs.length;
			while (i < l) {
				console.log(attrs[i].name, attrs[i].value);
				if (hasVariable.test(attrs[i].name)) {
					
				}
				i++;
			}

			console.groupEnd();
		}
	}

	return noded;
})();