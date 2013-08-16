var stringStringJavaScriptEscape = (function () {
	var findUnsafe = /\\?(['"{}<>\\])/g;

	return function stringStringJavaScriptEscape(string) {
		return string.replace(findUnsafe, "\\$1");
	};
})();

var stringJavaScriptUnescape = (function () {
	var findDoubleQuotes = /\\?"/g;

	return function stringJavaScriptUnescape(string) {
		return new Function("return \"" + string.replace(findDoubleQuotes, "\\\"") + "\";")();
	};
})();
