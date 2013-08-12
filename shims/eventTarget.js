/* min
(function(w,e,l,t,a,r,A,D,_){e="eventTarget";if(!w[e]){l="EventListener",t="tachEvent", a="add", r="remove",A="at",D="de";_=w[e]={};if(w[a+l]&&w[r+l]) _[a]=a+l,_[r]=r+l;else if(w[A+t]&&w[A+t]) _[a]=A+t,_[r]=D+t;else w[e]=null;}})(window);
*/

if (!window.eventTarget) {
	window.eventTarget = (function () {
		if (window.addEventListener && window.removeEventListener) {
			return { add: "addEventListener", remove: "removeEventListener" };
		}
		else if (window.attachEvent && window.detachEvent) {
			return { add: "attachEvent", remove: "detachEvent" };
		}
		else {
			return undefined;
		}
	})();
}