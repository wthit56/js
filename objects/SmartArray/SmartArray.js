if (!window.SmartArray) {
	window.SmartArray = (function () {
		function SmartArray(init) {
			// create array to wrap based on passed-in arguments
			this.array = Array.apply(this, arguments);
		}
		SmartArray.prototype = {
			array: null,

			get: function get(index) {
				var oldValue = this.array[index];
				on("accessed", oldValue, null, index, this);
				return oldValue;
			},
			set: function set(index, newValue) {
				var array = this.array;
				var oldValue = array[index];
				array[index] = newValue;
				on("overwritten", oldValue, newValue, index, this);
				on("overwrote", newValue, oldValue, index, this);

				return newValue;
			},

			push: function (values) {
				var array = this.array;

				var index = 0, newIndex = array.length - 1;
				var last = arguments.length - 1;
				var newValue;
				while (index <= last) {
					newValue = arguments[index];
					array.push(newValue);
					newIndex++;
					on("added", null, newValue, newIndex, this);
					index++;
				}

				return array.length;
			},

			splice: function splice(index, howMany, values) {
				if (
					(index >= this.length) ||
					((arguments.length > 1) && (isNaN(howMany)))
				) { return []; }

				var array = this.array;

				if (index < 0) { index = Math.max(0, this.length + index); }


				var oldValue, newValue;
				var last = (isNaN(howMany) ? array.length : Math.min(index + howMany, array.length)) - 1;
				var removedItems = array.slice(index, last + 1);

				var valuesIndex = 2, newValue;
				while (index <= last) {
					oldValue = array[index];

					if (valuesIndex < arguments.length) {
						newValue = arguments[valuesIndex];
						array.splice(index, 1, newValue);
						on("overwritten", oldValue, newValue, index, this);
						on("overwrote", newValue, oldValue, index, this);
						valuesIndex++;
						index++;
					}
					else {
						array.splice(index, 1);
						on("removed", oldValue, null, index, this);
						last--;
					}
				}

				last = arguments.length - 1;
				while (valuesIndex <= last) {
					newValue = arguments[valuesIndex];
					array.splice(index, 0, newValue);
					on("added", null, newValue, index, this);
					valuesIndex++;
					index++;
				}

				index = index + arguments.length - 2;
				last = array.length;
				while (index < last) {
					on("moved", array[index], null, index, this);
					index++;
				}

				return removedItems;
			},

			length: function () {
				return this.array.length;
			}
		};

		function on(type, oldValue, newValue, index, array) {
			var target = ((oldValue != null) ? oldValue : newValue);
			if (target && (target.on instanceof Function)) {
				target.on(type,
					(newValue != null) ? newValue : oldValue,
					index, array
				);
			}
		}


		return SmartArray;
	})();
}