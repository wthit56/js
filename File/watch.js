var fs = require("fs");

/*

	file	rename		1.txt		old file was renamed
	dir		rename		null		old file was renamed (name no longer exists)
	dir		rename		2.txt		new file name created
	dir		change		2.txt		new file written (copied from old file)

	file	rename		1.txt		old file was renamed
	dir		rename		null
	dir		rename		1.txt

*/

var gap = (function () {
	var scheduled = null;
	function handle() {
		console.log();
		scheduled = null;
	}

	return function () {
		if (scheduled === null) {
			scheduled = setTimeout(handle, 0);
		}
	};
})();




function Watch(filename) {
	var watcher = fs.watch(filename, function (event, filename) {

	});

	watcher.filename = filename;
	watcher.watching = false;
	watcher.isDir = null;

	fs.stat(filepath, function (error, stat) {
		if (stat.isDirectory()) {
			watcher.isDir = true;
			watcher.children = {};
		}
		else if (stat.isFile()) {
			watcher.isDir = false;
		}

		watcher.watching = true;
	});

	return watcher;
}



fs.watch("./test/1.txt", function (event, filename) {
	console.log("file\tevent: " + event + " filename: " + filename);
	console.log(this);
	gap();
}).target = "./test/1.txt";

fs.watch("./test", function (event, filename) {
	console.log("dir\tevent: " + event + " filename: " + filename);
	console.log(this);
	gap();
}).target = "./text";
