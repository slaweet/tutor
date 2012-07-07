/*
* Author: Vít Stanislav<slaweet@mail.muni.cz> 
* Year: 2012
* compatibility: Mozilla Firefox, Opera, Google Chrome, Safari, Microsoft Internet Explorer >6
*/

var CONTROLS_WIDTH = 150;
var CONTROLS_HEIGHT = 440;
var BUTTON_WIDTH = 130;
var BUTTON_HEIGHT = 40;
var SLIDER_WIDTH = 100;
var FONT_SIZE = 15;
var SPACE = 20;
var PERIMETER = 22;
var BUNDLE = {
    "en":{ 
    "translateX": "Translate x by", 
    "translateY": "Translate y by", 
    "mirrorX": "Mirror x =", 
    "mirrorY": "Mirror y =", 
    "scaleX": "Scaling x", 
    "scaleY": "Scaling y", 
    "rotate": "Rotate by", 
    "unbounded": "Unbounded",
    "matrix": "Apply",
    "undo": "Undo",
    "restart": "Reset",
    "moves": "Moves",
    "total": "Summary"
    },
    "cs":{ 
    "translateX": "Posun x o", 
    "translateY": "Posun y o", 
    "mirrorX": "Zrcadlit x =", 
    "mirrorY": "Zrcadlit y =", 
    "scaleX": "Zvětšování x", 
    "scaleY": "Zvětšování y", 
    "rotate": "Rotace o", 
    "unbounded": "Neomezeně",
    "matrix": "Aplikovat",
    "undo": "Krok zpět",
    "restart": "Reset",
    "moves": "Tahy",
    "total": "Celková transformace"
    }
}

