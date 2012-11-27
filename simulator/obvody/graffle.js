/*
* Author: Vít Stanislav<slaweet@mail.muni.cz> 
* Year: 2012
* compatibility: Mozilla Firefox, Opera, Google Chrome, Safari, Microsoft Internet Explorer 9
* works, but slowly: MSIE 8, MSIE 7
*/

(function(window, Raphael, undefined) {
/*
//damn MSIE
const HOLDER_WIDTH = 640;
const HOLDER_HEIGHT = 480;
const CARD_HEIGHT = 40;
*/

var HOLDER_WIDTH = 640;
var HOLDER_HEIGHT = 480;
var CARD_HEIGHT = 40;
var CONTROLS_WIDTH = 245;
var CONTROLS_HEIGHT = 65;
var SLIDER_WIDTH = 120;

var r; //global var for the raphael object;

// Manager of cards. 

var CardManager = {
    nextCardPosition: [
         {x:10, y:80},
         {x:10, y:240},
        {x:10, y:400}
    ],
    init: function(names) {
        this.generateColors();
        this.loadCards(names);
        var c = r.controls();
        this.playButton = c.playButton;
        this.slider = c.slider;
        this.centerCards()
        Evaluator.moveCount = 0;
    },
    generateColors: function() {
        this.colors = {};
        this.colors[-2] = Raphael.getColor();
        this.colors[-1] = this.colors[-2];
        Raphael.getColor();//just to skip one ugly color :)
        this.colors[2] = Raphael.getColor();
        this.colors[1] = this.colors[2];
        Raphael.getColor();//just to skip one ugly color :)
        this.colors[0] = Raphael.getColor();
    /*
        this.colors = {};
        this.colors['result'] = Raphael.getColor();
        this.colors['goniometric'] = Raphael.getColor();
        this.colors['arithmetic'] = Raphael.getColor();
        Raphael.getColor();//just to skip one ugly color :)
        this.colors['const'] = Raphael.getColor();
        Raphael.getColor();
        this.colors['bool'] = Raphael.getColor();
        Raphael.getColor();
        this.colors['pred'] = Raphael.getColor();
        */
    },
    getColor: function(name, arity) {
        return this.colors[arity];
        /*
        switch (arity) {
            case 0:
                return this.colors['const'];
            case -1:
            case -2:
                return this.colors['result'];
            case 1:
                if (name.contains(['sin', 'cos']))
                    return this.colors['goniometric'];
                else if(name.contains(['|','sqrt']))
                    return this.colors['arithmetic'];
                else 
                    return this.colors['pred'];
            case 2:
                if (name.contains(['and', 'or', 'not', '=', '<', '>']))
                    return this.colors['bool'];
                else
                    return this.colors['arithmetic'];
        }
        */
    },
    updateNextPosition: function(card, group) {
        this.nextCardPosition[group] = {x: card.attr('x') + card.attr('width') + 40, y: card.attr('y')};
    },
    arityToGroup: function(arity) {
        return arity < 0 ? 2 : (arity > 0 ? 1 : 0);
    },
    loadCards: function(names) {
        this.cards = [];
        for (var i = 0; i < names.length; i++) {
            var arity = this.getArity(names[i]);
            var group = this.arityToGroup(arity)
            this.cards.push(r.card(this.nextCardPosition[group], names[i], arity));
            this.updateNextPosition(this.cards[this.cards.length -1], group);
        }
    },
    getArity: function(name) {
        var arity = 0;
        if(name.indexOf('x') != -1){
            arity += 1;
            if(name.indexOf('y') != -1)
                arity += 1;
            if(name.search(/x=([^=])/) != -1)
                arity = arity * (-1);
        }
        return arity;
    },
    centerCards: function() {
        var shift = [];
        for (var i = this.cards.length - 1; i >= 0; i--) {
            var card = this.cards[i];
            for (var j = 0; j <= 2; j++) {
                if (this.nextCardPosition[j].y == card.attr('y')) {
                    if(!shift[j])
                        shift[j] = (HOLDER_WIDTH - (card.attr('x') + card.width)) / 2;
                    card.startMove();
                    card.onMove(shift[j], 0);
                    card.stopMove();
                }
            }
        }
    }
}

/*
//returns true if string contains one of strings in given array

String.prototype.contains = function (strings) {
    var ret = false
    for(var i = 0; i < strings.length; i++)
        ret = ret || this.indexOf(strings[i]) != -1; 
    return ret;
}
*/

// Building and evaluating results

var Evaluator = {
    results: {},
    queue: [],
    inVars: {'in': 'x', 'in2': 'y'},

    // Replacement patterns for evaluating result
    functions: {
        'π': 'Math.PI', 
        'PI': 'Math.PI', 
        'e': 'Math.E', 
        'x div y': 'Math.floor(x/y)',
        'x mod y': 'x%y',
        '|x|': 'Math.abs(x)', 
        'sqrt(x)': 'Math.sqrt(x)', 
        'x^y': 'Math.pow(x,y)',
        'x^2': 'Math.pow(x,2)',
        'ln(x)': 'Math.log(x)',
        'log_x(y)': 'log(x,y)',
        'log_2(x)': 'log(2,x)',
        'sin(x)': 'Math.sin(x)',
        'cos(x)': 'Math.cos(x)',
        'tan(x)': 'Math.tan(x)',
        'arcsin(x)': 'Math.asin(x)',
        'arccos(x)': 'Math.acos(x)',
        'arctan(x)': 'Math.atan(x)',
        'x or y': 'x||y',
        'x and y': 'x&&y',
        'x xor y': 'x!=y',
        'not x': '!x'
    },
    clearQueue: function() {
        this.queue = [];
    },

    makeQueue: function() {
        this.clearQueue();
        this.roots = [];
        for (var i = 0; i < CardManager.cards.length; i++) {
            if(!CardManager.cards[i].points.out || !CardManager.cards[i].points.out.connectedTo)
                this.roots.push(CardManager.cards[i]);
        }
        var solution = ''
        for (var i = 0; i < this.roots.length; i++) {
            this.parseCard(this.roots[i]);
//            solution += ",'" + this.logString(this.roots[i]) + "'";
            solution += ";" + this.logString(this.roots[i]);
        }
        solution = solution.substring(1);
        var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&move="+solution;
        sendDataToInterface(q);		
        this.moveCount++;
        this.noCycles = CardManager.cards.length == this.queue.length;
        
        CloneManager.clear();
    },
    logString: function(card) {
        var exp = card.name.replace('+','%2B');
        for (var i in card.points) {
            if(card.points[i].name != 'out' && card.points[i].connectedTo) {
                exp = this.logString(card.points[i].connectedTo.card) + ',' + exp;
            }
        }
        return exp
    },
    animationDone: function() {
        var success = this.noCycles;
        for (var i = 0; i < this.roots.length; i++) {
            success = success && this.results[this.roots[i].exp] === true;
        }
        if(success) {
            //alert('Správně!!');
            var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&win=1";
            sendDataToInterface(q);
            after_win();
        }
    },
    /*
    // staff for haskell evaluator
    succ: function(exp) {
        return (lang == 'haskell')
            ? this.results[exp] == 'True'
            : this.results[exp] === true
    },
    eval: function(exp) {
        if(lang == 'haskell')
            Haskell.eval(exp);
        else
            this.jseval(exp);
    },
    */
    jseval: function(exp) {
        var round = this.roundNumber;
        var log = this.log;
        try {
            var ret = eval(exp);
            //debug(exp);
        } catch(e) {
            var ret = '-';
           // var ret = e.message;
        } finally {
            if(this.isNumber(ret))
                ret = this.roundNumber(ret)
            return ret;
        }
    },
    isNumber: function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },
    roundNumber: function (number, digits) {
        if (number === undefined) throw "Undefined variable";
        if (number === true || number === false) return number;
        if (digits === undefined) digits = 3;
        var multiple = Math.pow(10, digits);
        var rndedNum = Math.round(number * multiple) / multiple;
        return rndedNum;
    },
    parseCard: function(card) {
        var exp = '(' + this.parseName(card.name) + ')';
        for (var i in card.points) {
            if(card.points[i].name != 'out' && card.points[i].connectedTo) {
                exp = exp.replace(this.inVars[card.points[i].name], this.parseCard(card.points[i].connectedTo.card));
            }
        }
        card.exp = exp;
        this.queue.push(card);

        if(!this.results.hasOwnProperty(exp))
            this.results[exp] = this.jseval(exp);
        return exp;
    },
    parseName: function(name) {
        return this.functions[name] ? this.functions[name] : name.replace(/x=([^=])/,"x==$1").replace(/(x)==(y|\d+)/,"round($1)==round($2)");
    },
    log: function(base, val) {
        return Math.log(val) / Math.log(base);
    }
}

// Manager of cards clones (cards for animation)

var CloneManager = {
        clear: function() {
            this.animPos = 0;
            for (var i = 0; i < CardManager.cards.length; i++) {
                if(CardManager.cards[i].points.out && CardManager.cards[i].points.out.clone.type)
                    CardManager.cards[i].points.out.clone.hide();
                else if(CardManager.cards[i].clone && CardManager.cards[i].clone.type) {
                    CardManager.cards[i].clone.hide();
                }
            }
            CardManager.playButton.stop();
        },

        animate: function() {
            if(Evaluator.queue.length > 0) {
                if(this.animPos == 0)
                    this.clone = r.cardClone(Evaluator.queue.shift());
                else
                    this.clone.moveTo(this.animPos);
                this.animPos = 0;
            } else {
                CardManager.playButton.stop();
                Evaluator.animationDone();
            }
        }
    }

var Cookie = {
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
    
    readOrDefault: function(name, def) {
        var cookie = Cookie.read(name);
        return ((cookie == null) ? def : cookie);
    }
}


// The white line between two cards.

Raphael.fn.connection = function (obj1, obj2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    } else if(obj1.name != 'out') {
        var swap = obj1;
        obj1 = obj2;
        obj2 = swap;
    }
     var bb1 = {
            x: obj1.attr('cx') - 1,
            y: obj1.attr('cy') - 1, 
            height: 2,
            width: 2
        },  
        bb2 = {
            x: obj2.attr('cx') - 1,
            y: obj2.attr('cy') - 1, 
            height: 2,
            width: 2
        };

        /*
        bb1 = obj1.getBBox();
        bb2 = obj2.getBBox();
        //debug(bb1)
        /*
        if(MSIE) {
            bb1.x = obj1.attr('cx') - obj1.attr('r');
            bb1.y = obj1.attr('cy') - obj1.attr('r');
            bb2.x = obj2.attr('cx') - obj2.attr('r');
            bb2.y = obj2.attr('cy') - obj2.attr('r');
        }

        /*
        bb1.x = bb1.x - 900;
        bb1.width = bb1.width + 1800;
        bb2.x = bb2.x - 900;
        bb2.width = bb2.width + 1800;
        */
   var  p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    /*
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }*/
    var res = [1, 4];
    if(bb1.y + bb1.height - bb2.y > 0) {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    /*
    if(res[1] == 4)
        var arrow ="M"+ (x4.toFixed(3)-10) +","+ (y4.toFixed(3)-10) +"l10 10, 10 -10";
    else if(res[1] == 1)
        var arrow ="M"+ (x4.toFixed(3)-10) +","+ (y4.toFixed(3)-10) +"l10 10, -10 10";
    else if(res[1] == 2)
        var arrow ="M"+ (x4.toFixed(3)+10) +","+ (y4.toFixed(3)+10) +"l-10 -10, -10 10";
    else if(res[1] == 3)
        var arrow ="M"+ (x4.toFixed(3)+10) +","+ (y4.toFixed(3)+10) +"l-10 -10, 10 -10";
        */
    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
        //line.arrow.attr({path: arrow});
    } else {
        var color = typeof line == "string" ? line : "#fff";
        var ret = {
            //arrow: this.path(arrow).attr({stroke: color, fill: "none", "stroke-width": 2 }),
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            line: this.path(path).attr({stroke: color, fill: "none", "stroke-width": 2 }),
            from: obj1,
            to: obj2,
            remove: function () {
                this.line.remove();
                //this.arrow.remove();
                delete this.from.connection;
                delete this.to.connection;
                delete this.from.connectedTo;
                delete this.to.connectedTo;
                //delete this;
            }
        };
        ret.line.toFront();
        //ret.arrow.toFront();
        obj1.toFront();
        obj2.toFront();
        obj1.connection = ret;
        obj1.connectedTo = obj2;
        obj2.connection = ret;
        obj2.connectedTo = obj1;
        return ret;
    }
};
/*

// Speedometer-like element to control animation speed (drag'n'drop is not working yet)

Raphael.fn.speedMeter = function (x, y) {
    var start = function () {
        this.attr({'cursor': 'move'});
        this.alpha = this.attr("x");
        this.inDrag = true;
    },
    move = function(dx, dy) {
        this.transform('r'+ Math.tan(dx/dy));
    },
    up = function () {
        this.attr({'cursor': 'pointer'});
        this.inDrag = false;
        this.animate({fill: '#aaa', stroke: '#aaa',}, 200);
    },
                 sectorsCount = 21,
                    color = "#aaa",
                    width = 4,
                    r1 = 35,
                    r2 = 40,
                    cx = x,
                    cy = y,
                    
                    sectors = [],
                    beta = 2 * Math.PI / sectorsCount,

                    pathParams = {stroke: color, "stroke-width": width, "stroke-linecap": "round"};
                for (var i = 0; i < sectorsCount / 2 ; i++) {
                    var alpha = beta * (i-5) - Math.PI / 2,
                        cos = Math.cos(alpha),
                        sin = Math.sin(alpha);
                    sectors[i] = r.path([["M", cx + r1 * cos, cy + r1 * sin], ["L", cx + r2 * cos, cy + r2 * sin]]).attr(pathParams);
                    sectors[i].attr("stroke", Raphael.getColor());
                    }
    var attr = {fill: '#aaa', stroke: '#aaa', "fill-opacity": .0, "stroke-width": 2},
    meter =  this.path("M"+ (x) +","+ (y) +"l-10 -35");
    meter.dot = this.circle(x, y, 4); 
    meter.dot.attr(attr);
    meter.attr(pathParams);
    meter.attr({'cursor': 'pointer'});
    meter.drag(move, start, up);
    return meter;
}
*/

