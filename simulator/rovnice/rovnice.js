/*
* Author: Vít Stanislav<slaweet@mail.muni.cz> 
* Year: 2012
* compatibility: Mozilla Firefox, Opera, Google Chrome, Safari, Microsoft Internet Explorer 9
* works, but slowly: MSIE 8, MSIE 7
*/

/*
//damn MSIE
const HOLDER_WIDTH = 640;
const HOLDER_HEIGHT = 480;
const CARD_HEIGHT = 40;
*/

var HOLDER_WIDTH = 640;
var HOLDER_HEIGHT = 480;
var CONTAINER_WIDTH = 290;
var CONTAINER_HEIGHT = 370;
var CARD_HEIGHT = 40;
var CONTROLS_WIDTH = 245;
var CONTROLS_HEIGHT = 65;
var SLIDER_WIDTH = 120;
var GREY = '#aaa';
var BUTTON_WIDTH = 60;
var BUTTON_HEIGHT = 40;
var FONT_SIZE = 30;

var r; //global var for the raphael object;

var EquationSimulator = {
    moveCount: 0,
    buttons: {},
    init: function(equation) {
        this.form = document.getElementById('form');
        this.input = document.getElementById('in');
        this.input.setAttribute('autocomplete', 'off');
        this.question = document.getElementById('question');
        var sides = equation.split('=');
        this.buttons = r.buttonBar(10, 10);
        var x = 10;
        var y = 70;
        this.left = r.container(x, y, sides[0], "end", '+');
        x += CONTAINER_WIDTH + 20;
        this.eq = r.text(x, y + CONTAINER_HEIGHT / 2, '=');
        this.eq.attr({fill: GREY, 'font-size': 30 });
        this.eq = r.text(x, y + CONTAINER_HEIGHT + 20,'=');
        this.eq.attr({fill: GREY, 'font-size': 30 });
        x += 20;
        this.right = r.container(x, y, sides[1], 'start', '+');
        document.addEvent('keypress', this.onKeyDown);
    },
    showForm: function(reason, name, x, y) {
        this.form.style.top = y;
        this.form.style.left = x;
        this.form.reason = reason;
        this.input.value = name;
        document.getElementById('question').innerHTML = '';
        $('form').fadeIn(100);
        this.input.focus();
    },
    addition: function(name) {
        this.left.addCard(name);
        this.right.addCard(name);
    },
    multiple: function(name) {
        this.left.multipleCards(name);
        this.right.multipleCards(name);
    },
    checkSolved: function() {
        if (this.left.isVarOnly() && this.right.isNumberOnly()) {
            //alert('Správně!!');
            var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&win=1";
            sendDataToInterface(q);
            after_win();
        }
    },
    submit: function() {
        this.hideForm();
        this[this.form.reason]();
    },
    join: function() {
        var newName = this.form.join1.computeWith(this.form.join2);
        if (newName != EquationSimulator.input.value) {
            this.form.join1.onJoin(this.form.join2);
        } else {
            this.form.join1.join(this.form.join2);
        }
    },
    modifyAll: function() {
        var number = this.input.value;
        var operator = number.charAt(0);
        if (isNumber(number.substring(1))) {
        switch (operator) {
            case '+':
            case '-':
                this.addition(this.input.value)
                break;
            case '/':
            case '*':
                this.multiple(this.input.value)
                break;
        }
        } else {
            this.showForm('modifyAll', operator);
        }
    },
    hideForm: function() {
        $('form').fadeOut(100);
    },
    onKeyDown: function(event){
        switch (event.key) {
            case '+':
            case '-':
            case '/':
            case '*':
                if (EquationSimulator.form.style.display != 'block') {
                    EquationSimulator.showForm('modifyAll', '')
                }
                break;
            case 'esc':
                EquationSimulator.hideForm();
                break;
        }
    }
}

