var fs = require("fs"),
	path = require("path");

/*
readdir("./", [], function (error, tree) {
	if (error) { throw error; }

	console.log("\ntree: ", tree);
});
*/

var stage = (function () {
	function stage(actions, callback) {
		this.callback = Array.prototype.pop.call(arguments);

		this.actions = arguments;
		this.actionsCompleted = 0;

		this.steps = 0;
		this.stepsCompleted = 0;

		this.actions[0].call(this);
	}
	stage.prototype = {
		actionComplete: function () {
			this.completed++;
			if (
				(this.actionsCompleted >= this.actions.length) &&
				(this.stepsCompleted >= this.steps)
			) {
				this.callback();
			}
		},
		stepComplete: function () {
			this.stepsCompleted++;

		}
	};

	return stage;
})();


var filepath = "./test";
var tree = [];
new stage(
	function readdir() {
		console.log("reading filepath: '" + filepath + "'...");
		fs.readdir(function () {
			
		});
	},

	function callback() {
		console.log(tree);
	}
);
