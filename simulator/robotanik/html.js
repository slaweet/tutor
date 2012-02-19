// Copyright  2009, Blake Coverett 
// Use and Redistribute Freely under the Ms-PL
// http://www.opensource.org/licenses/ms-pl.html
var html = (function(){
	var module = {};

	var $ = module.$ = function(id) { return document.getElementById(id); }

	var tags = /{([^}]*)}/g;
	var replace = module.replace = function(s, subs) {
		if (!(s instanceof String)) s += '';
		return subs ? s.replace(tags, function(m, t) { return subs[t]; }) : s;
	}

	module.marker = [];

	var internalAdd = function(parent, children, subs, results) {
		if (children === module.marker) {
			results.push(parent);
			return;
		}
		for(var i = 0, cc = children.length; i < cc; ++i) {
			child = children[i];
			if (child === module.marker) {
				results.push(parent);
			} else if (child instanceof Object && !(child instanceof Array)) {
				var tag = false;
				for(tag in child) if (child[tag] instanceof Array) break;
				if (!tag) throw "no tagname found";
				var e = document.createElement(tag);
				for(p in child)
					if (p == 'style') {
						var src = child[p], dst = e.style;
						for(var s in src)
							dst[s] = replace(src[s], subs);
					} else if (p != tag)
						e[p] = replace(child[p], subs);
				internalAdd(e, child[tag], subs, results);
				parent.appendChild(e);
			} else
				parent.appendChild(document.createTextNode(
					replace(child, subs)));
		}
	}
		
	var add = module.add = function(parent, spec, subs) {
		if (!parent) throw "no parent in html.add";
		var results = [];
		if (!(spec instanceof Array)) spec = [spec];
		internalAdd(parent, spec, subs, results);
		return results;
	};
	/* Sample Usage:
	var r = html.add(output, [
			{h1:html.marker},
			{div:[
				{span:['<'], style:{color:'{delims}'}},
				'this is {adj} {noun}',
				{span:['>'], style:{backgroundColor:'{delims}'}} 
			], align:'center'},
			{div:html.marker}
		],
		{adj:'very', noun:'cool', delims:'red'});
	r[0].innerHTML = 'Wow';
	r[1].innerHTML = 'footer';
	*/
    var Cookie = module.Cookie = {
        create: function (name,value,days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime()+(days*24*60*60*1000));
                var expires = "; expires="+date.toGMTString();
            }
            else var expires = "";
            document.cookie = name+"="+value+expires+"; path=/";
        },

        read: function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        },

        erase: function (name) {
            createCookie(name,"",-1);
        },
        
        readDefault: function(name, def) {
            var cookie = Cookie.read(name);
            return ((cookie == null) ? def : cookie);
        }
    }

    var load = module.load = function() {
        var lang = Cookie.readDefault('lang', 'cs');
        var showStack = Cookie.readDefault('showstack', 'checked');
        var multiDrag = Cookie.readDefault('multidrag', '');
        var tooltips = Cookie.readDefault('tooltips', '');
        var defaultSpeed = Cookie.readDefault('defaultspeed','100');

        var speed = {1:900,2:300,3:100,4:40,5:10};
        var strings = {};
        switch (lang) {
        case 'en': strings = {
                showStack: "Show/hide stack",
                tooltips: "Keyboard shortcuts",
                multiDrag: "Multiple command drag",
                animationSpeed: "Animation speed",
                step: "One step of the program",
                run: "Launch program",
                };
                break;
        default:
        case 'cs': strings = {
                showStack: "Zobrazit zásobník",
                tooltips: "Klávesové zkratky",
                multiDrag: "Přesun více příkazů",
                animationSpeed: "Rychlost animace",
                step: "Jeden krok programu",
                run: "Spustit program",
                };
                break;
        }

        $('robozzle').oncontextmenu = "return false;";
        var innerHTML = "\
			<h2 id='puzzleTitle'></h2>\
			<h3 id='puzzleAbout'></h3>\
			<div id='stackwrapper'>\
                <div id='stack'>\
                    <div></div>\
                </div>\
                <div id='fadeout'></div>\
            </div>\
            <div id='boardwrapper'>\
			<div id='robot'></div>\
			<table>\
				<tbody id='board'/>\
\
			</table>\
            </div>\
			<div id='controls'>\
                <form name='speed'>\
                " + strings.animationSpeed + ":<br>";
        for(s in speed)
            innerHTML += "\n<input type='radio' name='speed' value='" + speed[s] + "' " + (speed[s] == defaultSpeed ? "checked" : "") + ">" + s;
        innerHTML += "\
                <br><br>\
				<a id='runPuzzle' href='#' style='background-position: -225px 0px' title='" + strings.run + "'><span>p</span></a>\
				<a id='stepPuzzle' href='#' style='background-position: -225px -30px' title='" + strings.step + "'><span>o</span></a>\
				<a id='resetPuzzle' href='#'><span>l</span></a>\
                <input id='tooglestack' type='checkbox' " + showStack + ">\
                <label for='tooglestack'>" + strings.showStack + "</label>\
                <br>\
                <input id='tooltips' type='checkbox' " + tooltips + ">\
                <label for='tooltips'>" + strings.tooltips + "</label>\
                <br>\
                <input id='multidrag' type='checkbox' " + multiDrag + ">\
                <label for='multidrag' >" + strings.multiDrag + "</label>\
                </form>\
			</div>\
			<div id='resources' >\
                <div>\
                    <span id='red' style='background-position: 0px -30px'><span>q</span></span>\
                    <span id='green' style='background-position: 0px -60px'><span>w</span></span>\
                    <span id='blue' style='background-position: 0px -90px'><span>e</span></span>\
                    <span id='grey' style='background-position: 0px 0px'><span>r</span></span>\
                    <span id='paintred' style='background-position: -270px 0px'><span>t</span></span>\
                    <span id='paintgreen' style='background-position: -300px 0px'><span>y</span></span>\
                    <span id='paintblue' style='background-position: -330px 0px'><span>u</span></span>\
                    <span id='nop' style='background-position: -360px 0px;'><span>i</span></span>\
                </div>\
                <div>\
                    <span id='forward' style='background-position: -30px 0px'><span>a</span></span>\
                    <span id='left' style='background-position: -60px 0px'><span>s</span></span>\
                    <span id='right' style='background-position: -90px 0px'><span>d</span></span>\
                    <span style='cursor:default;background-position: -360px -90px; display: none;'></span>\
\
                    <span id='f1' style='background-position: -120px 0px'><span>f</span></span>\
                    <span id='f2' style='background-position: -150px 0px'><span>g</span></span>\
                    <span id='f3' style='background-position: -180px 0px'><span>h</span></span>\
                    <span id='f4' style='background-position: -210px 0px'><span>j</span></span>\
                    <span id='f5' style='background-position: -240px 0px'><span>k</span></span>\
\
                </div>\
                <div style='display:none'>\
                    <span id='blankProgram' style='background-position: -360px -30px'></span>\
                    <span id='unavailableProgram' style='background-position: -360px -60px'></span>\
                    <span></span>\
                    <span></span>\
                    <span></span>\
                    <span></span>\
                </div>\
			</div>\
\
            <div id='program'/>\
            </div>\
\
			<div id='animate'></div>\
			<div id='drag'></div>\
\
			<table id='boardEdit' style='display:none'>\
				<tbody>\
					<tr>\
						<td id='star' style='background-position: -200px 0px'></td>\
						<td id='robot0' style='background-position: -40px 0px'></td>\
						<td id='robot1' style='background-position: -80px 0px'></td>\
						<td id='robot2' style='background-position: -120px 0px'></td>\
						<td id='robot3' style='background-position: -160px 0px'></td>\
\
					</tr>\
					<tr>\
						<td id='boardgrey' style='background-position: 0px 0px'></td>\
						<td id='boardred' style='background-position: 0px -40px'></td>\
						<td id='boardgreen' style='background-position: 0px -80px'></td>\
						<td id='boardblue' style='background-position: 0px -120px'></td>\
						<td></td>\
					</tr>\
				</tbody>\
\
			</table>\
    ";
        $('robozzle').innerHTML = innerHTML;
    }
	return module;
})();
