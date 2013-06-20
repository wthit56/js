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

SYX["text/javascript"] = function (code) {
	// while|do|for|return|in|instanceof|function|new|with|typeof|try|catch|finally|null|break|continue|debugger

	//           string                  comment                                              variables
	//var find = /(("|')((?:\\?.)*?)(\2))|(((\/\/)([^\r\n]*))|((\/\*)((?:\n|.)*?)(\*\/)))|(?:\b(var|let)\b)/g;

	var string = /(("|')((?:\\?[\W\w])*?)(\2))/,
		comment_single_line = /(\/\/)([^\r\n]*)/,
		comment_multi_line = /(\/\*)((?:\n|.)*?)(\*\/)/,
		keywords = /\b(?:var|let|if|else if|else|while|do|for|return|in|instanceof|function|new|with|typeof|try|catch|finally|null|break|continue)\b/,
		brackets = "{}()",
		compare_equality = /(?:(!)|=)=(=)?/,
		compare_relative = /(?:(>)|(<))(=)?/,
		logical = /(&&)|(\|\|)|(!)/,
		boolean = /\b(?:true|false)\b/;

	//var keywords = {
	//	variable: /\b(?:let|var)(?=\s)/,
	//	ifelse: /\b(?:if|else if|else)\b/
	//};

	var find = new RegExp(
		string.source + "|" +
		"((" + comment_single_line.source + ")|(" + comment_multi_line.source + "))|" +
		"(" + keywords.source + ")|" +
		"((\\" + brackets.split("").join(")|(\\") + "))|" +
		"((" + compare_equality.source + ")|(" + compare_relative.source + "))|" +
		"(" + logical.source + ")|" +
		"(" + boolean.source + ")",
	"g");
	console.log(find);

	var block_depth = 0;
	code = code.replace(find, function (match,
		string,
			stringLeft, stringContent, stringRight,
		comment,
			singleLineComment,
				singleLineCommentLeft, singleLineCommentContent,
			multiLineComment,
				multiLineCommentLeft, multiLineCommentContent, multiLineCommentRight,
		keyword,
		bracket,
			blockLeft, blockRight, bracketLeft, bracketRight,
		comparison,
			compareEquality,
				compareNotEqual, compareEqualityStrict,
			compareRelative,
				compareLessThan, compareGreaterThan, compareOrEqualTo,
		logical,
			logicalAnd, logicalOr, logicalNot,
		boolean
	) {
		console.group(match);

		if (string) {
			console.log("is String");
			console.log(stringLeft);
			console.log(stringContent);
			console.log(stringRight);
			console.groupEnd();
			return (
				"<span class=\"string\">" +
					"<span class=\"left\">" + stringLeft + "</span>" +
					"<span class=\"content\">" + stringContent + "</span>" +
					"<span class=\"right\">" + stringRight + "</span>" +
				"</span>"
			);
		}
		else if (comment) {
			console.log("is Comment");
			if (singleLineComment != null) {
				console.log("is Single-Line Comment");
				console.log(singleLineCommentLeft);
				console.log(singleLineCommentContent);
				console.groupEnd();
				return "<span class=\"comment single\"><span class=\"left\">" + singleLineCommentLeft + "</span><span class=\"content\">" + singleLineCommentContent + "</span></span>";
			}
			else if (multiLineComment != null) {
				console.log("is Multi-Line Comment");
				console.log(multiLineCommentLeft);
				console.log(multiLineCommentContent);
				console.log(multiLineCommentRight);
				console.groupEnd();
				return "<span class=\"comment multi\"><span class=\"left\">" + multiLineCommentLeft + "</span><span class=\"content\">" + multiLineCommentContent + "</span><span class=\"right\">" + multiLineCommentRight + "</span></span>";
			}
		}
		else if (keyword) {
			console.log("is Keyword");
			console.groupEnd();
			return "<span class=\"keyword " + keyword + "\">" + keyword + "</span>";
		}
		else if (bracket) {
			console.log("is Bracket");

			if (blockLeft) {
				console.log("is Opening Block");
				block_depth++;
				console.groupEnd();
				return "<span class=\"block\"><span class=\"block-left\">" + bracket + "</span><span class=\"block-content\">";
			}
			else if (blockRight) {
				console.log("is Closing Block");
				block_depth--;
				console.groupEnd();
				return "</span><span class=\"block-right\">" + bracket + "</span></span>";
			}
			else if (bracketLeft) {
				console.log("is Opening Bracket");
				block_depth++;
				console.groupEnd();
				return "<span class=\"paren\"><span class=\"paren-left\">" + bracket + "</span><span class=\"paren-content\">";
			}
			else if (bracketRight) {
				console.log("is Closing Bracket");
				block_depth--;
				console.groupEnd();
				return "</span><span class=\"paren-right\">" + bracket + "</span></span>";
			}
		}
		else if (comparison) {
			if (compareEquality) {
				console.groupEnd();
				return "<span class=\"operator comparison equality" + (compareNotEqual ? " not" : "") + " equal" + (compareEqualityStrict ? " strict" : "") + "\">" + match + "</span>";
			}
			else if (compareRelative) {
				console.log("is Relative Compare");
				console.groupEnd();
				return "<span class=\"operator comparison relative" + (compareLessThan ? " less-than" : "") + (compareGreaterThan ? " greater-than" : "") + (compareOrEqualTo ? " or-equal-to" : "") + "\">" + match + "</span>";
			}
		}
		else if (logical) {
			console.groupEnd();
			return "<span class=\"operator logical " + (logicalAnd ? "and" : logicalOr ? "or" : logicalNot ? "not" : "") + "\">" + match + "</span>";
		}
		else if (boolean) {
			console.groupEnd();
			return "<span class=\"boolean "+match+"\">"+match+"</span>";			
		}

		//console.log(arguments);
		console.groupEnd();

		return match;
	});

	if (block_depth > 0) {
		code += new Array(block_depth + 1).join("</span>");
	}

	return code;
};