Raphael.fn.buttonBar = function (x, y) {
    var buttonFces = {'+': 'addition', '-': 'addition', '*': 'multiple', '/': 'multiple'},
        buttonColor = Raphael.getColor();
    var bar = this.rect(x, y, HOLDER_WIDTH -20, BUTTON_HEIGHT + 10, 5);
    bar.attr({fill: GREY, stroke: GREY, "fill-opacity": .2, "stroke-width": 3});
    x += HOLDER_WIDTH/2 - 2 * (20 + BUTTON_WIDTH)
    for (var i in buttonFces) {
        bar[i] = this.button(i, x, y+5, buttonFces[i], buttonColor);
        x += 20 + BUTTON_WIDTH;
    }
    return bar
}
Raphael.fn.container = function (x, y, expr, anchor, type) {
    var color =  '#aaa';
    var cont = this.rect(x, y, CONTAINER_WIDTH, CONTAINER_HEIGHT, 5);
    var text = this.text(x + (anchor == 'end'? CONTAINER_WIDTH : 0), y + CONTAINER_HEIGHT + 20, expr);
    var parseExprs = function(expr) {
        var exprs = expr.split('+');
        var nExprs = []; 
        for (var i = 0; i < exprs.length; i++) {
            var minExprs = exprs[i].split('-');
            nExprs.push('+' + minExprs[0]); 
            for (var j = 1; j < minExprs.length; j++) {
                nExprs.push('-' + minExprs[j]);
            }
        }
        return nExprs;
    }
    var exprs = parseExprs(expr);
    cont.col = Raphael.getColor(); 
    cont.cards = [];
    for (var i = 0; i < exprs.length; i++) {
        cont.cards[i] = this.card({x: x+20, y: y + 20 + i*60}, exprs[i], cont); 
    }
    text.attr({fill: GREY, 'font-size': 30, "text-anchor": anchor });
    cont.text = text;
    cont.attr({fill: color, stroke: color, "fill-opacity": .2, "stroke-width": 3});
    cont.x = x;
    cont.y = y;
    cont.type = this.text(x + CONTAINER_WIDTH, y + 12, type);
    cont.type.attr({fill: GREY, 'font-size': 30, "text-anchor": 'end' });
    cont.updateText = function() {
        var newText = '';
        for (var i = 0; i < this.cards.length; i++) {
            newText += this.cards[i].name;
        }
        if (newText.length == 0) {
            newText = '0';
        } else if (newText.charAt(0) == '+') {
            newText = newText.substring(1);
        }
        this.text.attr({text: newText});
        EquationSimulator.checkSolved();
    };
    cont.addCard = function(name) {
        this.cards.push(r.card({x: (this.x + 20 + Math.random() * (CONTAINER_WIDTH -80)), y: (this.y + 20 + Math.random() * (CONTAINER_HEIGHT-80))}, name, this));
        this.updateText();
    };
    cont.multipleCards = function(name) {
        for (var i = 0; i < this.cards.length; i++) {
            //this.cards.push(r.card({x: this.x + 20, y: this.y + 20}, name, this));
            this.cards[i].join(r.card({x: this.x + 20, y: this.y + 20}, name, this))

        }

    };
    cont.isVarOnly = function() {
        return this.cards.length == 1 && this.cards[0].name == '+x';
    };
    cont.isNumberOnly = function() {
        return (this.cards.length == 1 && this.cards[0].type == 'number') || this.cards.length == 0;
    };
    return cont;
}

// Card element with operation name ('5', 'x+y', 'x=6'...) and connect points (in, in2, out).

