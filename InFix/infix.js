// http://en.wikipedia.org/wiki/Order_of_operations
// http://en.wikipedia.org/wiki/Shunting-yard_algorithm
// http://www.youtube.com/watch?v=QzVVjboyb0s

var infix = (function () {
	var findTokens = /(\d+(?:\.\d*)?)|([+\-*\/^])|([()])/g;

	function forEachMatch(regex, input, callback) {
		var found, result, lastIndex = regex.lastIndex = 0;

		while (true) {
			found = regex.exec(input);
			if (!found) { break; }

			if (regex.lastIndex === lastIndex) {
				regex.lastIndex++;
				continue;
			}
			lastIndex = regex.lastIndex;

			found.push(found.index, input);
			callback.apply(this, found);
		}
	}

	//// different browsers return `undefined`, others return an empty string
	//var isNotMatch = (function () {
	//	var nonMatchValue = /i(o)?/.exec("string")[1];
	//	return function isNotMatch(input) {
	//		return input === nonMatchValue;
	//	};
	//})();

	var operators = [];
	operators["("] = { type: "bracket", toString: function () { return "("; } };
	operators["+"] = { type: "operator", precedence: 1, associativity: -1, execute: function (a, b) { return a + b; }, toString: function () { return "+"; } };
	operators["-"] = { type: "operator", precedence: 1, associativity: -1, execute: function (a, b) { return a - b; }, toString: function () { return "-"; } };
	operators["*"] = { type: "operator", precedence: 2, associativity: -1, execute: function (a, b) { return a * b; }, toString: function () { return "*"; } };
	operators["/"] = { type: "operator", precedence: 2, associativity: -1, execute: function (a, b) { return a / b; }, toString: function () { return "/"; } };
	operators["^"] = { type: "operator", precedence: 3, associativity: 1, execute: function (a, b) { return Math.pow(a, b); }, toString: function () { return "^"; } };

	var output = [];

	operators.toString = output.toString = function () {
		return this.map(function (value) { return value.toString(); }).join(", ");
	};

	function match(match, number, operator, parenthesis) {
		console.log(arguments);

		if (number) {
			output.push(parseFloat(number));
		}
		else if (operator) {
			operator = operators[operator];

			if (operators.length > 0) {
				var o2 = operators[operators.length - 1];

				if ((o2.type !== "operator") || (operator.precedence > o2.precedence)) { }
				else if (
					(operator.precedence < o2.precedence) ||
					(
						(operator.associativity === -1)
				//		implied: && (o1.precedence === o2.precendence)
					)
				) {
					output.push(operators.pop());
				}
			}

			operators.push(operator);
		}
		else if (parenthesis) {
			switch (parenthesis) {
				case "(":
					operators.push(operators[parenthesis]);
					break;
				case ")":
					var lastOperatorIndex = operators.length - 1;
					while (operators[lastOperatorIndex] !== operators["("]) {
						output.push(operators.pop());
						lastOperatorIndex--;

						if (lastOperatorIndex < 0) {
							throw new SyntaxError("Mismatched parentheses.");
						}
					}

					operators.pop();
					break;
			}
		}
	}

	var token, stack = [], a, b;
	return function infix(source) {
		console.group(source);

		operators.length = output.length = stack.length = 0;

		forEachMatch(findTokens, source, match);

		while (operators.length > 0) {
			var operator = operators.pop();
			if (operator === "(") {
				throw new SyntaxError("Mismatched parenthesis.");
			}
			else {
				output.push(operator);
			}
		}

		console.log("output: ", output.toString());

		while (output.length > 0) {
			var token = output.shift();
			if (!isNaN(token)) { stack.push(token); }
			else {
				b = stack.pop(), a = stack.pop();
				stack.push(token.execute(a, b));
			}
		}

		var result = stack[0];
		stack.length = 0;

		console.log("result: ", result);
		console.groupEnd();

		return result;
	};
})();