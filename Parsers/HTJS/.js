var HTJS = (function () {
	var outside_empty_lines = { find: /^\n|\r?\n\t*$/g, replace: "" },
		first_tabs = { find: /^[\r\n]+(\t*)/ },
		back_slash = { find: /\\/g, replace: "\\\\" },
		double_quotes = { find: /"/g, replace: "\\\"" },
		new_line = { find: /\r?\n/g, replace: "\\n\\\n" },

		leading_tabs = {
			regex: (function () { var s = new String("^\t{0,{tabs}}"); s.tabs = /{tabs}/g; return s; })(),
			options: "gm",
			find: null, replace: "",
			apply: function (input) {
				var found = input.match(first_tabs.find);
				if (!found) { return input; }

				leading_tabs.find = new RegExp(
					leading_tabs.regex.replace(
							leading_tabs.regex.tabs,
							found[1].length
						),
					leading_tabs.options
				);

				return input.replace(leading_tabs.find, leading_tabs.replace);

			}
		};

	var log_output = false;

	return (function () {
		var find = /(?:^|\{\{)((?:\n|.)*?)(\{\{)?((?:\n|.)*?)(\}\}|$)/g,
			depth = 0, buffer = [], output,
			isTemplate = false;

		var find = /((?:.|\n)+?)(\}\}|\{\{|$)/g;

		var re;
		function replace(match, content, tag) {
			var log = log_output;
			log && console.group("part");

			re = match;

			log && console.log("content: ", content);
			log && console.log("tag: ", tag);

			if (tag === "}}") {
				if (depth === 1) {
					buffer.push(content);
					log && console.log("buffer: ", buffer);
					re = convert(buffer.join(""));
					buffer.splice(0);
				}
				else if (depth > 1) {
					buffer.push(content, tag);
					log && console.log("buffer: ", buffer);
					re = "";
				}

				depth--;
				log && console.log("new depth: ", depth);
			}
			else if (tag === "{{") {
				if (depth === 0) { re = content; }
				else if (depth > 0) {
					buffer.push(content, tag);
					log && console.log("buffer: ", buffer);
					re = "";
				}

				depth++;
				log && console.log("new depth: ", depth);
			}
			else if (!tag) {
				if (depth > 0) {
					buffer.push(content);
					log && console.log("buffer: ", buffer);
					re = convert(buffer.join(""));
					buffer.splice(0);
				}
				else { re = content; }
			}

			log && console.log("replaced with: ", re);
			log && console.groupEnd();
			return re;
		};

		function convert(input) {
			if (!convert.isTemplate) {
				input = leading_tabs.apply(input)
					.replace(outside_empty_lines.find, outside_empty_lines.replace);
			}

			return ("\"" +
				input
					.replace(back_slash.find, back_slash.replace)
					.replace(double_quotes.find, double_quotes.replace)
					.replace(new_line.find, new_line.replace) +
			"\"");
		}
		convert.isTemplate = true;

		return function HTJS(input, log) {
			log_output = log;

			convert.isTemplate = (input.indexOf("}}") < input.indexOf("{{"));
			depth = convert.isTemplate ? 1 : 0;

			input = leading_tabs.apply(input);

			return (
				(convert.isTemplate
					? input.replace(outside_empty_lines.find, outside_empty_lines.replace)
					: input
				).replace(find, replace)
			);
		};
	})();
})();
