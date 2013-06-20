var gravity = 9.8;

Phys.prototype.timeSpeed = 0.01;
var p = {
  	x: new Phys(0, 0.5, 0), y: new Phys(100, 0.5, -50, gravity),
  	width: 100, height: 100
};

var draw = (function () {
  	var render = document.createElement("DIV");
  	render.style.cssText = "background:black; width:" + p.width + "px; height:" + p.height + "px; position:absolute;";
  	document.body.appendChild(render);

  	return function () {
  		render.style.left = p.x.position + "px";
  		render.style.top = p.y.position + "px";
  	}
})();

function bound() {
	if (p.y.position + p.height > window.innerHeight) {
		controls.grounded = true;

		p.y.position = (window.innerHeight - p.height);
		p.y.velocity = 0;
		p.y.acceleration = 0;
	}
}

p.x.update(0);
p.y.update(0);

var maxSpeedX = 0;
requestAnimationFrame(function raf() {
	if (controls.grounded && (controls.y !== 0)) {
		p.y.velocity = -50;
		p.y.acceleration = gravity;
		controls.grounded = false;
	}

	if (controls.grounded) {
		if (controls.x !== 0) {
			p.x.friction = 0;
			p.x.acceleration = controls.x * char.push;
		}
		else {
			p.x.friction = 0.25;
			p.x.acceleration = 0;
		}
	}
	else {
		if (controls.x !== 0) {
			p.x.acceleration = controls.x * (char.push / 2);
		}
		else {
			p.x.acceleration = 0;
		}
	}

	p.x.update();
	p.y.update();

	bound();
	draw();

	if (Math.abs(p.x.velocity) > maxSpeedX) {
		maxSpeedX = Math.abs(p.x.velocity);
		document.title = maxSpeedX;
	}

	requestAnimationFrame(raf);
});

var controls = {
  	x: 0, y: 0,
  	jump: false,
	grounded:false
};

var char = {
	push: 10
};
window.addEventListener("keydown", function (e) {
	switch (e.which) {
		case 32: // space
		case 38: // up
		case 87: // W
			if (controls.grounded) { controls.y = -1; }
			break;
		case 37: // left
		case 65: // A
			controls.x = -1;
			break;
		case 39: // right
		case 68: // D
			controls.x = 1;
			break;
		case 17: // ctrl
		case 40: // down
		case 83: // S
			break;
	}
});

window.addEventListener("keyup", function (e) {
	switch (e.which) {
		case 32: // space
		case 38: // up
		case 87: // W
			controls.y = 0;
			break;
		case 37: // left
		case 65: // A
		case 39: // right
		case 68: // D
			controls.x = 0;
			break;
		case 17: // ctrl
		case 40: // down
		case 83: // S
			break;
	}
});

