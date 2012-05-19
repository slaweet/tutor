/*
* Author: Vít Stanislav<slaweet@mail.muni.cz> 
* Year: 2012
* compatibility: Mozilla Firefox, Opera, Google Chrome, Safari, Microsoft Internet Explorer >6
*/

var CONTROLS_WIDTH = 150;
var CONTROLS_HEIGHT = 440;
var BUTTON_WIDTH = 120;
var BUTTON_HEIGHT = 40;
var RESULT_WIDTH = 220;
var RESULT_HEIGHT = 65;
var SLIDER_WIDTH = 100;
var FONT_SIZE = 15;
var SPACE = 4;
var PERIMETER = 62;


var Transformations = {
    debugButtons: "",
    moveCount: 0,
    points: [],
    buttons: {},
    colors: [],
    process: function(expr) {
        expr = expr.replace(/(,|and)/g, "&&");
        expr = expr.replace(/or/g, "||");
        expr = expr.replace(/not/g, "!");
        expr = expr.replace(/pi/g, "PI");
        expr = expr.replace(/(abs|sin|cos|PI)/g, "Math.$1");
        expr = expr.replace(/(0-9)([xy])/g, "$1*$2");
        expr = expr.replace(/([xy0-9(][xy0-9)(/+\-]*)\^([0-9])/g, "Math.pow($1,$2)");
        //(/x=([^=])/,"x==$1")
        //.replace(/(x)==(y|\d+)/,"round($1)==round($2)");

        return expr;
    },
    clear: function(plot) {
        for (var i = 0; i < this[plot].points.length; i++) {
            this[plot].points[i].remove();
        }
        this[plot].points = [];
    },
    isValid: function(task) {
        try {
            var x = 1;
            var y = 1;
            eval(task)
            return "";
        } catch (e) {
            return e.message;
        }
    },
    update: function() {
        
        var task = document.getElementById('text').value;
        task = this.process(task);
        var error = this.isValid(task);
        if (error == "") {
            document.getElementById('error').innerHTML = "";
            this.draw("user", task, true)
            this.draw("diff", "(" + task + ") && (" + this.goal.task + ")", true);
            this.draw("diff-", "(" + task + ") && !(" + this.goal.task + ")", true);
            this.draw("diff+", "!(" + task + ") && (" + this.goal.task + ")",true);
        } else {
            document.getElementById('error').innerHTML = "chyba syntaxe: " + error;
        }
        document.getElementById('source').innerHTML = task;

    },
    draw: function(plot, expr, clear) {
        if (clear) {
            this.clear(plot);
        }
        this[plot].points = this[plot].paper.shape(PERIMETER/2, expr, this[plot].color );
    },
    plots: ["user", "goal", "diff"],
    init: function(task) {
        //task = task.replace('+','%2B');

        //Matrix.init();
        document.getElementById('goallabel').innerHTML = "Zadání:";
        document.getElementById('userlabel').innerHTML = "Aktuální pokus:";
        document.getElementById('difflabel').innerHTML = "Rozdíl:";
        document.getElementById('text').setAttribute('autocomplete', 'off');

        
        for (var i = 0; i < this.plots.length; i++) {
            var p = this.plots[i];
            this[p] = {}
            this[p].paper = Raphael(p, SPACE * (PERIMETER)+20, SPACE * (PERIMETER));
            this.grid = this[p].paper.grid(PERIMETER);
            this[p].points = [];

        }
        this.goal.task = this.process(task);

        this["diff-"] = {};
        this["diff-"].paper = this["diff"].paper;
        this["diff-"].points = [];
        this["diff+"] = {};
        this["diff+"].paper = this["diff"].paper;
        this["diff+"].points = [];
        this["goal"].color = "#ffff00";
        this["user"].color = "#0000ff"; 
        this["diff"].color = "#00ff00";
        this["diff+"].color = this.goal.color;
        this["diff-"].color = this.user.color;
        this.draw("goal", this.goal.task)

        //this.draw();
        //document.getElementById('text').innerHTML = time;

/*
        var source = task.split(':');
        this.source = this.sourceToObjects(source[0]);
        this.target = this.sourceToObjects(source[1]);
        this.initColors(this.source.length);
        this.sourceShape = this.plot.shape(this.source, this.colors, false);
        this.targetShape = this.plot.shape(this.target, this.colors, true);

        if (source[3] && source[3] !== '') {
            this.maxMoveCount = eval(source[3]);
        }
        this.initControls(source[2] ? source[2].split(',') : []);

        Matrix.setMatrix(this.getUnitMatrix());
        this.restart();
        */
    }
}


Raphael.fn.gridPoint = function (x, y, r, label) {
        var circle = this.circle(x, y, r);
        circle.center = this.circle(x, y, 3).toBack();
        circle.text = this.text(x, y - r, label);
        circle.attr({"stroke": "none", fill: "#000", "fill-opacity": 0 });
        circle.center.attr({"stroke": "#ccc", "fill": "#ccc"});
        circle.text.attr({"fill": "#ccc", "font-weight": "bold"});
        circle.text.hide();
        circle.center.hide();
        circle.hover(function () {
            this.text.show();
            this.text.toFront();
            this.center.show();
            this.center.toFront();
            this.toFront();

          },
          function () {
            this.text.hide();
            this.center.hide();
          }
        );
}
// Grid for shapes to be shown on

Raphael.fn.shape = function (perimeter, expr, color) {
    var size = SPACE;
    var step = 1/8;
    var points = [];
    for (var y = -perimeter; y < perimeter; y += step) {
        for (var x = -perimeter; x < perimeter; x += step) {
            var offset = x;
            try {
            var show = eval(expr);
            //    alert(x +" "+y);
            } catch (e) {
                //alert(expr);
            }
            if (show) {
                while (eval(expr) && x < perimeter) {
                    x += step;
                }
                var point = this.rect((perimeter + offset)*size -size*step/2,(perimeter - y)*size -size*step/2, size* (x-offset), size*step);
                point.attr({"stroke": "", "stroke-width": 0, fill: color});
                points.push(point);
            }
        }
    }
    return points;
}
Raphael.fn.grid = function (perimeter) {
    var color = '#666';
    var labelColor = '#aaa';
    for (var i = 1; i < perimeter; i++) {

        var hPath = this.path("M" + SPACE +","+ ( i*SPACE) +"l"+ (perimeter-2)*SPACE +" 0");
        var vPath = this.path("M"+ (i*SPACE) +"," +SPACE +"l0 "+ (perimeter-2)*SPACE);
        hPath.attr({stroke: color});
        vPath.attr({stroke: color});
        var stroke = ((i == perimeter/2) ? 4 : ((i-perimeter/2)%5 == 0 ? 1.1 : 0.5));
        
        hPath.attr({"stroke-width": stroke});
        vPath.attr({"stroke-width": stroke});
        /*
        for (var j = 1; j < perimeter; j++) {
            var x = (i - perimeter/2); 
            var y = (perimeter/2 - j);
            this.gridPoint(i*SPACE, j*SPACE, SPACE/2, "[" +x + "," + y + "]");
        }*/
    }
    var xLabel = this.text(SPACE * perimeter/2,10, "y");
    xLabel.attr({"font-size": FONT_SIZE, 'fill': labelColor});
    var yLabel = this.text(SPACE * perimeter - SPACE/2, SPACE * perimeter/2, "x");
    yLabel.attr({"font-size": FONT_SIZE, 'fill': labelColor});
}
// Slider element to control parameter of button

Raphael.fn.slider = function (x, y, init, color, range, button) {
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
        this.button.setParam(this.getParam());
    },
    up = function () {
        this.attr({'cursor': 'pointer'});
        this.inDrag = false;
        this.animate({fill: '#aaa', stroke: '#aaa'}, 200);
    },
    hoverIn = function() {
        this.animate({fill: '#aaa', stroke: '#aaa',"fill-opacity": .8}, 200);
    },
    hoverOut = function() {
        if(!this.inDrag)
            this.animate({fill: color, stroke: color}, 200);
    },  
    attr = {fill: color, stroke: color, "fill-opacity": .0, "stroke-width": 3},
    slider = this.circle(x + SLIDER_WIDTH * (init - range.from)/(range.to - range.from), y + 2, 6); 
    slider.range = range;
    slider.getParam = function () {
        var param = this.range.from + Math.round((this.attr('cx') - this.x)/SLIDER_WIDTH * (this.range.to - this.range.from)/this.range.step)* this.range.step;
        param = Transformations.roundNumber(param, 5);
        return param;
    }
    slider.button = button;
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
Raphael.fn.brackets = function (x, y, height, width, color) {
    return {
    left: this.bracket(x,y, height, color, "left"),
    right: this.bracket(x + width, y, height, color, "right")
    }
}

Raphael.fn.bracket = function (x, y, height, color, side) {

    var curve = height/20;
    if (side == "right") {
        curve = -curve;
    }
    var bracket = this.path("M "+(x+curve)+","+y+" C "+(x-curve)+","+(y+height/5)+" "+(x-curve)+","+(y+height*4/5)+" "+(x+curve)+","+(y+height));
    bracket.attr({"stroke-width": 3, stroke: color});
    return bracket;
}

Raphael.fn.matrixButton = function (x, y, color, showRect) {
    if (showRect) {
    var button = this.rect(x, y, 390, 70, 2);
    button.attr({fill: color, stroke: color, "fill-opacity": .1, "stroke-width": 3, 'cursor': 'pointer'});
    }
    this.brackets( 10, y + 5, 60, 100,  color);
    this.brackets(120, y + 5, 60, 40,  color);
    this.text(140, 20, "x").attr({"font-size": 1.5*FONT_SIZE, 'fill': color});
    this.text(140, 50, "y").attr({"font-size": 1.5*FONT_SIZE, 'fill': color});
    this.text(180, 35, "+").attr({"font-size": 1.5*FONT_SIZE, 'fill': color});
    this.brackets(195, y + 3, 60, 50,  color);
    //return button;
}

//transformation button element
Raphael.fn.button = function (props, x, y, color) {
    var hoverIn = function() {
            button.animate({stroke: color, "fill-opacity": .3}, 100);
    },
    hoverOut = function() {
            button.animate({stroke: color, "fill-opacity": .2}, 100);
    };    
    var button = this.rect(x, y, BUTTON_WIDTH, BUTTON_HEIGHT, 2);
    button.text = this.text(x + BUTTON_WIDTH/2, y + BUTTON_HEIGHT/3, props.name).toBack();
    button.text.attr({"font-size": FONT_SIZE, 'fill': color});
    if (props.defaultParam || props.defaultParam === 0) {
        button.text.attr({y: y +  7/24*BUTTON_HEIGHT});
        button.text.attr({'text': props.name + ' ' + props.defaultParam});
        button.slider = this.slider(x + (BUTTON_WIDTH - SLIDER_WIDTH)/2 ,y + 2/3*BUTTON_HEIGHT, props.defaultParam, color, props.range, button);
    } else {
        button.text.attr({y: y +  1/2*BUTTON_HEIGHT});
        //button.attr({height: BUTTON_HEIGHT*2/3});
    }
    button.attr({fill: color, stroke: color, "fill-opacity": .2, "stroke-width": 3, 'cursor': 'pointer'});
    button.hover(hoverIn, hoverOut);
    button.clickFn = props.fn;
    button.onClick = function () {
        Transformations.buttonClick(this.clickFn, this.getParam());
        button.animate({stroke: color, "fill-opacity": .8}, 100, function() {
            button.animate({stroke: color, "fill-opacity": .2}, 100);
        });
    };
    button.getParam = function() {
        if (!this.slider) {
            return 0;
        }
        var label = this.text.attr("text").split(' ');
        var param = label[label.length -1];
        return eval(param);

    }
    button.setParam = function(param) {
        var label = this.text.attr("text").split(' ');
        label[label.length -1] = param;
        this.text.attr({text: label.join(' ')});
    }
    button.click(button.onClick);
    button.name = props.name;
    button.cover = this.rect(x - 3 , y - 3 , BUTTON_WIDTH + 6, BUTTON_HEIGHT + 6);
    button.cover.attr({fill: "#333", stroke: "#333", "fill-opacity": .8, "stroke-width": 0});
    button.setAllowed = function(bool) {
        bool ? this.cover.hide() : this.cover.show();
    }
    return button;
};

