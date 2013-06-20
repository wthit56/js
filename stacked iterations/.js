// array iterator shim
if (!Array.prototype.forEach) {
	Array.prototype.forEach = function (callback) {
		var i = 0, l = this.length;
		while (i < l) {
			callback.call(this, this[i], i, this);
			i++;
		}
	};
}
if (!Array.prototype.filter) {
	Array.prototype.filter = function (callback) {
		var i = 0, l = this.length;
		while (i < l) {
			if (!callback.call(this, this[i], i, this)) {
				this.splice(i, 1);
				l--;
				continue;
			}

			i++;
		}
	};
}

// array iterator chaining
function createChainingFunction(fn) {
	return function () {
		fn.apply(this, arguments);
		return this;
	}
}
Array.prototype.forEach = createChainingFunction(Array.prototype.forEach);
//Array.prototype.filter = createChainingFunction(Array.prototype.filter);

console.group("filter");
function filterCallback(v, i, a) {
	var r = !!(v % 2);
	console.log("filter callback: ", arguments, "\treturn: ", r);
	return r;
}
console.log([1, 2, 3].filter(filterCallback));
console.groupEnd();

console.group("forEach");
function forEachCallback(v, i, a) {
	a[i] = v + 2;
	console.log("forEach callback: ", arguments);
}

console.log([1, 2, 3].forEach(forEachCallback));
console.groupEnd();

console.group("filter forEach");
console.log([1, 2, 3].filter(filterCallback).forEach(forEachCallback));
console.groupEnd();

console.group("Iterator");
{
	function Iterator(array) {
		this.array = array;
	}
	Iterator.prototype = {
		array: null,

		paused: false,
		stack: null,
		pause: function () {
			if (!this.paused) {
				this.paused = true;

				if (!this.stack) { this.stack = []; }
				else if (this.stack.length > 0) { this.stack.splice(0); }
			}

			return this;
		},
		resume: function () {
			if (this.stack && (this.stack.length > 0)) {
				var i = 0, ic, is = this.array, il = is.length;
				var j, jc, js = this.stack, jl = js.length;

				items:
				while (i < il) {
					j = 0;
					stack:
					while (j < jl) {
						jc = js[j];
						if (jc.forEach) { jc.forEach.call(this, is[i], i, is); }
						else if (jc.filter) {
							if (!jc.filter.call(this, is[i], i, is)) {
								is.splice(i, 1);
								il--;
								continue items;
							}
						}
						j++;
					}

					i++;
				}
			}

			this.paused = false;
			return this;
		},

		forEach: function (callback) {
			if (this.paused) { this.stack.push({ forEach: callback }); }
			else { this.array = this.array.forEach(callback); }
			return this;
		},
		filter: function (callback) {
			if (this.paused) { this.stack.push({ filter: callback }); }
			else { this.array = this.array.filter(callback); }
			return this;
		}
	};

	console.group("filter");
	console.log(new Iterator([1, 2, 3]).filter(filterCallback).array);
	console.groupEnd();

	console.group("forEach");
	console.log(new Iterator([1, 2, 3]).forEach(forEachCallback).array);
	console.groupEnd();

	console.group("filter, forEach");
	console.log(new Iterator([1, 2, 3]).filter(filterCallback).forEach(forEachCallback).array);
	console.groupEnd();

	console.group("paused: filter, forEach :resume");
	console.log(new Iterator([1, 2, 3]).pause().filter(filterCallback).forEach(forEachCallback).resume().array);
	console.groupEnd();
}
console.groupEnd();
