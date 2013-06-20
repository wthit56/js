var HTJS = (function () {
	var outside_empty_lines = { find: /^\n|\r?\n\t*$/g, replace: "" },
		first_tabs = { find: /^[\r\n]+(\t*)/ },
		back_slash = { find: /\\/g, replace: "\\\\" },
		double_quotes = { find: /"/g, replace: "\\\"" },
		leading_tabs = {
			regex: (function () { var s = new String("^\t{0,{tabs}}"); s.tabs = /{tabs}/g; return s; })(),
			options: "gm",
			find: null, replace: "",
			apply: function (input) {
				leading_tabs.find = new RegExp(
					leading_tabs.regex.replace(
							leading_tabs.regex.tabs,
							input.match(first_tabs.find)[1].length
						),
					leading_tabs.options
				);

				return input.replace(leading_tabs.find, leading_tabs.replace);
			}
		},
		new_line = { find: /\r?\n/g, replace: "\\n\\\n" };


	var htjs_part = (function () {
		/*
		
		content... until
		closing or opening or ending

		*/




		// (content) until
		// (optional:
		//     (opening)
		//     (content) until
		// )
		// (closing or ending)

		var find = /(?:^|\{\{)((?:\n|.)*?)(\{\{)?((?:\n|.)*?)(\}\}|$)/g,
			depth = 0, buffer = [], output,
			isTemplate = false;

		var find = /((?:.|\n)+?)(\}\}|\{\{|$)/g;

		function replace(match, content, tag) {
			console.group("part");
			console.log(Array.prototype.slice.call(arguments, 1, arguments.length - 2));

			if (depth > 0) {
				console.log("content: ", content);
				console.log("tag: ", tag);
				buffer.push(content);
			}

			var buffered, converted;
			if (tag === "}}") {
				depth--;
				console.log("depth after: ", depth);

				if (depth === 0) {
					console.log("buffer:", buffer);
					converted = convert(buffer.join(""));
					console.log("converted: ", converted);
					buffer.splice(0);
					console.groupEnd();
					return converted;
				}
				else if (depth > 0) {
					buffer.push(tag);
					console.groupEnd();
					return "";
				}
			}
			else if (tag === "{{") {
				depth++;
				console.log("depth after: ", depth);
				if (depth > 1) {
					buffer.push(content);
					buffer.push(tag);
					console.log("buffer: ", buffer);
					console.groupEnd();
					return "";
				}
				else if (depth === 0) {
					console.groupEnd();
					return content;
				}
			}
			else if (!tag) {
				converted = convert(buffer.join(""));
				console.log("converted: ", converted);
				buffer.splice(0);
				console.groupEnd();
				return converted;
			}

			return match;
		};

		function convert(input) {
			var output = input;
			if (!isTemplate) { output = leading_tabs.apply(output); }
			output = output.replace(back_slash.find, back_slash.replace)
				.replace(outside_empty_lines.find, outside_empty_lines.replace)
				.replace(double_quotes.find, double_quotes.replace)
				.replace(new_line.find, new_line.replace);
			return "\"" + output + "\"";
		}

		return function htjs_part(input) {
			var output = input;

			// first closing htjs tag is before first opening htjs tag...
			if (input.indexOf("}}") < input.indexOf("{{")) {
				// ... so input must be a template
				isTemplate = true;
				depth = 1;
				output = leading_tabs.apply(output);
			}

			return output.replace(find, replace);
		};
	})();

	HTJS = {
		parse: (function () {
			var output;

			return function parse(input) {
				var isTemplate = false;


				output = htjs_part(input, isTemplate);

				return output;




				output = leading_tabs.apply(input)
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
