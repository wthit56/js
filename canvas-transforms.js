/// data:text/html;ascii,<script src="http://localhost:45917/canvas-transforms.js"></script>

// eventTarget
(function(w,e,l,t,a,r,A,D,_){e="eventTarget",l="EventListener",t="tachEvent", a="add", r="remove",A="at",D="de";if(!w[e]){_=w[e]={};if(w[a+l]&&w[r+l]) _[a]=a+l,_[r]=r+l;else if(w[A+t]&&w[A+t]) _[a]=A+t,_[r]=D+t;else w[e]=null;}})(window);

window[eventTarget.add]("load", function () {
	var canvas = document.body.appendChild(document.createElement("CANVAS"));
	canvas.width = canvas.height = 500;

	var context = canvas.getContext("2d");

	function drawCompass() {
		context.beginPath();
		context.arc(0, 0, 10, 0, Math.PI * 2);
		context.moveTo(-10, -50);
		context.lineTo(0, -60);
		context.lineTo(10, -50);
		context.moveTo(0, -60);
		context.lineTo(0, 30);
		context.moveTo(-30, 0);
		context.lineTo(30, 0);
		context.stroke();
	}

	context.translate(-100, -100);

	context.save();
	context.translate(200, 200);
	context.rotate(Math.PI / 2);
	drawCompass();
	context.restore();

	context.save();
	context.translate(250, 250);
	context.rotate(Math.PI / 4);
	drawCompass();
	context.restore();
});
