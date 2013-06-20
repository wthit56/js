var HTML = (function () {
	//var find = /((\s*)?((?:\n|.)*?))((=")|("(?=\s*|>))|(?:(\/)|(--))?(>)|(<)(?=\S)(?:(!DOCTYPE|!doctype)|(\/)|(!--)|\S+)?|$)/g;

	//.										// text content outside of tags
	//<
	//	!doctype|!DOCTYPE|!--
	//		OR
	//	/ (OPTIONAL)
	//	\S+									// 1+ non-whitespace
	//		REPEAT
	//			\s+							// 1+ whitespace
	//			\S+ (UNTIL)					// 1+ non-whitespace
	//			(?=\s)						// lookahead for 1 whitespace
	//				OR
	//			=
	//			"|' (OPTIONAL)
	//			. (UNTIL)					// any character 
	//			"|' (MATCHING OPENING QUOTE IF FOUND)
	//				OR
	//			\s|> (WHEN NO QUOTE OPENED THE ATTRIBUTE)
	//	/ (WHEN NOT A CLOSING TAG)
	//		OR
	//	-- (WHEN COMMENT)
	//>

	var parse = (function () {
		var root, node;

		//var find = /((?:\n|.)*?(?=<\/?\S)?)?(<\/?\S[^>]*?(?:\s+\S+?(?:\S+\s*=\s*(?:"[^"]*"|'[^']*'))?)*\/?>)/g;
		//var find = /((?:\n|.)*?)(?=<\/?\S)(<!--(?:(?:\n|.)*?)-->|<\/\S+?>|<\S+?(?:(?:"[^"]*"|'[^']*'|[^>"']*)*)?>)/g;

		var find = /((?:\n|.)*?)(?=<\/?\S)(?:((<script\s*\S*?>)((?:\n|.)*?)<\/script>)|(<!--(?:(?:\n|.)*?)-->|<\/\S+?>|<\S+?(?:(?:"[^"]*"|'[^']*'|[^>"']*)*)?>))/g;

		function replace(match, text, script, script_open, script_content, tag) {
			/*
			console.log(text);
			tag && console.log([tag]);
			*/

			if (script) {
				tag = parseTag(script_open);
				tag.script = script_content;
				tag.isClosed = true;
			}
			else {
				tag = parseTag(tag);

				if (tag.tagName) {
					tag.tagName = tag.tagName.toLowerCase();
				}

				if (node.tagName === "script") {
					if (tag.tagName === "script") {
						node.script += text;
						text = null;
					}
					else {
						node.script += match;
						return match;
					}
				}
			}

			if (text) { node.childNodes.push(text); }

			if (tag.isClosing) {
				console.group("looking for " + tag.tagName);

				var newParent = node;
				while (
					(newParent.parent) &&
					(newParent.tagName !== tag.tagName)
				) {
					console.log(tag.tagName, newParent.parent.tagName);

					newParent = newParent.parent;
				}

				if ((newParent !== root) && (newParent.parent)) { node = newParent.parent; }
				else { console.log("new parent not found"); }

				console.groupEnd();
			}
			else {
				tag.parent = node;
				node.childNodes.push(tag);

				if (!tag.isClosed) {
					if (tag.tagName === "script") { tag.script = ""; }
					else { tag.childNodes = []; }
					node = tag;
				}
			}

			delete tag.isOpening;
			delete tag.isClosing;
			delete tag.isClosed;

			return match;
		};

		return function parse(input) {
			root = node = { childNodes: [] };
			input.replace(find, replace);
			return root;
		}
	})();

	var parseTag = (function () {
		var tag;

		//              comment             closing_tag    doctype                             attributes                   self_closing
		var find = /<(?:(!--((?:\n|.)*?)--)|(\/)(\S+?)>|(?:(!doctype|!DOCTYPE)|([^\s>]+))\s*(\S+\s*(?:=\s*(?:"[^"]*?"|'[^']*?'|[^"'\/>])*?))?\s*(\/)?>)/;
		//                  comment_content     closing_tag_name               tag_name

		function replace(match, comment, comment_content, closing_tag, closing_tag_name, doctype, tag_name, attributes, self_closing) {
			if (closing_tag) {
				tag.tagName = closing_tag_name;
				tag.isClosing = true;
			}
			else if (comment) {
				tag.isComment = true;
				tag.comment = comment_content;
			}
			else if (doctype) {
				tag.isDoctype = true;
			}
			else {
				tag.tagName = tag_name;
			}

			if (attributes) {
				parseAttributes(attributes, tag);
			}

			if (comment || doctype || self_closing) {
				tag.isClosed = true;
			}
			else if (!closing_tag) {
				tag.isOpening = true;
			}

			return match;
		}

		return function parseTag(input) {
			//console.log(input);

			tag = {};
			input.replace(find, replace);
			console.log(tag);
			return tag;
		};
	})();

	var parseAttributes = (function () {
		var attributes;

		//                   key             double_quotes        no_quotes
		var find = /(?:^|\s+)([^\s=]+)(?:\s*=\s*(?:"([^"]*?)"|'([^']*?)'|(\S*)))?/g;
		//                                              single_quotes

		function replace(match, key, double_quotes, single_quotes, no_quotes) {
			attributes[key] = double_quotes || single_quotes || no_quotes || "";
			return match;
		}

		return function parseAttributes(input, tag) {
			attributes = tag.attributes = {};
			input.replace(find, replace);
		};
	})();

	//parseTag("<!DOCTYPE lang=\"'en>gb\" html attr= blah attr2='\"_' attr3=>");
	//parseTag("</tag>");
	//parseTag("<!-- comment -->");
	//parseTag("<tag attr= blah='>' blah='\"' blah=\"'\" blah=\"en>gb\" />");
	//parseTag("<tag '>'>");
	//parseTag("<a>");

	var test = "<!DOCTYPE lang=\"'en>gb\" html attr= blah attr2='\"_' attr3=>" +
		"<!-- comment -->" +
		"<a>content<span>more content</span></a>" +
		"<tag attr= blah1='>' blah2='\"' blah3=\"'\" blah4=\"en>gb\" />" +
		"<script><!--/* script goes here */</script>--></script>" +
		"<img />";

	console.log(test);
	if (false) {
		parse(test);
	}
	else {
		console.log(JSON.stringify(parse(test), function replacer(key, value) {
			switch (key) {
				case "parent": return undefined;
				default: return value;
			}
		}, 4));
	}

	return function HTML(input) {
		return parse(input);
	};
})();