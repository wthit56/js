var HTJS = (function () {
	var outside_empty_lines = { find: /^[\r\n]+|[\r\n\t]+$/g, replace: "" },
		first_tabs = { find: /^[\r\n]+(\t*)/ },
		back_slash = { find: /\\/g, replace: "\\\\" },
		double_quotes = { find: /"/g, replace: "\\\"" },
		leading_tabs = {
			regex: (function () { var s = new String("^\t{0,{tabs}}"); s.tabs = /{tabs}/g; return s; })(),
			options: "gm",
			find: null, replace: ""
		},
		new_line = { find: /\r?\n/g, replace: "\\n\\\n" },
		htjs_bound = {
			find: /\{\{|\}\}/g,
			replace: (function () {
				var depth = 0;

				function replace(match) {
					depth += (match === "{{") ? 1 : -1;

					return (
						(
							((match === "{{") && (depth === 1)) ||
							((match === "}}") && (depth === 0))
						) ? "\"" : match
					);
				};
				replace.reset = function () {
					depth = 0;
				};

				return replace;
			})()
		};

	HTJS = {
		parse: (function () {
			var output;

			return function parse(input) {
				leading_tabs.find = new RegExp(
					leading_tabs.regex.replace(
							leading_tabs.regex.tabs,
							input.match(first_tabs.find)[1].length
						),
					leading_tabs.options
				);

				var output = input
					.replace(leading_tabs.find, leading_tabs.replace)
					.replace(back_slash.find, back_slash.replace)
					.replace(outside_empty_lines.find, outside_empty_lines.replace)
					.replace(double_quotes.find, double_quotes.replace)
					.replace(new_line.find, new_line.replace);

				if (output.indexOf("}}") < output.indexOf("{{")) {
					output = "{{" + output;
				}
				if (output.lastIndexOf("{{") < output.lastIndexOf("}}")) {
					output = output + "}}";
				}

				output = output.replace(htjs_bound.find, htjs_bound.replace);

				leading_tabs.find = null;
				htjs_bound.replace.reset();

				return output;
			};
		})()
	};

	return HTJS;
})();
