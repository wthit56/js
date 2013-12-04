var List = (function () {
	function List(initArgs) {
		function list(index, value) {
			return getset.apply(list, arguments);
		}
		list.constructor = List;

		list.data = {};

		var count;
		list.__defineGetter__("count", function () { return count; });
		list.__defineSetter__("count", function (value) {
			if (value < 0) { throw new RangeError("Invalid array length"); }
			var oldCount = count;
			count = value;
			checkCount(this, oldCount);
		});

		if ((arguments.length === 1) && (typeof (arguments[0]) === "number")) {
			count = arguments[0];
		}
		else {
			count = 0;

			if (arguments.length > 0) {
				List.prototype.push.apply(list, arguments);
			}
		}

		var proto = List.prototype;
		for (var method in proto) {
			if (proto.hasOwnProperty(method)) {
				list[method] = proto[method];
			}
		}

		return list;
	}

	function getset(index, value) {
		if (arguments.length === 1) {
			return this.data[index];
		}
		else {
			this.data[index] = value;
			if (index >= this.count) {
				this.count = index + 1;
			}
			return value;
		}
	}

	function checkCount(list, oldCount) {
		if (list.count < oldCount) {
			for (var i = list.count, l = oldCount; i < l; i++) {
				if (i in list.data) { delete list.data[i]; }
			}
		}
	}

	function reposition(list, from, to) {
		var data = list.data;
		var diff = to - from;
		var count = list.count;
		while (from < count) {
			if (from in data) { data[from + diff] = data[from]; }
			from++;
		}

		list.count += diff;
	}

	function sanitizeIndex(index, max, def) {
		if (index == null) { return def; }
		else if (index < 0) { return ((index % max) + max) % max; }
		else if (index > max) { return max; }
		return index;
	}

	List.prototype = {
		pop: function () {
			if (this.count > 0) {
				var item = this.data[this.count - 1];
				this.count--;
				return item;
			}
		},
		push: function (values) {
			var count = this.count;
			for (var i = 0, l = arguments.length; i < l; i++) {
				this.data[count + i] = arguments[i];
			}

			return (this.count += arguments.length);
		},

		reverse: function () {
			var length = this.count;
			if (length <= 1) { return this; }

			var data = this.data, off;
			if (length === 2) {
				off = data[0];
				data[0] = data[1];
				data[1] = off;
				off = null;
				return this;
			}

			var mid = (length / 2) | 0;
			for (var i = 0; i < mid; i++) {
				off = data[i];
				data[i] = data[length - i - 1];
				data[length - i - 1] = off;
			}
			off = null;

			return this;
		},

		shift: function () {
			if (this.count === 0) { return undefined; }

			var item = this.data[0];
			reposition(this, 1, 0);
			return item;
		},
		unshift: function (values) {
			var l = arguments.length;
			reposition(this, 0, l);
			for (var i = 0; i < l; i++) {
				this.data[i] = arguments[i];
			}

			return this.count;
		},

		sort: (function () {
			function sort(sortingFunction) {
				if (sortingFunction == null) { sortingFunction = defaultSortingFunction; }

				var data = this.data;
				var j, off;
				for (var i = 1, l = this.count; i < l; i++) {
					j = i;
					while ((j > 0) && (sortingFunction(data[j - 1], data[j]) > 0)) {
						off = data[j - 1];
						data[j - 1] = data[j];
						data[j] = off;
						j--;
					}
				}
				off = null;

				return this;
			}

			function defaultSortingFunction(a, b) {
				return "" + a < "" + b ? -1 : 1;
			}

			return sort;
		})(),

		splice: function (from, count, values) {
			if ((from == null) || (count == null)) { throw "Incorrect invokation of splice." }

			if (count === 0) { return new List(); }

			from = sanitizeIndex(from, this.count, 0);

			var removed;
			if (count > 0) {
				removed = this.slice(from, from + count);
			}

			var valueCount = arguments.length - 2,
				diff = valueCount - count;

			if (diff > 0) {
				reposition(this, from, from + diff);
			}
			else if (diff < 0) {
				reposition(this, from - diff, from);
			}

			for (var i = 0; i < diff; i++) {
				this.data[from + i] = arguments[i + 2];
			}

			return removed;
		},


		concat: function () {
			var into = this.slice(0), count = into.count;

			for (var i = 0, il = arguments.length; i < il; i++) {
				var arg = arguments[i];
				if (arg.constructor === List) {
					for (var j = 0, jl = arg.count; j < jl; j++) {
						into.data[count++] = arg.data[j];
					}
				}
				else {
					into.data[count++] = arg;
				}
			}

			into.count = count;
			return into;
		},

		join: function (separator) {
			if (this.count === 0) { return ""; }
			else if (this.count === 1) { return "" + this.data[0]; }

			var result = "", item;
			if (0 in this.data) { result += this.data[0]; }

			for (var i = 1, l = this.count; i < l; i++) {
				if (!(i in this.data)) { result += separator; }
				else { result += separator + this.data[i]; }
			}

			return result;
		},

		slice: function (begin, end) {
			var data = this.data, count = this.count;

			begin = sanitizeIndex(begin, count, 0);
			end = sanitizeIndex(end, count, count);

			var into = new List(end - begin);
			for (var i = 0, l = into.count; i < l; i++) {
				into.data[i] = data[begin + i];
			}

			return into;
		},

		indexOf: function (value) {
			for (var i = 0, l = this.count; i < l; i++) {
				if (this.data[i] === value) { return i; }
			}

			return -1;
		},
		lastIndexOf: function (value) {
			for (var i = this.count - 1; i >= 0; i--) {
				if (this.data[i] === value) { return i; }
			}

			return -1;
		},


		forEach: function (callback, context) {
			for (var i = 0, l = this.count; i < l; i++) {
				if (i in this.data) {
					callback.call(context, this.data[i], i, this);
				}
			}
		},
		every: function (callback, context) {
			for (var i = 0, l = this.count; i < l; i++) {
				if ((i in this.data) && !callback.call(context, this.data[i], i, this)) {
					return false;
				}
			}

			return true;
		},
		some: function (callback, context) {
			for (var i = 0, l = this.count; i < l; i++) {
				if ((i in this.data) && callback.call(context, this.data[i], i, this)) {
					return true;
				}
			}

			return false;
		},
		filter: function (callback, context) {
			var results = new List();
			for (var i = 0, l = this.count; i < l; i++) {
				if ((i in this.data) && callback.call(context, this.data[i], i, this)) {
					results.push(this.data[i]);
				}
			}
			return results;
		},
		map: function (callback, context) {
			var results = new List();
			for (var i = 0, l = this.count; i < l; i++) {
				if (i in this.data) {
					results.push(callback.call(context, this.data[i], i, this));
				}
			}
			return results;
		},
		reduce: function (callback, initial) {
			var result = initial;
			for (var i = 0, l = this.count; i < l; i++) {
				if (i in this.data) {
					result = callback.call(this, result, this.data[i], i, this);
				}
			}
			return result;
		},
		reduceRight: function (callback, initial) {
			var result = initial;
			for (var i = this.count - 1; i >= 0; i--) {
				if (i in this.data) {
					result = callback.call(this, result, this.data[i], i, this);
				}
			}
			return result;
		},

		toString: function () {
			return this.join(",");
		},
		valueOf: function () {
			return this;
		},

		"delete": function (index) {
			delete this.data[index];
			return true;
		}
	};

	return List;
})();