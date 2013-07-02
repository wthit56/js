if (!window.joQ && !window.$) {
	window.joQ = window.$ = (function () {
		if (!window.eventTarget) {
			eval('(function(w,e,l,t,a,r,A,D,_){e="eventTarget";if(!w[e]){l="EventListener",t="tachEvent", a="add", r="remove",A="at",D="de";_=w[e]={};if(w[a+l]&&w[r+l]) _[a]=a+l,_[r]=r+l;else if(w[A+t]&&w[A+t]) _[a]=A+t,_[r]=D+t;else w[e]=null;}})(window);');
		}

		var isHTML = /<.+>/;
		var container = document.createElement("CONTAINER");

		var joQ_Array = (function () {
			var i, l;

			function joQ_Array(first) {
				l = arguments.length;

				if ((l === 1) && (typeof (first) === "number")) {
					this.length = first;
				}
				else if (l > 0) {
					for (i = 0; i < l; i++) {
						this.push(arguments[i]);
					}
				}
			}
			var proto = joQ_Array.prototype = Object.create(Array.prototype);
			proto.each = function (action) { return this.forEach(action); };

			return joQ_Array;
		})();

		var joQ_NodeList = (function () {
			var i, l;
			function joQ_NodeList(nodeList) {
				if (!(nodeList instanceof NodeList)) { return; }

				for (i = 0, l = nodeList.length; i < l; i++) {
					this.push(nodeList[i]);
				}
			}
			var proto = joQ_NodeList.prototype = Object.create(joQ_Array.prototype);
			proto.add = (function () {
				var i, l;

				return function (nodes) {
					l = arguments.length;
					if (l <= 0) { return; }

					for (i = 0; i < l; i++) {
						this.push(arguments[i]);
					}

					return this;
				};
			})();
			proto.addClass = (function () {
				var args, i, l, classList;
				function action(current) {
					l = args.length, classList = current.classList;
					for (i = 0; i < l; i++) {
						classList.add(args[i]);
					}
				}

				return function (classes) {
					args = arguments;
					this.each(action);

					return this;
				}
			})();
			proto.after = (function () {
				var nodes_args, i, l, parent, sibling, node, first;
				function action(current) {
					parent = current.parentNode;
					if (parent) {
						sibling = current.nextElementSibling;
						for (i = 0; i < l; i++) {
							node = (first ? nodes_args[i] : nodes_args[i].cloneNode(true));
							console.log(node);

							if (sibling) {
								console.log("before");
								parent.insertBefore(node, sibling);
							}
							else {
								console.log("append");
								parent.appendChild(node);
							}
						}
						first = false;
					}
				}

				return function (nodes) {
					nodes_args = arguments; l = arguments.length; first = true;
					this.each(action);

					return this;
				}

			})();
			proto.append = (function () {
				var nodes_args, i, l;
				function action(current) {
					for (i = 0; i < l; i++) {
						current.appendChild(args[i].cloneNode(true));
					}
				}

				return function (nodes) {
					nodes_args = arguments; l = args.length;
					this.each(action);

					return this;
				}
			})();
			proto.appendTo = (function () {
				var target_arg;
				function action(current) {
					target_arg.appendChild(current);
				}

				return function (target) {
					target_arg = target;
					this.each(action);

					return this;
				}
			})();
			proto.attr = (function () {
				var name_arg, value_arg;
				function action(current) {
					current.setAttribute(name_arg, value_arg);
				}

				return function (name, value) {
					if (value != null) {
						name_arg = name; value_arg = value;
						this.each(action);
					}
					else {
						return this[0].getAttribute(name);
					}

					return this;
				}
			})();
			proto.before = (function () {
				var nodes_args, i, l, parent, node, first;
				function action(current) {
					parent = current.parentNode;
					if (parent) {
						for (i = 0; i < l; i++) {
							node = (first ? nodes_args[i] : nodes_args[i].cloneNode(true));
							parent.insertBefore(node, current);
						}
						first = false;
					}
				}

				return function (nodes) {
					nodes_args = arguments; l = arguments.length; first = true;
					this.each(action);

					return this;
				}
			})();
			proto.bind = (function () {
				var type_arg, handler_arg;
				function action(current) {
					current[eventTarget.add](type_arg, handler_arg);
				}

				function bind(type, handler) {
					type_arg = type; handler_arg = handler;
					this.each(action);

					return this;
				};

				return bind;
			})();
			proto.bind_preventBubble = (function () {
				function preventBubble(e) {
					if (!e) { e = window.event; }

					if (e.preventBubble) { e.preventBubble(); }
					if (e.stopPropagation) { e.stopPropagation(); }
					if (e.cancelBubble !== undefined) { e.cancelBubble = truel }
				}

				return function (type) {
					return proto.bind.call(this, type, preventBubble);
				};
			})();


			return joQ_NodeList;
		})();

		var i, l;
		function joQ(first) {
			if (test instanceof HTMLElement) {
				
			}
			else if (isHTML.test(first)) {
				container.innerHTML = first;
				return new joQ_NodeList(container.childNodes);
			}
			else {
				return new joQ_NodeList(document.querySelectorAll(first));
			}
		}

		return joQ;
	})();
}