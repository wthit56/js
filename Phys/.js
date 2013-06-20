var Phys = (function () {
	function Phys(position, mass, velocity, acceleration, friction) {
		if (position) { this.position = position; }
		if (mass) { this.mass = mass; }
		if (velocity) { this.velocity = velocity; }
		if (acceleration) { this.acceleration = acceleration; }
		if (friction) { this.friction = friction; }
	}
	Phys.prototype = {
		position: 0,
		velocity: 0,
		acceleration: 0,
		friction: 0,
		mass: 1,

		timeSpeed: 1,
		currentTime: null,
		update: (function () {
			var previous;
			return function (time) {
				if (time == null) {
					previous = this.currentTime;
					this.currentTime = new Date();
				}
				else {
					this.currentTime = new Date();
					previous = new Date().setMilliseconds(this.currentTime.getMilliseconds() - time);
				}

				time = (this.currentTime - previous) * this.timeSpeed;

				this.position += this.velocity * time;

				// this.velocity += ((this.acceleration / this.mass) - (this.friction * this.velocity)) * time;
				this.velocity += (this.acceleration / this.mass) * time;
				this.velocity *= (1 - this.friction);
			};
		})()
	};

	return Phys;
})();