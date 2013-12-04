function Dictionary(words) {
  this.words = words;
  console.log("words: "+words.join(", "));
  console.log();
}

Dictionary.prototype.findMostSimilar = function (term) {
	console.group("finding most similar to '" + term + "'...");

	var words = this.words;
	if (words.indexOf(term) !== -1) { return term; }

	console.on = false;

	var word, wordDist = Infinity;
	var newWordDist;
	for (var i = 0, l = words.length; i < l; i++) {
		scans = 0;
		console.group("finding distance between '" + term + "' and '" + words[i] + "'...");
		newWordDist = dist(term, words[i], 0, wordDist);
		console.log("'" + term + "' + " + newWordDist + " = '" + words[i] + "' (" + scans + " scans)");
		if (newWordDist < wordDist) {
			word = words[i];
			wordDist = newWordDist;

			if (wordDist === 0) {
				console.groupEnd();
				break;
			}
		}
		console.groupEnd();
	}

	console.on = true;

	console.log("...found '" + word + "'");

	console.groupEnd();

	return word;
}

var scans=0;
function dist(a, b, result, limit) {
	if (result == null) { result = 0; }
	if (limit == null) { limit = Infinity; }

	if (a === b) {
		console.log("'" + a + "' matches.");
		return result;
	}
	else if (result + 1 >= limit) {
		console.log(">= distance; aborted.");
		return limit;
	}

	scans++;
	/*
	if (scans > 100) {
		console.log("*** too many scans; abotring ***");
		return result;
	}
	*/
	var i, l = ((a.length < b.length) ? a.length : b.length);
	for (i = 0; i < l; i++) {
		if (a[i] !== b[i]) {
			if(i>0){console.log("'"+a.substring(0,i)+"' matches '"+b.substring(0,i)+"'");}
			console.log("'" + a[i] + "' does not match '" + b[i] + "'; trying permutations");

			var newResult;
			var remove = a.substring(i + 1);
			if (remove.length === 0) {
				console.log("remove is optimal.");
				result += 1; break;
			}
			console.group("trying remove: '" + remove + "' (from " + (result + 1) + ", limit " + limit + ")");
			newResult = dist(remove, b, result + 1, limit);
			console.groupEnd();
			if (newResult === result + 1) { break; }

			var change = b[i] + a.substring(i + 1);
			console.group("trying change: '" + change + "' (from " + (result + 1) + ", limit " + newResult + ")");
			newResult = dist(change, b, result + 1, newResult);
			console.groupEnd();
			if (newResult === result + 1) { break; }

			var add = b[i] + a.substring(i);
			console.group("trying add: '" + add + "' (from " + (result + 1) + ", limit " + newResult + ")");
			result = dist(add, b, result + 1, newResult);
			console.groupEnd();
			break;
		}
	}

	if (i >= l) {
		result += (a.length > b.length) ? a.length - b.length : b.length - a.length;
	}

	console.log("distance so far: " + result);
	return result;
}