if (!Array.prototype.forEach) {
	Array.prototype.forEach = function (callback, context) {
		if (context === undefined) { context = window; }
		var i = 0, l = this.length;
		while (i < l) {
			callback.call(context, this[i], i, this);
			i++;
		}
	};
}

if (!Array.prototype.some) {
	Array.prototype.some = function (callback, context) {
		if (context === undefined) { context = window; }
		var i = 0, l = this.length;
		while (i < l) {
			if (callback.call(context, this[i], i, this) === true) { return true; }
			i++;
		}

		return false;
	};
}

if (!Array.prototype.map) {
	Array.prototype.map = function (callback) {
		var mapped = new Array(this.length);
		
		var i = 0, l = this.length;
		while (i < l) {
			mapped[i] = callback(this[i], i, this);
			i++;
		}

		return mapped;
	};
}

if (!Array.prototype.filter) {
	Array.prototype.filter = function (callback) {
		var filtered = [];
		
		var i = 0, l = this.length;
		while (i < l) {
			if (callback(this[i], i, this)) { filtered.push(this[i]); }
			i++;
		}

		return filtered;
	};
}
