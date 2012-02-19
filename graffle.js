
/*
//damn MSIE
const HOLDER_WIDTH = 640;
const HOLDER_HEIGHT = 480;
const CARD_HEIGHT = 40;
*/

var HOLDER_WIDTH = 640;
var HOLDER_HEIGHT = 480;
var CARD_HEIGHT = 40;
var CONTROLS_WIDTH = 240;
var SLIDER_WIDTH = 120;

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
    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
    } else {
        var color = typeof line == "string" ? line : "#fff";
        var ret = {
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            line: this.path(path).attr({stroke: color, fill: "none", "stroke-width": 2 }),
            from: obj1,
            to: obj2,
            remove: function () {
                this.line.remove();
                delete this.from.connection;
                delete this.to.connection;
                delete this.from.connectedTo;
                delete this.to.connectedTo;
                //delete this;
            },
        };
        obj1.toFront();
        obj2.toFront();
        obj1.connection = ret;
        obj1.connectedTo = obj2;
        obj2.connection = ret;
        obj2.connectedTo = obj1;
        return ret;
    }
};
Raphael.el.is_visible = function() {
    return (this.node.style.display !== "none");
}
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
Raphael.fn.slider = function (x, y) {
    var start = function () {
        this.attr({'cursor': 'move'});
        this.ox = this.attr("cx");
        this.inDrag = true;
    },
    move = function(dx, dy) {
        if(this.ox + dx > x && this.ox + dx < x + SLIDER_WIDTH)
            this.attr({cx: this.ox + dx});
    },
    up = function () {
        this.attr({'cursor': 'pointer'});
        this.inDrag = false;
        this.animate({fill: '#aaa', stroke: '#aaa',}, 200);
    },
    hoverIn = function() {
        this.animate({fill: color, stroke: color,"fill-opacity": .8}, 200);
    },
    hoverOut = function() {
        if(!this.inDrag)
            this.animate({fill: '#aaa', stroke: '#aaa',}, 200);
    },  
    attr = {fill: '#aaa', stroke: '#aaa', "fill-opacity": .0, "stroke-width": 2},
    color = '#26bf00',
    slider = this.circle(x + 50, y + 2, 8); 
    slider.x = x;
    slider.line = this.rect(x, y, SLIDER_WIDTH, 4, 2).toBack();
    //slider.line = this.path("M"+ (x) +","+ (y + 2) +"l"+ SLIDER_WIDTH +" -5,0 10z").toBack();
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
Raphael.fn.button = function (x, y) {
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
    button.pause1 = this.rect(x + 32.5,y + 20, 10, CARD_HEIGHT/2, 1).hide(),
    button.pause2 = this.rect(x + 47.5,y + 20, 10, CARD_HEIGHT/2, 1).hide(),
    button.play = this.path("M"+ (x + 37.5) +","+ (y + 20) +"l20 10,-20 10z")
    button.rect = this.rect(x + 10, y + 10, 70, CARD_HEIGHT, 2),
    button.pause = this.set();
    button.pause.push(button.pause1, button.pause2);
    button.push(button.rect, button.pause, button.play);
    button.attr({fill: color, stroke: '#aaa', "fill-opacity": .0, "stroke-width": 2});
    button.rect.hover(hoverIn, hoverOut);
    button.rect.click(function() {
            if(button.play.is_visible()) {
                if(Checker.stack.length == 0) 
                    Checker.check();
                button.start();
            } else {
                button.stop();
            }
    });
    button.start = function() {
        this.paused = false;
        Clones.animate();
        this.play.hide();
        this.pause1.show();
        this.pause2.show();
    }
    button.stop = function() {
        this.paused = true;
        this.play.show();
        this.pause1.hide();
        this.pause2.hide();
    }
    button.ready = function(isReady) {
        this.isReady = isReady;
        this.stop();
    }
    return button;
};

Raphael.fn.controls = function () {
    var x = HOLDER_WIDTH - CONTROLS_WIDTH + 5,
        y =  -5,
        controls = this.rect(x, y, CONTROLS_WIDTH, CARD_HEIGHT + 20, 10);
    controls.attr({stroke: '#aaa', "stroke-width": 5});
    controls.button = this.button(x, y);
    //controls.slider = this.speedMeter(x + 160, y + 50);
    controls.slider = this.slider(x + 100, y + 30);
    return controls;
};

Raphael.fn.cardClone = function (card) {
    var x = card.attr('x'),
    y = card.attr('y'),
    color = card.attr('fill'),
    text = this.text(x + card.attr('width') / 2, y + CARD_HEIGHT, !card.points.in ? card.name : Checker.results[card.exp]);
    text.attr({"font-size": 15, 'fill': color});
    var width = text.getBBox()['width'] + 15,
        rect = this.rect(text.attr('x'), y + CARD_HEIGHT, 1, 1, 2);
    rect.attr({stroke: color,'fill': '#333', "fill-opacity": .8});
    text.toFront();
    rect.text = text;
    //debug(card.name)
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
        var time =  1000 / Checker.slider.speed();
        this.text.animate({"font-size": 1}, time)
        this.animate({x: this.text.attr('x'), y:  this.text.attr('y'), width: 1, height: 1}, time, function(){
            this.text.remove();
            this.remove();
        });
    }
    text.attr({"font-size": 1});
    var time =  1000 / Checker.slider.speed();
    text.animate({"font-size": 15}, time)
    rect.animate({x: text.attr('x') - width/2, y: y + CARD_HEIGHT * 3/4, width: width, height: CARD_HEIGHT / 2}, time, function(){this.moveTo(0)});
    rect.moveTo = function(length){
        if(!this.path) {
            if(!Checker.button.paused) 
                Clones.animate();
            return;
        }
        var p = this.path.getPointAtLength(length),
            a = Raphael.animation({x: p.x, y: p.y},2);
        this.text.animate(a);
        this.animateWith(this.text, a, {x: p.x - this.attr('width') / 2, y: p.y - this.attr('height') / 2}, 2, function(){
            if(!Checker.button.paused) {
                if(length < this.pathLength)
                    this.moveTo(length + Checker.slider.speed())
                else {
                    Clones.animPos = 0;
                    Clones.animate();
                }
            } else {
                Clones.animPos = length + Checker.slider.speed();
            }
        });
    } 
    return rect;

}
Raphael.fn.card = function (name, arity) {
    var start = function () {
        Clones.clear();
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
            if(this.ox + dx < 0 || this.ox + dx + this.width > HOLDER_WIDTH
               || this.oy + dy < 0 || this.oy + dy + CARD_HEIGHT > HOLDER_HEIGHT
               ||this.oy + dy < CARD_HEIGHT + 20  &&  this.ox + dx + this.width > HOLDER_WIDTH - CONTROLS_WIDTH)
                return;
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
        Checker.stack = [];
    },
    hoverIn = function() {
        if(!this.inDrag)
            this.animate({"fill-opacity": .2}, 200);
    },
    hoverOut = function() {
        if(!this.inDrag)
            this.animate({"fill-opacity": .0}, 200);
    },

    color = colors[arity],
    shift = (arity < 0 ? 3 : arity),
    y = Math.floor((Math.random() + shift) * (HOLDER_HEIGHT - CARD_HEIGHT) / (shift > 1 ? 4 : 2 + shift)),
    text = this.text(0, y + CARD_HEIGHT/2, name);
    text.attr({"font-size": 30, 'fill': color});
    var width = text.getBBox()['width'] + 15;
    var x = Math.floor(Math.random() * (HOLDER_WIDTH - width - (y < CARD_HEIGHT + 20 ? CONTROLS_WIDTH : 0))),
        bg = this.rect(x, y, width, CARD_HEIGHT, 2);
    text.toFront();

    var card = this.rect(x, y, width, CARD_HEIGHT, 2);
    text.attr({"x": x + width/2});
    bg.attr({fill: '#333', "fill-opacity": .8});
    card.attr({fill: color, stroke: color, "fill-opacity": .1, "stroke-width": 2, cursor: "move"});
        
    card.bg = bg;
    card.text = text;
    card.name = name;
    card.width = width;
    card.color = color;

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

Raphael.fn.connectPoint = function (card, name) {
     var start = function () {
        Clones.clear();
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
        for(var i in Checker.cards)
            for(var j in Checker.cards[i].points) {
                var p = Checker.cards[i].points[j],
                px = p.attr('cx'),
                py = p.attr('cy'),
                x = this.attr('cx'),
                y = this.attr('cy'); 

                if( Math.abs(x - px) < 15 && Math.abs(y - py) < 15 ) {
                    if((this.connectedTo.name == 'out') != (p.name == 'out') && this.connectedTo.card != p.card) {
                        if(p.connection)
                            p.connection.remove();
                        var to = this.connectedTo;
                        this.connection.remove();
                        r.connection(p, to); 
                        this.remove();
                        Checker.stack = [];
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
        this.animate({"r": 8}, 100);
    },
    hoverOut = function() {
        if(!this.removed)
            this.animate({"r": 4}, 100); 
    },

    ratio = {'in': (card.points.in2 ? 4 : 2), 'out': 2, 'in2': (4/3)},
    x = card.attr('x') + (card.width / ratio[name]),
    y = card.attr('y') + ((name == 'out') ? CARD_HEIGHT : 0),
    color = card.attr('fill'),
    point = this.circle(x, y, 4);

    point.attr({fill: color, stroke: color, "fill-opacity": 1, "stroke-width": 2, cursor: "hand"});
    point.name = name;
    point.card = card;
    point.drag(move, start, up);
    point.rollBack = rollBack;
    point.hover(hoverIn, hoverOut);
    return point;
};

String.prototype.singleEquals = function () {
    return this.indexOf('=') != -1 
                && this.indexOf('==') == -1 && this.indexOf('>=') == -1 
                && this.indexOf('<=') == -1 && this.indexOf('!=') == -1;
}

var el;
var r,
    colors = [],
    functions = {
        'π': 'Math.PI', 
        'PI': 'Math.PI', 
        '|x|': 'Math.abs(x)', 
        'x^y': 'Math.pow(x, y)',
        'log(x)': 'Math.log(x)',
        'sin(x)': 'Math.sin(x)',
        'cos(x)': 'Math.cos(x)',
        'x or y': 'x||y',
        'x and y': 'x&&y',
        'not x': '!x',
        },
    inVars = {'in': 'x', 'in2': 'y'},

    Clones = {
        clear: function() {
            this.animPos = 0;
            for (var i = 0; i < Checker.cards.length; i++) {
                if(Checker.cards[i].points.out && Checker.cards[i].points.out.clone.type)
                    Checker.cards[i].points.out.clone.hide();
                else if(Checker.cards[i].clone && Checker.cards[i].clone.type) {
                    Checker.cards[i].clone.hide();
                }
            }
            Checker.button.ready(false);
            this.stack = [];
        },

        animate: function() {
            if(Checker.stack.length > 0) {
                if(this.animPos == 0)
                    this.clone = r.cardClone(Checker.stack.shift());
                else
                    this.clone.moveTo(this.animPos);
                this.animPos = 0;
            } else {
                Checker.button.ready(false);
                Checker.animationDone();
            }
        }
    },

    Checker = {
        results: {},
        stack: [],
        init: function(names) {
            this.cards = this.loadCards(names);
            var c = r.controls();
            this.button = c.button;
            this.slider = c.slider;
        },

        loadCards: function(names) {
            var cards = [];
             colors[-2] = Raphael.getColor();
             colors[-1] = Raphael.getColor();//just to skip one ugly color :)
             colors[-1] = colors[-2];
             colors[1] = Raphael.getColor();
             colors[2] = Raphael.getColor();
             colors[0] = Raphael.getColor();
            for (var i = 0; i < names.length; i++) {
                var arity = 0;
                if(names[i].indexOf('x') != -1){
                    arity += 1;
                    if(names[i].indexOf('y') != -1)
                        arity += 1;
                    if(names[i].singleEquals())
                        arity = arity * (-1);
                }
                cards.push(r.card(names[i], arity));
            }
            return cards;
        },

        check: function() {
            this.stack = [];
            this.roots = [];
            for (var i = 0; i < this.cards.length; i++) {
                if(!this.cards[i].points.out || !this.cards[i].points.out.connectedTo)
                    this.roots.push(this.cards[i]);
            }
            for (var i = 0; i < this.roots.length; i++) {
                this.exp += ' && ' + this.parseCard(this.roots[i], true);
            }
            //debug(this.exp);
            Clones.clear();
            Checker.button.ready(this.areAllConnected())
        },
        animationDone: function() {
            var success = true;
            for (var i = 0; i < this.roots.length; i++) {
                success = success && this.succ(this.roots[i].exp);
            }
            if(success)
                alert('Správně!!');
        },
        
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
        jseval: function(exp) {
            try {
                var ret = eval(exp);
            } catch(e) {
               // var ret = 'chyba';
                var ret = e.message;
            } finally {
                if(this.isNumber(ret))
                    ret = this.roundNumber(ret, 3)
                this.results[exp] = ret;
            }
        },
        isNumber: function(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        },
        roundNumber: function (number, digits) {
            var multiple = Math.pow(10, digits);
            var rndedNum = Math.round(number * multiple) / multiple;
            return rndedNum;
        },
        areAllConnected: function() {
            return (this.cards.length == this.stack.length);
        },
        parseCard: function(card) {
            var exp = '(' + this.parseName(card.name) + ')';
            for (var i in card.points) {
                if(card.points[i].name != 'out' && card.points[i].connectedTo) {
                    exp = exp.replace(inVars[card.points[i].name], this.parseCard(card.points[i].connectedTo.card));
                }
            }
            card.exp = exp;
            this.stack.push(card);

            if(!this.results.hasOwnProperty(exp))
                this.eval(exp);
            return exp;
        },
        parseName: function(name) {
            return functions[name] ? functions[name] : (name.singleEquals() ? name.replace('=', ' == ') : name);
        }
    },

    debug = function(object) {
        var al;
        if(typeof object == "string")
            al = object;
        else
            for(var i in object) {
                al += ' # ' + i +  '%' + object[i] + "<br>\n";
            }
        document.getElementById('debug').innerHTML += al + "<br>\n"; 
    };

