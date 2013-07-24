if (!window.Phys) {
	window.Phys = function (initial, target, time) {
		var state = {};

		target.time = (target.time != null) ? target.time :
			(target.timeChange != null) ? initial.time + target.timeChange :
			null;

		if (target.time != null) {
			if (target.position != null) {
				target.velocity =
					initial.velocity + // initial
					((target.position - initial.position) * 2) // to make average correct
				;
			}
		}

		return target;
	}

	//window.Phys = (function () {
	//	function Phys(initial, time) {
	//		this.state = initial;

	//		this.time = (time != null) ? +time : +new Date();
	//		this.targets = [];
	//	}
	//	Phys.prototype = {
	//		state: null,

	//		time: 0,
	//		targets: null,

	//		setTime: (function () {
	//			function setTime(time) {
	//				var timeChange = time - this.time;

	//				var targets = this.targets;
	//				if (targets.length > 0) {
	//					var i = 0, l = targets.length;
	//					var initial = this.state, target;
	//					while (i < l) {
	//						target = targets[i];

	//						calc(initial, target, this.initial, time);

	//						//if (final.time > time) { break; }

	//						initial = target;
	//						i++;
	//					}
	//				}

	//				this.time = time;
	//			};

	//			function calc(initial, target, state, time) {
	//				if (target.time == null) {
	//					//if(position in target){state.position=
	//				}
	//			}

	//			return setTime;
	//		})()
	//	};

	//	var State = (function () {
	//		function State() {
	//			var proto = State.prototype;

	//			this.position = proto.position;
	//			this.velocity = proto.velocity;
	//			this.acceleration = proto.acceleration;
	//			this.mass = proto.mass;
	//		}
	//		State.prototype = {
	//			position: 0,
	//			velocity: 0,
	//			acceleration: 0,
	//			mass: 1,

	//			setPosition: function (value) {
	//				this.position = value;
	//				return this;
	//			},
	//			setVelocity: function (value) {
	//				this.velocity = value;
	//				return this;
	//			},
	//			setAcceleration: function (value) {
	//				this.acceleration = value;
	//				return this;
	//			},
	//			setMass: function (value) {
	//				this.mass = value;
	//				return this;
	//			}
	//		};

	//		return State;
	//	})();

	//	return Phys;
	//})();
}