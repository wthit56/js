function regexForEach(regex, string, callback) {
	var found, result, lastIndex = regex.lastIndex = 0;

	while (true) {
		found = this.exec(input);
		if (!found) { break; }

		if (regex.lastIndex === lastIndex) {
			regex.lastIndex++;
			continue;
		}
		lastIndex = regex.lastIndex;

		found.push(found.index, input);
		
		if (callback.apply(this, found) === false) { break; }
	}
}
