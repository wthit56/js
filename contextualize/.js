function contextualize(fn, context) {
	return function () {
		fn.apply(context, arguments);
	};
}


function action(input) {
	console.log("input: ", input || this.toString());
}

var input = "blah";

setTimeout(contextualize(action, input), 0);
