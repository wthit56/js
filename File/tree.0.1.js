var fs = require("fs"),
	path = require("path");

var tree = [], current = tree;
var i, l;

readdir("./");
console.log("\ntree: ", tree);

function readdir(filepath, filename) {
	console.log("reading '" + filepath + "'...");
	fs.readdir(filepath, function (error, files) {
		if (error) {
			throw new Error("filepath '" + filepath + "' does not exist");
		}

		var dirs = [];
		console.log("files: ", files);

		if (files.length > 0) {
			for (i = 0, l = files.length; i < l; i++) {
				stat(path.join(filepath, files[i]), files[i], dirs);
			}
		}

		console.log("current: ", current);

		console.log("dirs: ", dirs);
		if (dirs.length > 0) {
			for (i = 0, l = dirs.length; i < l; i++) {
				var newDir = {
					dirname: filepath,
					parent: current
				};
				current.push(newDir);
				current = newDir;

				readdir(path.join(filepath, dirs[i]), dirs[i]);
			}
		}
	});

	if (current.parent) { current = current.parent; }
}

function stat(filepath, filename, dirs) {
	fs.stat(filepath, function (error, stat) {
		console.log("stat-ing file '" + filepath + "'...");
		if (error) { return; }
		else if (stat.isFile()) {
			console.log("\t"+filename + " is a File");
			current.push(filename);
		}
		else if (stat.isDirectory()) {
			console.log("\t"+filename + " is a Directory");
			dirs.push(filename);
		}
	});
}
