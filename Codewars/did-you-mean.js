// http://www.codewars.com/dojo/katas/5259510fc76e59579e0009d4/play/javascript
function Dictionary(words) {
  this.words = words;
  console.log("words: "+words.join(", "));
}

Dictionary.prototype.findMostSimilar = function (term) {
	console.group("finding most similar to '" + term + "'...");

	var words = this.words;
	if (words.indexOf(term) !== -1) { return term; }

	var word, wordDist = Infinity;
	var newWordDist;
	for (var i = 0, l = words.length; i < l; i++) {
		console.log(term + " + " + dist(term, words[i]) + " = " + words[i]);
	}

	console.log("...found '" + word + "'");

	console.groupEnd();

	return word;
}

var tries = 0;
function dist(a, b, fromA, fromB, to, limit) {
	//if (++tries > 100) { return; }

	//if (!(a instanceof String)) { a = new String(a); }
	//if (!(b instanceof String)) { b = new String(b); }

	var al = a.length, bl = b.length;

	if (fromA == null) { fromA = 0; }
	if (fromB == null) { fromB = 0; }
	if (to == null) { to = al > bl ? al : bl; }

	if (limit == null) { limit = al > bl ? al + (al - bl) : bl; }

	console.log(a, b, fromA, fromB, to, limit);

	while (fromA < to) {
		console.log("\n" + a + "\t\t" + b);
		console.log(
			new Array(fromA).join(" ") + ((a[fromA] !== b[fromB]) ? "*" : "^") + new Array(al - fromA - 1).join(" ") +
			"\t\t" +
			new Array(fromB).join(" ") + "^" + new Array(bl - fromB - 1).join(" ")
		);

		if (a[fromA] !== b[fromB]) { break; }
		fromA++; fromB++;
	}

	if ((limit > 1) && (fromA < to)) {
		var thread;
		var right = b.indexOf(a[fromA], fromB);
		while (right !== -1) {
			console.log("\n" + a + "\t\t" + b);
			console.log(
				new Array(fromA).join(" ") + "^" + new Array(al - fromA - 1).join(" ") +
				"\t\t" +
				new Array(fromB).join(" ") + new Array(right - fromB + 1).join("-") + "^" + new Array(al - fromB - 1).join(" ")
			);

			thread = limit - right - left;
			//console.log((right - left), limit);
			if (thread <= 0) { break; }
			thread = dist(a, b, left, right, to, thread);
			if (thread > limit) { limit = thread; break; }

			right = b.indexOf(a[left], right + 1);
		}
	}

	return limit;
}

dist("bcd", "abc");

/*

	scan
	when non-matching, indexOf for current character
		for every position of current character, 
	

	0123456789 -> 01c36a74
	limit = al+al-bl = 12

	0123456789 -> 01c36a74
	  ^             ^

	0123456789 -> 01c36a74
	  - ^             ^

	0123456789 -> 01c36a74

*/
