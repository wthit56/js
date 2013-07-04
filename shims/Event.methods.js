if (!Event.prototype.stopPropagation) {
  	Event.prototype.stopPropagation = function () {
  		this.cancelBubble = true;
  	};
}
if (!Event.prototype.preventDefault) {
  	Event.prototype.preventDefault = function () {
  		this.returnValue = false;
  	};
}
