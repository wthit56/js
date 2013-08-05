if (console && !console.testValue) {
	var success;
	var findResult = /\{result\}/g;

	console.testValue = function (value, expected, message, failedMessage) {
		success = (value === expected);

		(success ? console.log : console.error).call(console,
			message.replace(findResult, value) +
			(
				(!success && failedMessage)
					? " " + failedMessage.replace(findResult, value)
					: ""
			)
		);
	};
}