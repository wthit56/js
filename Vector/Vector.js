// http://threejsdoc.appspot.com/doc/three.js/src.source/core/Vector3.js.html
if (!window.Vector) {
	window.Vector = (function () {
		var createFromPrototype = Object.create || (function () {
			function proxy() { }

			return function createFromPrototype(prototype) {
				proxy.prototype = prototype;
				return new proxy();
			};
		})();

		var clean = {
			1: [], 2: [], 3: [],
			getByDimensions: function (dimension, possibleObject) {
				var VectorDim = Vector[dimension];
				if (possibleObject instanceof VectorDim) {
					return possibleObject;
				}

				var cleanDim = clean[dimension];
				if (cleanDim.length) {
					return cleanDim.pop();
				}
				else {
					return createFromPrototype(VectorDim.prototype);
				}
			}
		};

		function Vector(x, y, z) {
			return Vector.create.apply(this, arguments);
		}
		Vector.create = function (x, y, z) {
			return new Vector[arguments.length](x, y, z);
		};

		Vector.prototype = {
			unwrap: function () {
				if (this instanceof Vector.One) {
					var value = this.value;
					this.wipe();
					return value;
				}
				else {
					return this;
				}
			},
			copyInto: function (from) {
				switch (this.dimensions) {
					case 3:
						this.z = from.z;
					case 2:
						this.x = from.x;
						this.y = from.y;
						break;
					case 1:
						if (from instanceof Vector) {
							this.value = from.value;
						}
						else {
							this.value = from;
						}
				}

				return this;
			},

			wipe: function () {
				switch (this.dimensions) {
					case 3:
						this.z = undefined;
					case 2:
						this.x = this.y = undefined;
						break;
					case 1:
						this.value = undefined;
				}

				clean[this.dimensions].push(this);
			}
		};
		Vector.wrap = function (value) {
			if (value instanceof Vector) {
				return value;
			}
			else {
				if (isNaN(value)) {
					if ("z" in value) { return Vector.Three.create(value); }
					if ("y" in value) { return Vector.Two.create(value); }
				}
				else {
					return Vector.One.create(value);
				}
			}
		};

		Vector[3] = Vector.Three = (function () {
			function Vector_Three(x, y, z) {
				return Vector_Three.create.call(this, x, y, z);
			};
			Vector_Three.create = function (x, y, z) {
				var vector = clean.getByDimensions(3, this);

				vector.x = x;
				vector.y = y;
				vector.z = z;

				return vector;
			};
			var proto = Vector_Three.prototype = createFromPrototype(Vector.prototype);
			proto.dimensions = 3;
			proto.x = proto.y = proto.z = null;

			proto["*"] = proto.multiply = proto.mul = function multiply(value) {
				if (isNaN(value)) {
					this.x *= value.x;
					this.y *= value.y;
					this.z *= value.z;
				}
				else {
					this.x *= value;
					this.y *= value;
					this.z *= value;
				}

				return this;
			};
			proto["/"] = proto.div = proto.divide = function divide() {
				if (isNaN(value)) {
					this.x /= value.x;
					this.y /= value.y;
					this.z /= value.z;
				}
				else {
					this.x /= value;
					this.y /= value;
					this.z /= value;
				}

				return this;
			};
			proto["+"] = proto.add = function add() {
				if (isNaN(value)) {
					this.x += value.x;
					this.y += value.y;
					this.z += value.z;
				}
				else {
					this.x += value;
					this.y += value;
					this.z += value;
				}

				return this;
			};
			proto["-"] = proto.sub = proto.subtract = function subtract() {
				if (isNaN(value)) {
					this.x -= value.x;
					this.y -= value.y;
					this.z -= value.z;
				}
				else {
					this.x -= value;
					this.y -= value;
					this.z -= value;
				}

				return this;
			};

			return Vector_Three;
		})();

		Vector[2] = Vector.Two = (function () {
			function Vector_Two(x, y) {
				return Vector_Two.create.call(this, x, y);
			};
			Vector_Two.create = function (x, y) {
				var vector = clean.getByDimensions(2, this);

				vector.x = x;
				vector.y = y;

				return vector;
			};
			var proto = Vector_Two.prototype = createFromPrototype(Vector.prototype);
			proto.dimensions = 2;
			proto.x = proto.y = null;

			var Three_proto = Vector.Three.prototype;
			var findZStatements = /(?=[\n\r])\s+[^\n\r]*this\.z\s+[^\n\r;]*;/g;
			eval(
				"proto['*'] = proto.multiply = proto.mul = " + Three_proto["*"].toString().replace(findZStatements, "") + ";\n" +
				"proto['/'] = proto.divide = proto.div = " + Three_proto["/"].toString().replace(findZStatements, "") + ";\n" +
				"proto['+'] = proto.add = " + Three_proto["+"].toString().replace(findZStatements, "") + ";\n" +
				"proto['-'] = proto.subtract = proto.sub = " + Three_proto["-"].toString().replace(findZStatements, "") + ";"
			);

			return Vector_Two;
		})();

		Vector[1] = Vector.One = (function () {
			function Vector_One(value) {
				return Vector_One.create.call(this, value);
			};
			Vector_One.create = function (value) {
				var vector = clean.getByDimensions(1, this);
				vector.value = value;
				return vector;
			};
			var proto = Vector_One.prototype = createFromPrototype(Vector.prototype);
			proto.dimensions = 1;
			proto.value = null;

			proto["*"] = proto.multiply = proto.mul = function (value) {
				this.value *= value;
				return this;
			};
			proto["/"] = proto.divide = proto.div = function (value) {
				this.value /= value;
				return this;
			};
			proto["+"] = proto.add = function (value) {
				this.value += value;
				return this;
			};
			proto["-"] = proto.subtract = proto.sub = function (value) {
				this.value -= value;
				return this;
			};

			return Vector_One;
		})();

		return Vector;
	})();
}