// Slider element to control animation speed

Raphael.fn.slider = function (x, y) {
    var start = function () {
        this.attr({'cursor': 'move'});
        this.ox = this.attr("cx");
        this.inDrag = true;
    },
    move = function(dx, dy) {
        if(this.ox + dx > x + SLIDER_WIDTH) {
            this.attr({cx: x + SLIDER_WIDTH});
        } else if(this.ox + dx < x) {
            this.attr({cx: x});
        } else { 
            this.attr({cx: this.ox + dx});
        }
    },
    up = function () {
        this.attr({'cursor': 'pointer'});
        this.inDrag = false;
        this.animate({fill: '#aaa', stroke: '#aaa'}, 200);
        Cookie.create('animationspeed', (this.attr('cx') - this.x), 365);
    },
    hoverIn = function() {
        this.animate({fill: color, stroke: color,"fill-opacity": .8}, 200);
    },
    hoverOut = function() {
        if(!this.inDrag)
            this.animate({fill: '#aaa', stroke: '#aaa'}, 200);
    },  
    attr = {fill: '#aaa', stroke: '#aaa', "fill-opacity": .0, "stroke-width": 3},
    color = '#26bf00',
    animationSpeed = parseInt(Cookie.readOrDefault('animationspeed','50')),
    slider = this.circle(x + animationSpeed, y + 2, 8); 
    slider.x = x;
    slider.line = this.rect(x, y, SLIDER_WIDTH, 4, 2).toBack();
    slider.line.attr(attr);
    slider.attr(attr);
    slider.attr({ "fill-opacity": .8, 'cursor': 'pointer'});
    slider.inDrag = false;
    slider.drag(move, start, up);
    slider.hover(hoverIn, hoverOut);
    slider.speed = function() {
        return (this.attr('cx') - this.x) /10;
    }
    return slider;
}

