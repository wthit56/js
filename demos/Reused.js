// data:text/html;ascii,<script src="http://localhost:45917/demos/Reused.js"></script>

// holds all instantiated Obj objects in memory for reuse
var clean = [];

function Obj(a, b) {
	// reset newObj variable
	var newObj = false;
	
	// when function was not called as a "new" contructor...
	//	(like a "factory" function)
	if (!(this instanceof Obj)) {
		// ...use newly created object with Obj's prototype
		newObj = Object.create(Obj.prototype);
	}
	// when there are clean objects in memory...
	else if (clean.length) {
		// ...remove and use last clean object
		newObj = clean.pop();
	}

	// when a new object has been found/created...
	if (newObj) {
		// ...apply arguments to object
		Obj.apply(newObj, arguments);
		// and return
		return newObj;
	}

	// the following will run only when an "this" is an Obj object
	//	and there were no "clean" objects in memory
	
	this.a = a;
	this.b = b;

	// mark the object as "unclean", or "live"
	this.isClean = false;
}
Obj.prototype = {
	// this property can be used to tell if the object
	//	should be considered "live" or "dead", "clean" or "unclean"
	//	in case the user of this object did not release any references to it
	//	when the object was .destroy()'d
	isClean: true,

	a: null, b: null,

	destroy: function () {
		// mark the object as "clean" or "dead"
		this.isClean = true;

		this.a = null;
		this.b = null;
		
		// add the object to the list of clean objects in memory
		clean.push(this);
	}
};

function log(name, obj) {
	console.log(name + "  ", obj, "clean.length: " + clean.length);
}

// tests
var a = new Obj(1, 2);
a.wasA = true;
log("var a = new Obj(1, 2); a.wasA = true;",a);
var b = Obj(3, 4);
log("Obj(3, 4);", b);
a.destroy();
log("a.destory();", a);
var c = new Obj(5, 6);
log("new Obj(5, 6);", c);