//main manager of the whole file
var Transformations = {
    debugButtons: "",
    moveCount: 0,
    cumulatives: [],
    codes: {
         "rotate": "ro",
         "mirrorX": "rx",
         "mirrorY": "ry",
         "translateX": "tx",
         "translateY": "ty",
         "scaleX" : "sx", 
         "scaleY" : "sy"
    },
    buttonNames: {
        tx: {fn: "translateX", defaultParam: 1, range: {from: -10, to: 10, step: 1}},
        ty: {fn: "translateY", defaultParam: 1, range: {from: -10, to: 10, step: 1}},
        rx: {fn: "mirrorX", defaultParam: 0, range: {from: -5, to: 5, step: 1}},
        ry: {fn: "mirrorY", defaultParam: 0, range: {from: -5, to: 5, step: 1}},
        sx: {fn: "scaleX", defaultParam: 0.5, range: {from: 0, to: 2, step: 0.1}},
        sy: {fn: "scaleY", defaultParam: 0.5, range: {from: 0, to: 2, step: 0.1}},
        ro: {fn: "rotate", defaultParam: 90, range: {from: -180, to: 180, step: 15}}
    },
    controlNames: {
        m: {fn: "matrix", name: "Aplikovat"},
        u: {fn: "undo", name: "Krok zpět"},
        re: {fn: "restart", name: "Reset"}
    },
    buttons: {},
    colors: [],
    init: function(task) {
        for (var i in BUNDLE) {
            Lang.setBundle(i, BUNDLE[i]);
        }

        Matrix.init();
        //document.getElementById('step').innerHTML = "Jedna operace:";
        document.getElementById('total').innerHTML = Lang.get("total");
        document.getElementById("plot").innerHTML = "";

        this.plot = Raphael("plot", SPACE * (PERIMETER), SPACE * (PERIMETER));

        this.grid = this.plot.grid(PERIMETER);

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
    },
    sourceToObjects: function(source) {
        var shape = eval("(["+source +"])");
        for (var i = 0; i < shape.length; i++) {
            shape[i] = {x: shape[i][0], y: shape[i][1]};
        }
        return shape;
    },
    initColors: function(count) {
        for (var i = 0; i < count; i++) {
            this.colors.push(Raphael.getColor());
        }
    },
    initControls: function(allowed) {
        this.controls = Raphael("controls", CONTROLS_WIDTH, CONTROLS_HEIGHT);
        this.allowed = allowed;
        var i = 0;
        var colors = ['#bfac00','#26bf00'];
        for (var j in this.buttonNames) {
            this.buttons[j] = this.controls.button(this.buttonNames[j], 5, 20 + (i++)*(20 + BUTTON_HEIGHT), colors[(i+i%2)%4/2]);
        }

        //init undo button
        var color = '#00a2bf'; 
        this.matrixControls = Raphael("u", BUTTON_WIDTH +10, 70);
        this.buttons["u"] = this.matrixControls.button(this.controlNames["u"], 2, 15, color );
        
        //init matrix with Apply button
        this.singlewr = Raphael("matrixwraper", 410,75);
        this.singlewr.matrixButton(3, 3, color, true);
        this.buttons["m"] = this.singlewr.button(this.controlNames["m"], 260, 18, color );
        
        color = "#aaa";
        this.sumarywr = Raphael("sumarymatrixwraper", 460,75);
        this.sumarywr.matrixButton(3, 3, color, false);
        this.buttons["re"] = this.sumarywr.button(this.controlNames["re"], 317, 18, color );

        this.counter = this.initCounter(5, 5, this.maxMoveCount ,color );
        this.buttons['re'].setAllowed('true');
    },
    setAllowedButtons: function(isAllowed) {
        for (var i = 0; i < this.allowed.length; i++) {
            this.buttons[this.allowed[i]].setAllowed(isAllowed);
        }
    },
    showMirrorAxis: function(from,to) {
        var path = this.plot.path(this.pathFromTo(from,to));
        path.attr({stroke: "#ddd","stroke-width": 3, opacity: 0});
        path.animate({opacity:1},200, function(){
            this.animate({ opacity: 0}, 2000, function(){
                this.remove();
            });
        });
    },
    buttonClick: function(clickfn, param) {
        var matrix = this.getUnitMatrix();
        switch (clickfn) {
            case 'mirrorX':
                matrix[0] = -1;
                matrix[2] = 2 * param;
                this.showMirrorAxis({x: param,y:-10},{x: param,y:10});
            break;
            case 'mirrorY':
                matrix[4] = -1;
                matrix[5] = 2 * param;
                this.showMirrorAxis({x: -10 ,y: param},{x: 10,y:param});
            break;
            case 'rotate':
                param = this.toRadians(param);
                matrix[0] = this.roundNumber(Math.cos(param),9);
                matrix[1] = this.roundNumber(-Math.sin(param),9);
                matrix[3] = this.roundNumber(Math.sin(param),9);
                matrix[4] = this.roundNumber(Math.cos(param),9);
            break;
            case 'translateX':
                matrix[2] = param;
            break;
            case 'translateY':
                matrix[5] = param;
            break;
            case 'scaleX':
                matrix[0] = param;
            break;
            case 'scaleY':
                matrix[4] = param;
            break;
            case 'matrix':
                matrix = Matrix.getMatrix("single");
            break;
            case 'undo':
                this.undo();
                return;
            break;
            case 'restart':
                this.tutorLog("restart");
                this.restart();
                return;
            break;
            default:
                alert("error: invalid button name");
                return;
        }
        if (this.debugButtons.indexOf(this.codes[clickfn]) == -1) {
            this.debugButtons += (this.debugButtons == "" ? "" : ",") + this.codes[clickfn];
        }
        this.counter.increase();
        if (this.counter.getCount() >= this.maxMoveCount) {
            this.setAllowedButtons(false);
        }
        this.buttons["u"].setAllowed(true);

        Matrix.setMatrix(matrix);
        this.lastCumulative = Matrix.getMatrix('cumulative');
        this.cumulatives.push(this.lastCumulative);
        var cumulative= Matrix.multiple(matrix, this.lastCumulative);
        Matrix.setMatrix(cumulative, "cumulative");
        this.tutorLog(clickfn + ":" + Matrix.getMatrix("single").splice(0,6).join(','));

        this.applyMatrix(matrix);
    },
    undo: function() {
        this.tutorLog("undo");
        this.setAllowedButtons(true);
        var matrix = this.cumulatives.pop();
        this.transform(this.source);
        Matrix.setMatrix(matrix, "cumulative");
        this.applyMatrix(matrix);
        this.counter.decrease();
        if (this.cumulatives.length == 0) {
            this.buttons["u"].setAllowed(false);
        }
    },
    restart: function() {
        this.setAllowedButtons(true);
        this.buttons["u"].setAllowed(false);

        this.transform(this.source);
        Matrix.setMatrix(this.getUnitMatrix(), 'cumulative');
        this.counter.setCount(0);
        this.cumulatives = [];
    },
    getUnitMatrix: function() {
        return [
        1,0,0,
        0,1,0,
        0,0,1
        ];
    },
    applyMatrix: function(matrix) {
        var to = [];
        var points = this.sourceShape.points;
        for (var i = 0; i < points.length; i++) {
            var x = points[i].x * matrix[0] 
                  + points[i].y * matrix[1]
                  + 1           * matrix[2];
            var y = points[i].x * matrix[3] 
                  + points[i].y * matrix[4]
                  + 1           * matrix[5];
            to.push({x: x, y: y});
        }
        this.transform(to);
    },
    transform : function (to) {
        for (var i = 0; i < this.sourceShape.lines.length; i++) {
            this.sourceShape.lines[i].animate({path: this.pathFromTo(to[(i) % to.length], to[(i+1) % to.length])}, 500);
        }
        this.sourceShape.points = to;
        this.checkIfDone();
    },
    checkIfDone: function() {
        var done = true;
        var sourcePos = [];//in production version remove all with //*
        for (var i = 0; i < this.targetShape.points.length; i++) {
            done &= Math.abs(this.sourceShape.points[i].x - this.targetShape.points[i].x) < 0.1;
            done &= Math.abs(this.sourceShape.points[i].y - this.targetShape.points[i].y) < 0.1;
            sourcePos.push("["+ this.roundNumber(this.sourceShape.points[i].x,4) + "," +   this.roundNumber(this.sourceShape.points[i].y,4) +"]");//*
        }
        if (!this.debugSource) {//*
            this.debugSource  = sourcePos.join(",") + ":";//*
        }
        this.debugTarget = sourcePos.join(",") + ":";//*
        this.debugMoves = ":" + (this.counter.getCount());//*
        //document.getElementById('source').innerHTML = this.debugSource + this.debugTarget + this.debugButtons + this.debugMoves;//*

        if (done) {
            //alert("succes!");
            var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&win=1";
            sendDataToInterface(q);
            after_win();
            this.setAllowedButtons(false);
            this.buttons['re'].setAllowed(false);
            this.buttons['u'].setAllowed(false);
        }
    },
    pathFromTo: function(from, to) {
        var x = SPACE * (from.x + PERIMETER /2);
        var y = SPACE * (-from.y + PERIMETER /2);
        var nextX = SPACE * (to.x + PERIMETER /2);
        var nextY = SPACE * (-to.y + PERIMETER /2);       
        return "M"+ x +","+ y +"L"+ nextX  +" "+ nextY;
    },
    toRadians: function(angle) {
        return angle * (Math.PI / 180);
    },
    roundNumber: function (number, digits) {
        if (digits === undefined) digits = 9;
        var multiple = Math.pow(10, digits);
        if(number > multiple * 10) return 'Error: too big';
        var rndedNum = Math.round(number * multiple) / multiple;
        return rndedNum;
    },
    initCounter: function(x, y, max,color) {
        max = max === undefined ? Lang.get("unbounded") : max;
        var counter = {
            max: max,
            holder: document.getElementById('counter'),
            setCount: function(count) {
                this.count = count;
                this.holder.innerHTML = Lang.get("moves") + ":<br> " + count + "/" + this.max;
            },
            increase: function() {
                this.setCount(this.getCount()+1)
            },
            decrease: function() {
                this.setCount(this.getCount()-1)
            },
            getCount: function() {
                return this.count;
            }
        }
        counter.setCount(0);
        return counter;
    }, 
    tutorLog: function(move) {
        var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&move="+move;
        sendDataToInterface(q);
        this.moveCount++;
    }
}