// Play/pause button to control the animation 

Raphael.fn.playButton = function (x, y) {
    var hoverIn = function() {
            button.animate({stroke: color,"fill-opacity": .3}, 200);
            button.attr({'cursor': 'pointer'});
    },
    hoverOut = function() {
            button.animate({stroke: '#aaa',"fill-opacity": .0}, 200);
            button.attr({'cursor': 'default'});
    },    
    color = '#26bf00',
    button = this.set();
    button.pause1 = this.rect(x + 22.5, y + 10, 10, CARD_HEIGHT/2, 1).hide(),
    button.pause2 = this.rect(x + 37.5, y + 10, 10, CARD_HEIGHT/2, 1).hide(),
    button.play = this.path("M"+ (x + 27.5) +","+ (y + 10) +"l20 10,-20 10z")
    button.rect = this.rect(x, y, 70, CARD_HEIGHT, 2),
    button.pause = this.set();
    button.pause.push(button.pause1, button.pause2);
    button.push(button.rect, button.pause, button.play);
    button.attr({fill: color, stroke: '#aaa', "fill-opacity": .0, "stroke-width": 3});
    button.rect.hover(hoverIn, hoverOut);
    button.rect.click(function() {
            if(button.play.node.style.display !== "none") {
                if(Evaluator.queue.length == 0) 
                    Evaluator.makeQueue();
                button.start();
            } else {
                button.stop();
            }
    });
    button.start = function() {
        this.paused = false;
        this.play.hide();
        this.pause1.show();
        this.pause2.show();
        CloneManager.animate();
    }
    button.stop = function() {
        this.paused = true;
        this.play.show();
        this.pause1.hide();
        this.pause2.hide();
    }
    return button;
};

