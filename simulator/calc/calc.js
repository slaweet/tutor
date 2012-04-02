/*
* Author: Vít Stanislav<slaweet@mail.muni.cz> 
* Year: 2012
* compatibility: Mozilla Firefox, Opera, Google Chrome, Safari, Microsoft Internet Explorer >6
*/

var HOLDER_WIDTH = 580;
var HOLDER_HEIGHT = 320;
var BUTTON_WIDTH = 60;
var BUTTON_HEIGHT = 40;
var RESULT_WIDTH = 220;
var RESULT_HEIGHT = 65;
var SLIDER_WIDTH = 120;
var FONT_SIZE = 30;

var r; //global var for the raphael object;

// UI build manager
var UI = {
    buttons: {},
    numbers: [7, 4, 1, 0, 8, 5, 2, '.', 9, 6, 3],
    actions: ['+', '-', '*', '/'],
    unActions: ['1/x', 'x!', 'x^2', 'log', 'sqrt', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan'],
    //constants: ['PI', 'E'],
    build: function (allowed, goals) {
        this.allowed = allowed;
        this.colors = [];
        for (var i = 0; i < 5; i++) {
            this.colors.push(Raphael.getColor());
        }
        for (var i = 0; i < goals.length; i++) {
            document.getElementById('task').innerHTML += "<div><span id='g"+ goals[i] +"'> " + goals[i] + " </span></div>";
        }
        this.allAllowed = this.isAllowed('all');
        var x = 20;
        var y = 20;
        this.result = r.resultRow(x, y);
        this.memoryIndicator = r.memoryIndicator(x, y, this.colors[0]);
        this.buttons['esc'] = r.button('AC', x + RESULT_WIDTH + 20 , y, 'reset', this.colors[0]);
        if(this.isAllowed('M')) {
            this.buttons['Min'] = r.button('Min', x + (RESULT_WIDTH + 20) + BUTTON_WIDTH + 20 , y, 'memorize', this.colors[0]);
            this.buttons['MR'] = r.button('MR', x + (RESULT_WIDTH + 20)  + (BUTTON_WIDTH + 20) * 2 , y, 'memoryRecall', this.colors[0]);
        }
        y += 60;
        this.y = y;
        this.buildColumn(this.numbers, x, 'writeNumber', 4); 
        this.buttons['enter'] = r.button('=', x + (BUTTON_WIDTH + 20) * 2 , y + (BUTTON_HEIGHT+20) * 3, 'calculate', this.colors[2]);
        x += (BUTTON_WIDTH + 20) * Math.ceil(this.numbers.length /4);
        this.buildColumn(this.actions, x, 'biAction', 2); 
        x += (BUTTON_WIDTH + 20) * Math.ceil(this.actions.length /4);
        this.buildColumn(this.unActions, x, 'unAction', 2); 
        x += (BUTTON_WIDTH + 20) * Math.ceil(this.unActions.length /4);
        //this.y += (BUTTON_HEIGHT + 20) * 2;
        //this.buildColumn(this.constants, x - (BUTTON_WIDTH + 20), 'constant', 1); 
        return this.buttons; 
    },
    buildColumn: function(buttonNames, x, action, colorIndex) {
        var y = this.y;
        for(var i = 0; i < buttonNames.length; i++) {
            if(false || this.isAllowed(buttonNames[i])) {
                px = x + (BUTTON_WIDTH + 20) * ((i - i % 4) / 4 );
                py = y + (BUTTON_HEIGHT + 20) * (i % 4);
                var b = r.button(buttonNames[i],px ,py , action, this.colors[colorIndex]);
                this.buttons[buttonNames[i]] = b;
            }
        } 
    },
    isAllowed: function(name) {
        if(this.allAllowed)
            return true;
        for(var i = 0; i < this.allowed.length; i++) {
            if(this.allowed[i] == name)
                return true;
        }
        return false;
    }
}

// main manager entrence point of whole calculator
var Calculator = {
    init: function(allowed) {
        this.goal = allowed.shift();
        this.goals = this.goal.split(';');
        UI.build(allowed, this.goals);
        this.result = UI.result;
        Evaluator.reset();
        document.addEvent('keypress', this.onKeyDown);
        this.moveCount = 0;
    },
    tutorLog: function(result) {
        //if(this.round(result) == this.goal) {
        for(var i = 0; i < this.goals.length; i++) {
            var goal = this.goals[i].substring(this.goals[i].indexOf('=')+1);
            goal = eval(goal);
            if(this.round(result) == goal) {
                document.getElementById('g' + this.goals[i]).className = 'stroke'; 

                this.goals.splice(i, 1);
            }
        }
        if(this.goals.length == 0) {
            //alert('Správně!!');
            var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&win=1";
            sendDataToInterface(q);
            after_win();
        }
    },
    roundNumber: function (number, digits) {
        if (digits === undefined) digits = 9;
        var multiple = Math.pow(10, digits);
        if(number > multiple * 10) return 'Error: too big';
        var rndedNum = Math.round(number * multiple) / multiple;
        return rndedNum;
    },
    round: function (number) {
        if(Math.round(number) != number) {
            var digits = 11;
            digits -= (Math.round(number) + '').length + 1;
            var multiple = Math.pow(10, digits);
            number = Math.round(number * multiple) / multiple;
        }
        return number;
    },
    buttonClick: function (name, clickFn) {
        var done = Evaluator[clickFn](name);
        if(done) {
            name = (name+'').replace('+','%2B');
            this.moveCount++;
            //buildTask(name );
            var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&move="+name;
            sendDataToInterface(q);		
        }
        return done; 
    },
    onKeyDown: function(event){
        //Calculator.event = event;
        if(UI.buttons[event.key]) {
            UI.buttons[event.key].onClick();
            Calculator.buffer = '';
            event.stop();
        } else {
            Calculator.buffer += event.key;
            if(UI.buttons[Calculator.buffer]) {
                UI.buttons[Calculator.buffer].onClick();
                Calculator.buffer = '';
                event.stop();
            }
        }
    }
}

// object that evaluates button presses and value of the result
var Evaluator = {
    reset: function() {
        this.no1 = NaN;
        this.no2 = NaN;
        this.action = '';
        this.newNumber = true;
        UI.result.write(0);
        Calculator.buffer = '';
        return true;
    },
    memorize: function() {
        if(!isNaN(this.no1)) {
            this.memory = this.no1;
            UI.memoryIndicator.show();
            return true;
        }
    },
    memoryRecall: function() {
        if(this.memory) {
            this.writeResult(this.memory);
            return true;
        }
    },
    constant: function(action) {
        this.writeResult(Math[action]);
        return true;
    },
    unAction: function(action) {
        if(!isNaN(this.no1)) {
            if(!isNaN(this.no2)) {
                this.calculate();
            }
            switch (action) {
            case '1/x':
                var result = 1 / this.no1;
                break;
            case 'x!':
                var result = this.fact(this.no1);
                break;
            case 'log':
                var result = this.log(10, this.no1);
                break;
            case 'x^2':
                var result = Math.pow(this.no1, 2);
                break;
            case 'sin':
            case 'cos':
            case 'tan':
                var result = Math[action](this.toRadians(this.no1));
                break;
            case 'asin':
            case 'acos':
            case 'atan':
                var result = this.toDegrees(Math[action](this.no1));
                break;
            default:
                var result = Math[action](this.no1);
                break;
            }
            this.writeResult(result);
            this.newNumber = true;
            return true;
        }
        return false;
    },
    biAction: function(action) {
        if(isNaN(this.no2)) {
            this.no2 = this.no1;
            this.newNumber = true;
        } else {
            this.calculate();
            this.no2 = this.no1;
        }
        this.action = action;
        //alert(action)
        return true;
    },
    writeNumber: function(number) {
        if (number == '.' && this.decimal && (this.no1 + '').indexOf('.') != -1)
            return false;
        var result = ''+ number;
        if (!this.newNumber) { 
            if (this.decimal && (this.no1).indexOf('.') == -1)
                result = '.' + result;
            result =  this.no1 + result;
        } else {
            this.decimal = false;
            if(number == '.')
                result = '0.';
        }
        this.writeResult(result);
        if (number == '.')
            this.decimal = true;
        this.newNumber = false;
        return true;
    },
    calculate: function() {
        if(isNaN(this.no2))
            return;
        try {
            var result = eval(this.no2 + this.action + '(' + this.no1 + ')');
        } catch(e) {
            var result = 'error';
        } finally {
        this.writeResult(result);
        this.no2 = NaN; 
        this.newNumber = true;
        }
        return true;
    },
    log: function(base, val) {
        return Math.log(val) / Math.log(base);
    },
    fact: function(num) {
        var rval=1;
        for (var i = 2; i <= num; i++)
            rval = rval * i;
        return rval;
    },
    writeResult: function(result) {
        this.no1 = result + '';
        UI.result.write(result);
        Calculator.tutorLog(this.no1);
    },
    toRadians: function(angle) {
        return angle * (Math.PI / 180);
    },
    toDegrees: function(angle) {
        return angle * (180 / Math.PI);
    }
}

//Calculator display element
Raphael.fn.resultRow = function (x, y) {
    var color = '#aaaaaa',
        rect = this.rect(x, y, RESULT_WIDTH, BUTTON_HEIGHT, 2),
        row = this.text(x + RESULT_WIDTH -10, y + BUTTON_HEIGHT/2, '');
    row.attr({"font-size": FONT_SIZE, 'fill': color, 'text-anchor': 'end'}); //, 'font-family': 'monospace' });
    rect.attr({fill: color, stroke: color, "fill-opacity": .2, "stroke-width": 3});
    row.write = function(number) {
        var result = Calculator.round(number);
        if(number > Math.pow(10, 11)) {
            result = 'Error: too big';
        }
        this.attr({text: result});
    }
    return row;
}

//indicator of some value saved in calculator memory (by 'Min' button)
Raphael.fn.memoryIndicator = function (x, y, color) {
    var mi = r.text(x+10, y+10, 'M');
    mi.attr({"font-size": FONT_SIZE / 2, 'fill': color, 'font-weight': 'bold'});
    mi.hide();
    return mi
}

//calculator button element
Raphael.fn.button = function (name, x, y, clickFn, color) {
    var hoverIn = function() {
            button.animate({stroke: color, "fill-opacity": .3}, 100);
    },
    hoverOut = function() {
            button.animate({stroke: color, "fill-opacity": .2}, 100);
    },    
    parseName = function(name) {
        name = name.toString();
        var transforms = {'asin': 'sin^-1','acos': 'cos^-1','atan': 'tan^-1'};//,'E' : 'e'};//,'PI':'π'}
        if(transforms[name]) {
            name = transforms[name];
        }
        var index = name.indexOf('^');
        if(index != -1) {
            var expText = name.substring(index + 1);
            name = name.substring(0, index);
            var exp = r.text(x + ((name.length+11)/16)*width, y + BUTTON_HEIGHT/4, expText)
            exp.attr({"font-size": FONT_SIZE/2, 'fill': color, stroke: color, "stroke-width": 1});
        }
        index = name.indexOf('sqrt');
        if(index != -1) {
            var sqrt = r.path("M"+ (x + width/3) +","+ (y + BUTTON_HEIGHT/2) +"l5 0, 5 10, 5 -20, 10 0")
            sqrt.attr({stroke: color, "stroke-width": 2.5});
            name = name.substring(0, index);

        }
        return name;
    },
    width =  BUTTON_WIDTH + (name.length > 3 ? 10 : 0);
    if( name.length > 3 ) x -= 5;
    var text = this.text(x + width/2, y + BUTTON_HEIGHT/2, parseName(name));
    text.attr({"font-size": FONT_SIZE, 'fill': color});
    var button = this.rect(x, y, width, BUTTON_HEIGHT, 2);
    button.attr({fill: color, stroke: color, "fill-opacity": .2, "stroke-width": 3, 'cursor': 'pointer'});
    button.hover(hoverIn, hoverOut);
    button.clickFn = clickFn;
    button.onClick = function () {
        var done = Calculator.buttonClick(this.name, this.clickFn);
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

