if (!Document.prototype.getElementsById) {
  	// Document || Element
  	Document.prototype.getElementsById = function (id) {
  		var elems = [], elem;
  		while (elem = document.getElementById(id)) { // assignment
  			elems.push(elem);
  			elem.id = "not-" + id;
  		}

  		var i = 0;
  		while (elem = elems[i++]) { // assignment
  			elem.id = id;
  		}

  		return elems;
  	};
}