// Rectangle in upper right corner with play/pause button and speed slider

Raphael.fn.controls = function () {
    var x = HOLDER_WIDTH - CONTROLS_WIDTH + 10,
        y =  -10,
        controls = this.rect(x, y, CONTROLS_WIDTH, CONTROLS_HEIGHT, 10);
    controls.attr({stroke: '#aaa', "stroke-width": 5});
    controls.playButton = this.playButton(x + 10, y + 15);
    //controls.slider = this.speedMeter(x + 160, y + 50);
    controls.slider = this.slider(x + 100, y + 35);
    return controls;
};

// Small card for the animation 

Raphael.fn.cardClone = function (card) {
    var x = card.attr('x'),
    y = card.attr('y'),
    color = card.attr('fill'),
    text = this.text(x + card.attr('width') / 2, y + CARD_HEIGHT, !card.points['in'] ? card.name : Evaluator.results[card.exp]);
    text.attr({"font-size": 15, 'fill': color});
    var width = text.getBBox()['width'] + 15,
        rect = this.rect(text.attr('x'), y + CARD_HEIGHT, 1, 1, 2);
    rect.attr({stroke: color,'fill': '#333', "fill-opacity": .8, "stroke-width": 2});
    text.toFront();
    rect.text = text;
    
    for (var i in card.points) {
        if(card.points[i].name != 'out' && card.points[i].connectedTo) {
            card.points[i].connectedTo.clone.hide();
        }
    }
    
    if(card.points.out && card.points.out.connection) {
        card.points.out.clone = rect;
        rect.path = card.points.out.connection.line;
        rect.pathLength = rect.path.getTotalLength();
    } else {
        card.clone = rect;
    }
    //text.attr({"x": x + width/2});
    rect.hide = function(){
        var time =  1000 / CardManager.slider.speed();
        this.text.animate({"font-size": 1}, time)
        this.animate({x: this.text.attr('x'), y:  this.text.attr('y'), width: 1, height: 1}, time, function(){
            this.text.remove();
            this.remove();
        });
    }
    text.attr({"font-size": 1});
    var time =  1000 / CardManager.slider.speed();
    text.animate({"font-size": 15}, time)
    rect.animate({x: text.attr('x') - width/2, y: y + CARD_HEIGHT * 3/4, width: width, height: CARD_HEIGHT / 2}, time, function(){this.moveTo(0)});
    rect.moveTo = function(length){
        if(!this.path || this.path.type != 'path') {
            if(!CardManager.playButton.paused) 
                CloneManager.animate();
            return;
        }
        var p = this.path.getPointAtLength(length),
            a = Raphael.animation({x: p.x, y: p.y},2);
        this.text.animate(a);
        this.animateWith(this.text, a, {x: p.x - this.attr('width') / 2, y: p.y - this.attr('height') / 2}, 2, function(){
            if(!CardManager.playButton.paused) {
                if(length < this.pathLength)
                    this.moveTo(length + CardManager.slider.speed())
                else {
                    CloneManager.animPos = 0;
                    CloneManager.animate();
                }
            } else {
                CloneManager.animPos = length + CardManager.slider.speed();
            }
        });
    } 
    return rect;
}

