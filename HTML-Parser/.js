var parse = (function () {
	var found,
		find = /([\W\w]*?){{/g;

	function parse(input) {
		console.group("parsing");
		{
			console.log(input);
		}
		console.groupEnd();

		found = find.exec(input);
		while ((found != null) && (found[0].length !== 0)) {
			console.log(found);


			found = find.exec(input);
		}

		found = null;
	};

	return parse;
})();