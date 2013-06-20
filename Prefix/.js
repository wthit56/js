var prefix = (function () {
	function prefix(input) {
		var vendor = "-webkit-";

		return prefixValues(prefixProperties(input, vendor), vendor);

		return input.replace(
			prefix.vendors["-webkit-"].prop_regex,
			function (match, prop_found, pre, prop, value) {
				console.log(arguments);

				if (prop_found) {
					return (
						pre + prop + ":" + prefixValue("-webkit-", value) + "; " +
						"-webkit-" + prop + ":" + prefixValue("-webkit-", value)
					);
				}

				return match;
			}
		);
	}


	prefix.vendors = {
		"-webkit-": [
			"filter:",
			"linear-gradient("
		]
	};

	prefix.build = (function () {
		var isVendor = /^-[^-]*-$/,
			getInfo = /^([^:(\s]*)(?:(:)|(\())$/;
		var vendor,
			i, s, l, info,
			props = [], fns = [];

		function build() {
			var v = prefix.vendors;
			for (vendor in v) {
				if (!isVendor.test(vendor)) { continue; }

				i = 0, s = v[vendor], l = s.length;
				while (i < l) {
					info = getInfo.exec(s[i]);
					if (info[2]) { props.push(info[1]); }
					else if (info[3]) { fns.push(info[1]); }

					i++;
				}
				console.group(vendor);
				console.log("props: ", props);
				console.log("fns: ", fns);

				fns.str = fns.join("|");

				s.properties = new RegExp("[;\\s\\{]((?:" + props.join("|") + ")\\s*:\\s*)([^;]*)", "g");
				s.values = new RegExp("[;\\s\\{]([a-zA-Z-]*?:)([^;]*?[\\s,]?(?:" + fns.str + ")\\([^;]*)", "g");
				s.functions = new RegExp("(^|[\\s,])((?:" + fns.str + ")\\()", "g");

				console.groupEnd();

				props.splice(0);
				fns.splice(0);
				fns.str = null;
			}
		};
		build();

		return build;
	})();


	function prefixProperties(input, vendor) {
		return input.replace(
		//              property     value
		//	/[;\s\{]((?:filter)\s*:\s*)([^;]*)/g,
			prefix.vendors[vendor].properties,
			function (match, property, value) {
				return (
					match + "; " +
					vendor + property + value
				);
			}
		);
	}

	function prefixValues(input, vendor) {
		return input.replace(
		//          property      value
		//	/[;\s\{]([a-zA-Z-]*?:)([^;]*?[\s,]?(?:linear-gradient)\([^;]*)/g,
			prefix.vendors[vendor].values,
			function (match, property, value) {
				return (
					match + "; " +
					property + prefixFunctions(value, vendor)
				);
			}
		);
	}

	function prefixFunctions(input, vendor) {
		return input.replace(
		//   pre    fn
		//	/(^|[\s,])((?:linear-gradient)\()/g,
			prefix.vendors[vendor].functions,
			function (match, pre, fn) {
				return (pre + vendor + fn);
			}
		);

	}

	if (false) { // testing
		var vendor = "-webkit-";
		var test = "body {background:red linear-gradient(top, black, red) url(); filter:blur(1px);}"

		var output = test;
		console.log(output);
		output = prefixProperties(output, vendor);
		console.log(output);
		output = prefixValues(output, vendor);
		console.log(output);
	}

	return prefix;
})();