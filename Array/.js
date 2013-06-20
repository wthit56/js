
  	function AEL(target, event, listener) {
  		return (
  	        (target.addEventListener || target.attachListener)
  	            .apply(target, Array.prototype.slice.call(arguments, 1))
  	    );
  	}
  	function REL(target, event, listener) {
  		return (
  	        (target.removeEventListener || target.dettachListener)
  	            .apply(target, Array.prototype.slice.call(arguments, 1))
  	    );
  	}


  	var ul = document.createElement("UL");
  	ul.width = 0;

  	var newValue = (function () {
  		var options = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  	        i = -1;

  		return function newValue() {
  			i = (i + 1) % options.length;
  			return options[i];
  		};
  	})();


  	function push() {
  		var li = ul.appendChild(document.createElement("LI"));
  		li.innerHTML = newValue();

  		li.offsetLeft;
  		li.className = "push";

  		AEL(li, "webkitTransitionEnd", function pushTransition(e) {
  			if (e.propertyName === "opacity") {
  				ul.width += 100;
  				ul.style.width = ul.width + "px";
  				REL(li, "webkitTransitionEnd", pushTransition);
  			}
  		});

  		console.log("push returned: " + ul.childNodes.length);
  	}

  	function pop() {
  		var popped = ul.childNodes[ul.childNodes.length - 1];
  		popped.className = "pop";
  		
  		AEL(popped, "webkitTransitionEnd", function (e) {
  			if (e.propertyName === "opacity") {
				// fix drawing issue
				popped.style.opacity = 1;

  				ul.removeChild(popped);
  				ul.width -= 100;
  				ul.style.width = ul.width + "px";
  			}
  		});

  		console.log("popped returned: " + popped.innerHTML);
  	}


  	var then = (function () {
  		function add(action, ms) {
  			this.ms += ms;
  			setTimeout(action, this.ms);
  			return this;
  		}

  		return function then(action, ms) {
  			var _ = { then: add, ms: 0 };
  			return add.call(_, action, ms);
  		};
  	})();

  	AEL(window, "load", function () {

  		document.body.appendChild(ul);

  		then(function () {
  			push();
  		}, 0).then(function () {
  			pop();
  		}, 2000);

  		AEL(document.getElementById("pop_button"), "click", function (e) {
  			e.preventDefault();
  			pop();
  		});

  		AEL(document.getElementById("push_button"), "click", function (e) {
  			e.preventDefault();
  			push();
  		});

  	});
