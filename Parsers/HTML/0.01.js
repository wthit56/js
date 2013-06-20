var HTML = (function () {
	var tree, node, newNode;

	var find = /((\s*)((?:\n|.)*?))((?:(\/)|(--))?(>)|(<)(?=\S)(?:(!DOCTYPE|!doctype)|(\/)|(!--)|\S+)?|(=(["'])?)|((["'])?(?=\s*|>))|$)/g;

	var arg_values = [];
	var replace = (function () {
		var inString,
			inClosing;

		//						0		1			2		3		4		5				6				7			8				9			10		11		12				13
		return function replace(match, before, pre_space, content, after, open_property, close_property, self_closing, close_comment, close_tag, open_tag, doctype, closing_tag, open_comment) {
			console.group("part");

			Array.prototype.forEach.call(arguments, function (v, i, a) {
				if (v != null) {
					var pos = (arg_values[i] || (arg_values[i] = []));
					if (pos[0] !== v) { pos.push(v); }
				}
			});

			console.log(match);
			//console.log("content: ", [content]);
			//console.log("args: ", arguments);

			node.HTML += content;

			if (open_tag) {
				newNode = {
					parent: node,
					HTML: after,
					isElement: true,
					childNodes: []
				};
				node.childNodes.push(newNode);
				node = newNode;

				if (doctype) {
					node.isDoctype = true;
				}
				else if (closing_tag) {
					node.isClosing = true;
				}
				else if (open_comment) {
					node.isComment = true;
				}
			}
			else if (close_tag) {

			}

			console.groupEnd();
			return "";
		};
	})();

	return function HTML(input) {
		tree = node = { HTML: "", childNodes: [] };
		input.replace(find, replace);
		console.log(arg_values);
	};
})();