// Card element with operation name ('5', 'x+y', 'x=6'...) and connect points (in, in2, out).

Raphael.fn.card = function (position, name, arity) {
    var start = function () {
        CloneManager.clear();
        if(this.g)
            this.g.remove();
        this.inDrag = true;
        startDrag(this.bg)
        startDrag(this.text)
        startDrag(this)
        for (var i in this.points) {
            startDrag(this.points[i])
        }
        this.animate({"fill-opacity": .4}, 200);
    },
    startDrag = function (elem) {
        elem.ox = elem.type != "circle" ? elem.attr("x") : elem.attr("cx");
        elem.oy = elem.type != "circle" ? elem.attr("y") : elem.attr("cy");
        elem.toFront();
    },
    move = function(dx, dy, elem) {
            var att = elem.type != "circle" ? {x: elem.ox + dx, y: elem.oy + dy} : {cx: elem.ox + dx, cy: elem.oy + dy};
            elem.attr(att);
    },
    onMove = function (dx, dy) {
            if(this.ox + dx < 0 )
                dx = -this.ox;
            else if (this.ox + dx + this.width > HOLDER_WIDTH)
                dx = HOLDER_WIDTH - this.width - this.ox;
            if (this.oy + dy < 0)
                dy = -this.oy;
            else if (this.oy + dy + CARD_HEIGHT > HOLDER_HEIGHT)
                dy = HOLDER_HEIGHT - CARD_HEIGHT - this.oy;
            if (this.oy + dy < CONTROLS_HEIGHT  &&  this.ox + dx + this.width > HOLDER_WIDTH - CONTROLS_WIDTH)
                dy = CONTROLS_HEIGHT -this.oy;
            move(dx, dy, this);
            move(dx, dy, this.text);
            move(dx, dy, this.bg);
            for (var i in this.points) {
                move(dx, dy, this.points[i]);
                if(this.points[i].connection != undefined)
                    r.connection(this.points[i].connection);
            }
            r.safari();
    },
    up = function () {
        this.animate({"fill-opacity": .0}, 200);
        this.inDrag = false;
        Evaluator.clearQueue();
    },
    hoverIn = function() {
        if(!this.inDrag)
            this.animate({"fill-opacity": .2}, 200);
    },
    hoverOut = function() {
        if(!this.inDrag)
            this.animate({"fill-opacity": .0}, 200);
    },

    color = CardManager.getColor(name,arity),
    // comented lines for random x,y of a new card
    //shift = (arity < 0 ? 3 : arity),
    //y = Math.floor((Math.random() + shift) * (HOLDER_HEIGHT - CARD_HEIGHT) / (shift > 1 ? 4 : 2 + shift)),
    y = position.y,
    text = this.text(0, y + CARD_HEIGHT/2, name);
    text.attr({"font-size": 30, 'fill': color});
    var width = text.getBBox()['width'] + 15;
    //var x = Math.floor(Math.random() * (HOLDER_WIDTH - width - (y < CONTROLS_HEIGHT ? CONTROLS_WIDTH : 0))),
    if(position.x + width > HOLDER_WIDTH) {
        y = y + CONTROLS_HEIGHT;
        text.attr({'y': y + CARD_HEIGHT / 2});
        position.x = 10;
    }
    var x = position.x,
        bg = this.rect(x, y, width, CARD_HEIGHT, 2);
    text.toFront();

    var card = this.rect(x, y, width, CARD_HEIGHT, 2);
    text.attr({"x": x + width/2});
    bg.attr({fill: '#333', "fill-opacity": .8});
    card.attr({fill: color, stroke: color, "fill-opacity": .1, "stroke-width": 3, cursor: "move"});
        
    card.bg = bg;
    card.text = text;
    card.name = name;
    card.width = width;
    card.color = color;
    card.startMove = start;
    card.onMove = onMove;
    card.stopMove = up;

    var pointKeys = []; 
    if(Math.abs(arity) >= 2) 
        pointKeys.push('in2');
    if(Math.abs(arity) >= 1) 
        pointKeys.push('in');
    if(arity >= 0) 
        pointKeys.push('out');
    card.points = {};
    for (var i = 0; i < pointKeys.length; i++) {
        card.points[pointKeys[i]] = this.connectPoint(card, pointKeys[i]);
    }
    card.drag(onMove, start, up);
    card.hover(hoverIn, hoverOut);
    return card;
};

