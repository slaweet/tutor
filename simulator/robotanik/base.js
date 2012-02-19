// Copyright  2009, Blake Coverett 
// Use and Redistribute Freely under the Ms-PL
// http://www.opensource.org/licenses/ms-pl.html
// Modified for tutor by Radek Pelanek

var base = (function(){
	var module = {};

	// dynamic script loading

	//Radek zmena tutor
	//	var thisScriptFile = 'simulator/robotanik/base.js';
	var scripts = { base:true };
	var head = document.getElementsByTagName('head')[0];

	var findScriptPath = function(f) {
		var s = head.getElementsByTagName('script');
		for(var i = 0; i < s.length; ++i) {
			var src = s[i].src;
			if (src.slice(src.length - f.length) == f)
				return src.slice(0, src.length - f.length);
		}
	}

	var loadScript = module.loadScript = function(script, id) {
		if (!document.body) {
			var s = "<script ";
			if (id) s += "id='" + id + "' ";
			s +="type='text/javascript' src='" + script + "'><\/script>";
			document.write(s);
		} else {
			var s = document.createElement('script');
			if (id) s.id = id;
			s.type = 'text/javascript';
			s.src = script;
			head.appendChild(s);
		}
	}

	var require = module.require = function() {
		for(var i = 0; i < arguments.length; ++i)
			if (!scripts[arguments[i]]) {
				loadScript(module.scriptPath + arguments[i] + '.js', 
					'script.' + arguments[i]);
				scripts[arguments[i]] = true;
			}
	}

	//Radek zmena hack	
	//	module.scriptPath = findScriptPath(thisScriptFile);
	module.scriptPath = "simulator/robotanik/";

	// array enhancements

	var StopIteration = module.StopIteration = function(v) { this.value = v; };

	Array.prototype.reduce = function(init, func) {
		try {
			for(var i = 0, len = this.length; i < len; ++i)
				init = func(init, this[i], i, this);
			return init;
		} catch(e) {
			if (e instanceof StopIteration) 
				return e.value;
			throw e;
		}
	};
	Array.prototype.rreduce = function(init, func) {
		try {
			for(var i = this.length - 1; i >= 0; --i)
				init = func(init, this[i], i, this);
			return init;
		} catch(e) {
			if (e instanceof StopIteration) 
				return e.value;
			throw e;
		}
	};
	Array.prototype.map = function(f) {
		return this.reduce([], function(r, v) {r.push(f(v)); return r;});
	};
	Array.prototype.filter = function(f) { 
		return this.reduce([], function(r, v) {if(f(v)) r.push(v); return r;}); 
	};
	Array.prototype.each = Array.prototype.forEach = function(f) { 
		return this.reduce(undefined, function(r, v) {f(v);}); 
	};
	Array.prototype.some = function(f) { 
		return this.reduce(false, function(r, v) {if (f(v)) throw new StopIteration(true); return r;}); 
	};
	Array.prototype.every = function(f) { 
		return this.reduce(true, function(r, v) {if (!f(v)) throw new StopIteration(false); return r;}); 
	};
	Array.prototype.indexOf = function(a) { 
		return this.reduce(-1, function(r, v, i) {if (a == v) throw new StopIteration(i); return r;}); 
	};
	Array.prototype.lastIndexOf = function(a) { 
		return this.rreduce(-1, function(r, v, i) {if (a == v) throw new StopIteration(i); return r;});
};

// AJAX
// var postAJAX = module.postAJAX = function(url, query, handler) {
//     var status = false;
//     var contentType = "application/x-www-form-urlencoded; charset=UTF-8";

//     // Native XMLHttpRequest object
//     if (window.XMLHttpRequest) {
//         request = new XMLHttpRequest();
//         request.onreadystatechange = handler;
//         request.open("post", url, true);
//         request.setRequestHeader("Content-Type", contentType);
//         request.send(query);
//         status = true;

//         // ActiveX XMLHttpRequest object
//     } else if (window.ActiveXObject) {
//         request = new ActiveXObject("Microsoft.XMLHTTP");
//         if (request) {
//             request.onreadystatechange = handler;
//             request.open("post", url, true);
//             request.setRequestHeader("Content-Type", contentType);
//             request.send(query);
//             status = true;
//         }
//     }

//     return status;
// }		

	// event handling

	var events = [];

	var attach = module.attach = function(element, eventName, handler) {
		if (eventName.slice(0, 2) == 'on') eventName = eventName.slice(2);
		var ee = {element: element, eventName: eventName, handler: handler};
		if (element.addEventListener) {
			ee.closure = function(e) { 
				var rv = handler.call(element, e);
				if (rv === false && e.preventDefault) {
					e.preventDefault();
					e.stopPropagation();
				}
				return rv;
			};
			element.addEventListener(eventName, ee.closure, false);
		} else {
			ee.closure = function(e) { 
				var rv = handler.call(element, e || window.event);
				if (rv === false && window.event) {
					window.event.returnValue = false;
					window.event.cancelBubble = true;
				}
				return rv;
			};
			if (element.attachEvent)
				element.attachEvent('on' + eventName, ee.closure);
			else
				element['on' + eventName] = ee.closure;
		}
		events.push(ee);
	};

	var detach = module.detach = function(element, eventName, handler) {
		if (eventName.slice(0, 2) == 'on') eventName = eventName.slice(2);
		var i = events.rreduce(-1, function(r, e, i) {
			if (e.element === element && e.eventName == eventName && e.handler === handler) 
				throw new StopIteration(i); 
			return r;
		}); 
		if (i < 0)
			throw "Detaching event not attached here: " 
				+ element.id + '.' + eventName + ' = ' + handler;

		var ee = events.splice(i, 1)[0];

		if (element.addEventListener)
			element.removeEventListener(eventName, ee.closure, false);
		else if (element.detachEvent)
			element.detachEvent('on' + eventName, ee.closure);
		else
			element['on' + eventName] = null;
	}

	if (!window.addEventListener) attach(window, 'onunload', function() { 
		if (window.attachEvent)
			events.each(function(ee){try{ee.element.detachEvent('on'+ee.eventName,ee.closure)}catch(e){}});
		else
			events.each(function(ee){ee.element['on'+e.eventName]=null;});
		events = [];
	});

	var domReady = module.domReady = function(func) { attach(window, 'load', func); }

	return module;
})();
