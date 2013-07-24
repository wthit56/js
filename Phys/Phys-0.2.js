window.Phys = (function () {
	function Phys(position, mass, velocity, acceleration, time) {
		this.position = position || 0;
		this.mass = (mass != null) ? mass : 1;
		this.velocity = velocity || 0;
		this.acceleration = acceleration || 0;
		this.time = time || 0;
	}
	Phys.prototype = {
		position: 0,
		mass: 1,
		velocity: 0,
		acceleration: 0,
		time: 0,

		findAverageVelocity: function (newPosition, newTime) {
			return (newPosition - this.position) / (newTime - this.time);
		},
		findTimeChangeForVelocity: function (newVelocity) {
			return (newVelocity - this.velocity) / this.acceleration;
		},
		findAccelerationByVelocityAndPosition: function (newPosition, newVelocity) {
			//2AS = Vs^2 - Vi^2;
			//A = (Vs^2 - Vi^2) / 2S;
			return ((newVelocity * newVelocity) - (this.velocity * this.velocity)) / (2 * (newPosition - this.position));
		},
		findVelocity: function (newTime) {
			return this.velocity + (this.acceleration * (newTime - this.time));
		},

		findTimeChangeForPosition: function (newPosition) {
			return (newPosition - this.position) / this.velocity;
		},
		findPosition: function (newTime) {
			// t * (1/2) * (Vi + Vf)
			return this.position + ((newTime - this.time) * 0.5 * (this.velocity + (this.acceleration * (newTime - this.time))));
		},
		findAcceleration: function (newVelocity, newTime) {
			return (newVelocity - this.velocity) / (newTime - this.time);
		},

		applyForce: function (force) {
			//this.a
		}
	};

	return Phys;
})();