// One connect point (in, in2, out) of a specific card

Raphael.fn.connectPoint = function (card, name) {
     var start = function () {
        CloneManager.clear();
        var newPoint = r.connectPoint(this.card, this.name);
        this.card.points[this.name] = newPoint; 
        this.ox = this.attr("cx");
        this.oy = this.attr("cy");
        this.attr({cursor: "move"});
        if(this.connection == undefined) {
            r.connection(newPoint, this);
        }
    },
    move = function(dx, dy) {
        this.attr({cx: this.ox + dx, cy: this.oy + dy});
        r.connection(this.connection);
        r.safari();
    },
    up = function () {
        for(var i in CardManager.cards)
            for(var j in CardManager.cards[i].points) {
                var p = CardManager.cards[i].points[j],
                px = p.attr('cx'),
                py = p.attr('cy'),
                x = this.attr('cx'),
                y = this.attr('cy'); 

                if( Math.abs(x - px) < 18 && Math.abs(y - py) < 18 ) {
                    if((this.connectedTo.name == 'out') != (p.name == 'out') && this.connectedTo.card != p.card) {
                        if(p.connection)
                            p.connection.remove();
                        var to = this.connectedTo;
                        this.connection.remove();
                        r.connection(p, to); 
                        this.remove();
                        Evaluator.clearQueue();
                    } else {
                        this.rollBack();
                    }
                    return;
                }
            }
        this.rollBack();
    },
    rollBack = function() {
        var color = this.connectedTo.attr('fill'),
            cx = this.attr('cx') + (this.connectedTo.attr('cx') - this.attr('cx'))*0.29, 
            cy = this.attr('cy') + (this.connectedTo.attr('cy') - this.attr('cy'))*0.29,
            radius = this.attr('r') + (this.connectedTo.attr('r') - this.attr('r'))*0.29;
        if(Math.abs(cy - this.connectedTo.attr('cy')) > 6)
            this.animate({"r": radius, 'cx': cx, 'cy': cy, 'fill': color, 'stroke': color},2, function() {
                r.connection(this.connection);
                this.rollBack();
            });
        else {
            this.connection.remove();
            this.remove();
        }
    },
    hoverIn = function() {
        this.animate({"r": 10}, 100);
    },
    hoverOut = function() {
        if(!this.removed)
            this.animate({"r": 6}, 100); 
    },

    ratio = {'in': (card.points.in2 ? 4 : 2), 'out': 2, 'in2': (4/3)},
    x = card.attr('x') + (card.width / ratio[name]),
    y = card.attr('y') + ((name == 'out') ? CARD_HEIGHT : 0),
    color = card.attr('fill'),
    point = this.circle(x, y, 6);

    point.attr({fill: color, stroke: color, "fill-opacity": 1, "stroke-width": 2, cursor: "hand"});
    point.name = name;
    point.card = card;
    point.drag(move, start, up);
    point.rollBack = rollBack;
    point.hover(hoverIn, hoverOut);
    return point;
};

window.initCardManager = function (task) {
    r = Raphael("holder", HOLDER_WIDTH, HOLDER_HEIGHT);
    CardManager.init(task);
    return CardManager;
};

})(window, Raphael);