// getting/setting matrix html input elements, matrix multiplication
var Matrix = {
    single: [],
    cumulative: [],
    init: function(){
        for (var i = 0; i < 9; i++) {
            this.single[i] = document.getElementById('m'+i);
            this.single[i].setAttribute('autocomplete', 'off');
            this.cumulative[i] = document.getElementById('c'+i);
            this.cumulative[i].setAttribute('autocomplete', 'off');
        }
    },
    multiple: function(m1, m2) {
        var matrix = [];
        for (var i = 0; i < m1.length; i++) {
            matrix[i] = 0;
            for (var j = 0; j < 3; j++) {
            matrix[i] += m1[j + i - i%3] * m2[j*3 + i%3];
            }
        }
        return matrix
    },
    setMatrix: function(matrix, display) {
        display = typeof display !== 'undefined' ? display : "single";
        for (var i = 0; i < this[display].length; i++) {
            this[display][i].value = Transformations.roundNumber(matrix[i], 3);
            this[display][i].style.fontSize = (22 - 2 * this[display][i].value.length) + "px";
        }
    },
    getMatrix: function(which){
        var matrix= [];
        for (var i = 0; i < this[which].length; i++) {
            matrix.push(this[which][i].value);
        }
        return matrix;
    }
}

// Geometrical primitive specified by points' coordinates. Each line with specified color. Dashed if isTarget.
Raphael.fn.shape = function (points, colors, isTarget) {
    var shape = {};
    shape.lines = [];
    shape.points = [];
    for (i = 0; i < points.length; i++) {
        var from = {x: points[i].x, y: points[i].y};
        var to = {x: points[(i+1) % points.length].x, y: points[(i+1) % points.length].y};
        var line = this.path(Transformations.pathFromTo(from, to));
        line.attr({stroke: (colors[i]), "stroke-width": 5, "stroke-linecap": "round"})
        if (isTarget) {
            line.attr({"stroke-linecap": "square", "stroke-dasharray": "-", "stroke-opacity": 0.5});
        }
        shape.lines.push(line);
        shape.points.push(from);
    }
    return shape;
}

