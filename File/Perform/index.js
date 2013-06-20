module.exports = (function () {
	function Perform(actions) {
		this.parallel = Perform.prototype.parallel;
		this.callback = Perform.prototype.callback;
		this.running = Perform.prototype.running;

		this.actions = arguments;
		this.actionsLength = this.actions.length;
		this.actionsCompleted = 0;
	}

	Perform.prototype = {
		parallel: false,
		callback: function (error) {
			if (error) { throw error; }
		},
		running: false,

		actions: null,
		actionsCompleted: 0,
		actionComplete: function () {
			this.actionsCompleted++;

			if (!this.running) { return; }

			// all actions completed
			if (this.actionsCompleted >= this.actions.length) {
				this.callback.call(this);
			}
			// actions still left to do, and not parallel
			else if (!this.parallel) {
				runAction.call(this, this.actions[this.actionsCompleted]);
			}

			return this;
		},

		add: function (actions) {
			Array.prototype.push.apply(this.actions, arguments);
			if (this.parallel) {
				for (var i = 0, l = arguments.length; i < l; i++) {
					runAction.call(this, arguments[i]);
				}
			}

			return this;
		},

		end: function (error) {
			if (!this.running) { return; }
			this.running = false;

			Array.prototype.splice.call(this.actions, this.actionsLength);

			this.callback.call(this, error);
			return this;
		},

		run: function (callback) {
			if (this.running) { return; }

			if (callback) { this.callback = callback; }

			if (!this.actions || this.actions.length <= 0) {
				this.callback.call(this, new Error("No actions to perform."));
				return;
			}

			this.actionsCompleted = 0;
			this.running = true;

			if (this.parallel) {
				for (var i = 0, l = this.actions.length; i < l; i++) {
					runAction.call(this, this.actions[i]);
				}
			}
			else {
				runAction.call(this, this.actions[this.actionsCompleted]);
			}

			return this;
		}
	};

	function runAction(action) {
		var control = this;

		if (action instanceof Perform) {
			action.run(function () {
				control.actionComplete();
			});
		}
		else if (action instanceof Function) {
			action.call(control);
		}
		else {
			control.end(new Error("Action not a function or a Perform object.", action));
		}
	}

	Perform.parallel = function Perform_parallel(actions) {
		Perform.apply(this, arguments);
		this.parallel = true;
	};
	Perform.parallel.prototype = Object.create(Perform.prototype);

	return Perform;
})();
