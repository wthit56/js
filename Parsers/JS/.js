var JS = (function () {
	var parse = (function () {
		var find = /((?:\n|.)*?)(?:(\/\/((?:\n|.)*?)\r?\n)|(\/\*((?:\n|.)*?)\*\/)|$)/g;

		function replace(match, unparsed, single, single_content, multi, multi_content) {
			parseUncommented(unparsed);

			if (single) {
				
				console.log("single-line comment: ", [single_content]);
			}
			else if (multi) {
				console.log("multi-line comment: ", [multi_content]);
			}

			return match;
		}

		return function parse_comments(input) {
			input.replace(find, replace);
		};
	})();

	var parseUncommented = (function () {
		var find = /./g;

		return function parseUncommented(input) {
		};
	})();

	var root, node;
	return function JS(input) {
		//console.log(input);
		root = node = { children: [] };
		parse(input);
	};
})();


JS("\
function (a, b) {\n\
	true, false, 1, \"string\", null, undefined, {};\n\
\n\
	// single-line comment\n\
\n\
	if (b) { debugger; }\n\
	else if (b instanceof Object) { }\n\
\n\
	/*\n\
		multi-line comment\n\
	*/\n\
\n\
	var c = { value: null };\n\
\n\
	delete c.value;\n\
\n\
	if (value in c) { throw new Error(\"found value after deleted\"); }\n\
\n\
	switch (a) {\n\
		case \"a\": c.value = 1; break;\n\
		default: c.value = 0;\n\
	}\n\
\n\
	c.value = new Number(c.value);\n\
\n\
	while (true) {\n\
		break;\n\
	}\n\
\n\
	do { console.log(window); break; }\n\
	while (window);\n\
\n\
	try {\n\
		for (var i = 0; true; i++) {\n\
			if (i < 10) { continue; }\n\
		}\n\
	}\n\
	catch (error) { }\n\
	finally {\n\
		return typeof c.value;\n\
	}\n\
\n\
	with (c) {\n\
		return void(0);\n\
	}\n\
}\
");