Raphael.fn.card = function (position, name, container) {
    var start = function () {
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
            if(this.ox + dx < this.container.x )
                dx = this.container.x -this.ox;
            else if (this.ox + dx + this.width > this.container.x + CONTAINER_WIDTH)
                dx =  this.container.x + CONTAINER_WIDTH - this.width - this.ox;
            if (this.oy + dy < this.container.y)
                dy = this.container.y -this.oy;
            else if (this.oy + dy + CARD_HEIGHT > this.container.y + CONTAINER_HEIGHT)
                dy = this.container.y + CONTAINER_HEIGHT - CARD_HEIGHT - this.oy;
            move(dx, dy, this);
            move(dx, dy, this.text);
            move(dx, dy, this.bg);
            if (this.touching && !areTouching(this, this.touching)) {
                this.touching.unHighlight();
                delete this.touching;
            }
            if (!this.touching) {
                for (var i = 0; i < this.container.cards.length; i++) {
                    var c = this.container.cards[i];
                    if (areTouching(this, c)) {
                        c.highlight();
                        this.touching = c;
                        break;
                    }
                }
            } 

            r.safari();
    },
    up = function () {
        this.animate({"fill-opacity": .0}, 200);
        this.inDrag = false;
        if (this.touching) {
            this.onJoin(this.touching);
            delete this.touching;
        }
    },
    hoverIn = function() {
        if(!this.inDrag)
            this.animate({"fill-opacity": .2}, 200);
    },
    hoverOut = function() {
        if(!this.inDrag && !this.removed)
            this.animate({"fill-opacity": .0}, 200);
    },
    areTouching = function(c1, c2) {
        if (c1 == c2) {
            return false;
        }
        if (c1.type != c2.type) {
            return false;
        }
        var c1x = c1.attr('x'),
        c1y = c1.attr('y'),
        c2x = c2.attr('x'),
        c2y = c2.attr('y'), 
        c1width = c1.attr('width'),
        c1height = c1.attr('height'),
        c2width = c2.attr('width'),
        c2height = c2.attr('height');
        return (c2x < c1x + c1width && c1x < c2x + c2width 
            && c2y < c1y + c1height && c1y < c2y + c2height);
    },
    color = container.col, 
    // comented lines for random x,y of a new card
    //shift = (arity < 0 ? 3 : arity),
    //y = Math.floor((Math.random() + shift) * (HOLDER_HEIGHT - CARD_HEIGHT) / (shift > 1 ? 4 : 2 + shift)),
    y = position.y,
    text = this.text(0, y + CARD_HEIGHT/2, (name.charAt(0) == '+' ? name.substring(1) : name));
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

    card.type = name.indexOf('x') == -1 ? 'number' : 'variable';
    card.drag(onMove, start, up);
    card.hover(hoverIn, hoverOut);
    card.container = container;
    card.unHighlight = function() {
            this.animate({"fill-opacity": .1}, 100);
    };
    card.highlight = function() {
            this.animate({"fill-opacity": .7}, 100);
    };
    card.onJoin = function(card) {
        EquationSimulator.showForm('join', '',this.attr('x') - 20, this.attr('y') - 10);
        document.getElementById('question').innerHTML = ommitPlus(this.name + card.name + "=");
        EquationSimulator.form.join1 = this;
        EquationSimulator.form.join2 = card;
        card.unHighlight();
    }
    card.computeWith = function(card){
        var newName;
        switch (this.type) {
            case 'number':
                newName = eval(this.name + card.name);
                break;
            case 'variable':
                newName = this.name + card.name;
                newName = newName.replace(/([+-])x/g,"$11");
                newName = newName.replace(/x/g,"");
                newName = eval(newName);
                newName = newName == '1' ? '' : newName;
                if (newName != '0') {
                    newName += 'x';
                }
                break;
        }
        return newName;
    }
    card.join = function(card){
        var newName = this.computeWith(card);
        this.text.attr({text: newName});
        if (newName.toString().charAt(0) != '-') {
            newName = '+' + newName;
        }
        this.name = newName;
        var newWidth = this.text.getBBox()['width'] + 15;
        this.attr({width: newWidth});
        this.bg.attr({width: newWidth});
        this.text.attr({x: this.attr('x') + newWidth/2});

        var cont = this.container;
        card.deepRemove();
        if (this.name == '+0' || this.name == '+0x') {
            this.deepRemove();
        }
        cont.updateText();
    };
    card.deepRemove = function() {
        for (var i = 0; i < this.container.cards.length; i++) {
            if(this.container.cards[i] == this) {
                this.container.cards.splice(i, 1);
            }
        }
        this.bg.remove();
        this.text.remove();
        this.remove();
    }
    return card;
};

Raphael.fn.button = function (name, x, y, clickFn, color) {
    var hoverIn = function() {
            button.animate({stroke: color, "fill-opacity": .3}, 100);
    },
    hoverOut = function() {
            button.animate({stroke: color, "fill-opacity": .2}, 100);
    },    
    width =  BUTTON_WIDTH + (name.length > 3 ? 10 : 0);
    if( name.length > 3 ) x -= 5;
    var text = this.text(x + width/2, y + BUTTON_HEIGHT/2, name);
    text.attr({"font-size": FONT_SIZE, 'fill': color});
    var button = this.rect(x, y, width, BUTTON_HEIGHT, 2);
    button.attr({fill: color, stroke: color, "fill-opacity": .2, "stroke-width": 3, 'cursor': 'pointer'});
    button.hover(hoverIn, hoverOut);
    button.clickFn = clickFn;
    button.onClick = function () {
        var done = EquationSimulator.showForm('modifyAll', this.name, this.attr('x') - 20, this.attr('y') - 10);

        if(done) {
            button.animate({stroke: color, "fill-opacity": .8}, 100, function() {
                button.animate({stroke: color, "fill-opacity": .2}, 100);
            });
        }
    };
    button.click(button.onClick);
    button.name = name;
    return button;
};

var isNumber = function(string) {
    return string == string - 0 || (string.charAt(string.length - 1) == 'x' && isNumber(string.substring(1)));
}
var ommitPlus = function(string) {
    return string.charAt(0) == '+' ? string.substring(1) : string;
}
