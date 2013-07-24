if (!window.CSV) {
	window.CSV = {
		parse: function (csv, separator, header, errors) {
			if (separator == null) { separator = ","; }
			else {
				switch (separator) {
					case "\r":
					case "\n":
					case "\"":
						throw new SyntaxError("Invalid separator.");
				}
			}

			var isEOL = /^[\n\r]+$/;
			var findEscapedDoubleQuotes = /""/g;
			var findCol = new RegExp(
			//"(\"?)([\\W\\w]*?)\\1(\\{sep}|[\\n\\r]+|$)".replace("{sep}", separator),
				"(?:\"((?:[^\"]*(?:\"\")?)*)\"|[\W\w]*?)(\\{sep}|[\\n\\r]+|$)".replace("{sep}", separator),
				"g"
			);
			// allows incorrect quotes
			console.log(findCol);

			var results = [[]], errorList, currentRow = results[0];
			var found, lastIndex = findCol.lastIndex = 0;

			while (true) {
				found = findCol.exec(csv);
				if (!found) { break; }

				if (findCol.lastIndex === lastIndex) {
					++findCol.lastIndex;
					continue;
				}
				lastIndex = findCol.lastIndex;

				console.log(found);

				currentRow.push(
					(found[2].length > 0)
						? found[2].replace(findEscapedDoubleQuotes, "\"")
						: null
				);

				if (isEOL.test(found[3])) {
					if (
						errors &&
						(results.length > 1) &&
						(currentRow.length !== results[results.length - 2].length)
					) {
						errorList = errorList || (results.errors = []);
						errorList.push(currentRow);
						currentRow.error = true;
					}

					currentRow = [];
					results.push(currentRow);
				}
			}

			if (header) {
				results.header = results.shift();
			}

			console.group("parse('" + separator + "')");
			console.log(csv);
			if (header) {
				console.log("header: ", results.header);
			}
			console.log("results: ", results.map(function (v) { return "" + v; }));
			if (errors && errorList) {
				console.log("errors: ", results.errors.map(function (v) { return "" + v; }));
			}
			console.groupEnd();
		}
	};

	CSV.parse("\"hea,d\ner_1\",hea\"de\"\"r_2,header_3\naaa,bbb,,ccc\n\r\nzzz,yyy,xxx", null, true, true);
}