// grid point with coordinates label displayed on hover
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
            if(!$.browser.opera &&  !$.browser.msie) {
                this.toFront();
            }

          },
          function () {
            this.text.hide();
            this.center.hide();
          }
        );
}

// Grid for shapes to be shown on
Raphael.fn.grid = function (perimeter) {
    var color = '#666';
    var labelColor = '#aaa';
    for (var i = 1; i < perimeter; i++) {
        var hPath = this.path("M" + SPACE +","+ ( i*SPACE) +"l"+ (perimeter-2)*SPACE +" 0");
        var vPath = this.path("M"+ (i*SPACE) +"," +SPACE +"l0 "+ (perimeter-2)*SPACE);
        var stroke = ((i == perimeter/2) ? 4 : ((i-perimeter/2)%5 == 0 ? 1.1 : 0.5));
        var lineAttr = {"stroke": color, "stroke-width": stroke};
        hPath.attr(lineAttr);
        vPath.attr(lineAttr);
   
        for (var j = 1; j < perimeter; j++) {
            this.gridPoint(i*SPACE, j*SPACE, SPACE/2, "[" + (i - perimeter/2) + "," + (perimeter/2 - j) + "]");
        }
    }
    var xLabel = this.text(SPACE * perimeter/2,10, "y");
    var yLabel = this.text(SPACE * perimeter - SPACE/2, SPACE * perimeter/2, "x");
    xLabel.attr({"font-size": FONT_SIZE, 'fill': labelColor});
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
    getParam = function () {
        var param = this.range.from + Math.round((this.attr('cx') - this.x)/SLIDER_WIDTH * (this.range.to - this.range.from)/this.range.step)* this.range.step;
        param = Transformations.roundNumber(param, 5);
        return param;
    },
    attr = {fill: color, stroke: color, "fill-opacity": .0, "stroke-width": 3},
    slider = this.circle(x + SLIDER_WIDTH * (init - range.from)/(range.to - range.from), y + 2, 6); 
    slider.range = range;
    slider.getParam = getParam;
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

// brackets for a matrix
Raphael.fn.brackets = function (x, y, height, width, color) {
    return {
    left: this.bracket(x,y, height, color, "left"),
    right: this.bracket(x + width, y, height, color, "right")
    }
}

// one bracket for a matrix
Raphael.fn.bracket = function (x, y, height, color, side) {

    var curve = height/20;
    if (side == "right") {
        curve = -curve;
    }
    var bracket = this.path("M "+(x+curve)+","+y+" C "+(x-curve)+","+(y+height/5)+" "+(x-curve)+","+(y+height*4/5)+" "+(x+curve)+","+(y+height));
    bracket.attr({"stroke-width": 3, stroke: color});
    return bracket;
}

// transformation matrix with a button 
Raphael.fn.matrixButton = function (x, y, color, showRect) {
    if (showRect) {
        var button = this.rect(x, y, 400, 70, 2);
        button.attr({fill: color, stroke: color, "fill-opacity": .1, "stroke-width": 3});
    }
    this.brackets( 10, y + 5, 60, 100,  color);
    this.brackets(120, y + 5, 60, 40,  color);
    var textAttrs = {"font-size": 1.5*FONT_SIZE, "fill": color};
    this.text(140, 20, "x").attr(textAttrs);
    this.text(140, 50, "y").attr(textAttrs);
    this.text(180, 35, "+").attr(textAttrs);
    this.brackets(195, y + 3, 60, 50,  color);
    //return button;
}

//transformation button element
Raphael.fn.button = function (props, x, y, color) {
    var hoverIn = function() {
            button.animate({"fill-opacity": .3}, 100);
    };
    var hoverOut = function() {
            button.animate({"fill-opacity": .2}, 100);
    };    
    var onClick = function () {
        if (this.isAllowed) {
            Transformations.buttonClick(this.clickFn, this.getParam());
            button.animate({stroke: color, "fill-opacity": .8}, 100, function() {
                button.animate({stroke: color, "fill-opacity": .2}, 100);
            });
        }
    };
    var getParam = function() {
        if (!this.slider) {
            return 0;
        }
        var label = this.text.attr("text").split(' ');
        var param = label[label.length -1];
        return eval(param);

    };
    var setParam = function(param) {
        var label = this.text.attr("text").split(' ');
        label[label.length -1] = param;
        this.text.attr({text: label.join(' ')});
    };

    var button = this.rect(x, y, BUTTON_WIDTH, BUTTON_HEIGHT, 2);
    button.text = this.text(x + BUTTON_WIDTH/2, y + BUTTON_HEIGHT/3, Lang.get(props.fn)).toBack();
    button.text.attr({"font-size": FONT_SIZE, 'fill': color});
    if (props.defaultParam || props.defaultParam === 0) {
        button.text.attr({y: y +  7/24*BUTTON_HEIGHT});
        button.text.attr({'text': Lang.get(props.fn) + ' ' + props.defaultParam});
        button.slider = this.slider(x + (BUTTON_WIDTH - SLIDER_WIDTH)/2 ,y + 2/3*BUTTON_HEIGHT, props.defaultParam, color, props.range, button);
    } else {
        button.text.attr({y: y +  1/2*BUTTON_HEIGHT});
        //button.attr({height: BUTTON_HEIGHT*2/3});
    }
    button.attr({fill: color, stroke: color, "fill-opacity": .2, "stroke-width": 3, 'cursor': 'pointer'});
    button.hover(hoverIn, hoverOut);
    button.clickFn = props.fn;
    button.onClick = onClick; 
    button.getParam = getParam; 
    button.setParam = setParam;
    button.click(button.onClick);
    button.name = Lang.get(props.fn);
    button.cover = this.rect(x - 3 , y - 3 , BUTTON_WIDTH + 6, BUTTON_HEIGHT + 6);
    button.cover.attr({fill: "#333", stroke: "#333", "fill-opacity": .8, "stroke-width": 0});
    button.setAllowed = function(bool) {
        bool ? this.cover.hide() : this.cover.show();
        this.isAllowed = bool;
    }
    return button;
};

