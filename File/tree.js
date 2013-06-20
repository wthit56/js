var fs = require("fs"),
	path = require("path"),
	Perform = require("./Perform");

function readdir(filepath, children, callback) {
	children = children || {};

	var perform = new Perform(),
		P = perform.Perform;

	var childPerform = new Perform.parallel(),
		cP = childPerform.Perform;

	var dirs = [];
	fs.readdir(filepath, function (error, files) {
		for (var i = 0, l = files.length; i < l; i++) {
			cP._add(stat(path.join(filepath, files[i]), files[i], children));
		}
	});

	function stat(filepath, filename, children) {
		return function () {
			var _ = this;
			fs.stat(filepath, function () {
				Array.prototype.push.call(arguments, filepath, filename, children, dirs);
				statHandle.apply(_, arguments);
			});
		};
	}

	function statHandle(error, stat, filepath, filename, children, dirs){
		if (error) { return; }
		else if (stat.isDirectory()) {
			dirs.push(filename);
		}
		else if (stat.isFile()) {
			children[filename] = true;
		}

		this._actionComplete();
	}

	//perform

	function complete() {
		callback(children);
	}

	perform(complete);
}

readdir("./", null, function (children) {
	console.log(children);
});
