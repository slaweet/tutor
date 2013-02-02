/*
* Author: Vít Stanislav<slaweet@mail.muni.cz> 
* Year: 2012
* compatibility: Mozilla Firefox, Opera, Google Chrome, Safari, Microsoft Internet Explorer >6
*/
(function(window, Raphael, undefined) {

var ZOOM_FACTOR = 6;
var FONT_SIZE = 20/ZOOM_FACTOR;
var PLOT_RADIUS = 20;
var PLOT_WIDTH = 2 * PLOT_RADIUS * ZOOM_FACTOR + 60;
var PLOT_HEIGHT = 2 * PLOT_RADIUS * ZOOM_FACTOR + 40;
var PLOT_PIXEL_SIZE = Raphael.svg ? 1/8 : 1/4;
var MAX_DRAW_TIME = 500; //miliseconds
var BUNDLE = {
    "en":{ 
    "assignment": "Assignment", 
    "attempt": "Current attempt", 
    "diff": "Comparison", 
    "drawbutton": "Draw",
    "solution": "Author's solution"
    },
    "cs":{ 
    "assignment": "Zadání", 
    "attempt": "Aktuální pokus", 
    "diff": "Srovnání", 
    "drawbutton": "Vykreslit", 
    "solution": "Autorské řešení"
    }
}

//main manager of the whole file
var Shapes = {
    moveCount: 0,
    plots: ["goal", "diff", "user"],
    colors: ["#aaaa00", "#00ff00", "#0081FF"],
    init: function(task) {
        for (var i in BUNDLE) {
            Lang.setBundle(i, BUNDLE[i]);
        }
        if (task.indexOf("<") == -1 && task.indexOf(">") == -1) {
            task = base64_decode(task);
        }
        var taskArray = task.split(";");
        document.getElementById('text').value = taskArray[1] ? taskArray[1] : "";
        //document.getElementById('text').setAttribute('autocomplete', 'off');
        this.setLabels();
        for (var i = 0; i < this.plots.length; i++) {
            var p = this.plots[i];
            document.getElementById(p).innerHTML = "";
            var paper = Raphael(p, PLOT_WIDTH, PLOT_HEIGHT);
            paper.setViewBox(-PLOT_WIDTH/(2*ZOOM_FACTOR), -PLOT_HEIGHT/(2*ZOOM_FACTOR) -2, PLOT_WIDTH/ZOOM_FACTOR, PLOT_HEIGHT/ZOOM_FACTOR,true);
            this[p] = this.makePlot(paper, this.colors[i]);
            this[p].grid = this[p].paper.grid(PLOT_RADIUS);
        }

        this.diffuser = this.makePlot(this.diff.paper, this.user.color);
        this.diffgoal = this.makePlot(this.diff.paper, this.goal.color);
        
        this.goal.rawExpr = taskArray[0];
        this.goal.expr = this.preprocess(taskArray[0]);
        this.goal.draw(this.goal.expr);

    },
    setLabels: function() {
        document.getElementById('goallabel').innerHTML = Lang.get("assignment") + ":";
        document.getElementById('userlabel').innerHTML = Lang.get("attempt") + ":";
        document.getElementById('difflabel').innerHTML = Lang.get("diff") + ":";
        document.getElementById('drawbutton').value = Lang.get("drawbutton");
    },
    makePlot: function(paper, color) {
        plot = {
            paper: paper,
            color: color,
            shape: {points: []},
            draw: function(expr) {
        var done = false;
        while (!done) {
            try {

                for (var i = 0; i < this.shape.points.length; i++) {
                    this.shape.points[i].remove();
                }
                this.shape = this.paper.shape(PLOT_RADIUS, expr, this.color, PLOT_PIXEL_SIZE);
                done = true;
            } catch (e) {
                PLOT_PIXEL_SIZE *= 2;
                if(PLOT_PIXEL_SIZE>100) {
                    alert("problem");
                    done = true;
                }
            }
            }

        }

        }; 
        return plot;
    },
    preprocess: function(expr) {
        expr = expr.replace(/([^=<>])=([^=])/g,"$1==$2")
        expr = expr.replace(/([<>])([^=])/g,"$1=$2")
        expr = expr.replace(/and/g, "&&");
        expr = expr.replace(/or/g, "||");
        expr = expr.replace(/not/g, "!");
        expr = mathjs(expr);
        expr = expr.replace(/pi/g, "PI");
        expr = expr.replace(/e/g, "E");
        expr = expr.replace(/(abs|sin|cos|PI|E|log|pow|sqrt|min|max)/g, "Math.$1");
        //expr = expr.replace(/(0-9)([xy])/g, "$1*$2");
        //expr = expr.replace(/([xy0-9(][xy0-9)(/+\-.]*)\^([0-9])/g, "Math.pow($1,$2)");
        //.replace(/(x)==(y|\d+)/,"round($1)==round($2)");
        return expr;
    },
    isValid: function(expr, rawExpr) {
        if (expr.indexOf("Error:") != -1) {
            return mathjs(rawExpr);
        }
        try {
            getExpressionEvaluator(expr)(1,1);
            return "";
        } catch (e) {
            return "Error: " + e.message;
        }
    },
    drawUserInput: function(rawExpr) {
        this.tutorLog(rawExpr);
        var expr = this.preprocess(rawExpr);
        var error = this.isValid(expr, rawExpr);
        if (error == "") {
            this.draw(expr, this.goal.expr);
            this.checkIfDone();
        } else {
            this.draw("false", "false");
        }
        document.getElementById('error').innerHTML = error;
        //document.getElementById('source').innerHTML = expr;
    },
    draw: function(expr, goalExpr) {
        this.diff.draw("(" + expr + ") && (" + goalExpr + ")");
        this.diffuser.draw("(" + expr + ") && !(" + goalExpr + ")");
        this.diffgoal.draw("!(" + expr + ") && (" + goalExpr + ")");
        this.user.draw(expr)
    },
    checkIfDone: function() {
        var maxSuccessArea = 0.005;
        var done = this.diffgoal.shape.relativeArea + this.diffuser.shape.relativeArea < maxSuccessArea;
        
        if (done) {
            $("#solution").text(Lang.get('solution') + ": " + this.goal.rawExpr);
            //alert("succes!");
            var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&win=1";
            sendDataToInterface(q);
            after_win();
            this.drawUserInput = function(){};
        }
    },
    tutorLog: function(move) {
        var moveString = move.replace('+','%2B');
        var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&move="+moveString;
        sendDataToInterface(q);
        this.moveCount++;
    }
}

$.fn.charCounter = function() {
    var MAX_CHAR_COUNT = 80;
    var input = $(this);
    input.bind("propertychange keyup input paste", function(event){
        $('#charcounter').text(input.val().length + "/" + MAX_CHAR_COUNT);
    });
    input.keyup();
}

var getExpressionEvaluator = function(expession) {
    return new Function('x', 'y', 'return ' + expession);
}

// Draws shape specified by expession in expr parameter
Raphael.fn.shape = function (radius, expr, color, step) {
    var startTime = (new Date()).getTime();
    var shape = {points: []}
    var pointsCount = 0;
    var evaluator = getExpressionEvaluator(expr);
    for (var y = -radius; y <= radius; y += step) {
        for (var x = -radius; x <= radius; x += step) {
            var width = 0;
            while (evaluator(x+width, y) && x+width <= radius) {
                width += step;
                pointsCount++;
            }
            if (width > 0) {
                var line = this.rect(x - step/2, -y - step/2, width, step);
                line.attr({"stroke": "", "stroke-width": 0, fill: color});
                shape.points.push(line);
                x += width;
            }
        }
        if ((new Date()).getTime() - startTime > MAX_DRAW_TIME) {
            for (var i = 0; i < shape.points.length; i++) {
                shape.points[i].remove();
            }
            throw "draw time limit exeded";
        }
    }
    shape.relativeArea = pointsCount / Math.pow(2*radius/step, 2);
    return shape;
}

// A point of grid with coordinates label, displayed when hover
Raphael.fn.gridPoint = function (x, y, r) {
    var hoverIn = function () {
        this.text.show();
        this.text.toFront();
        this.center.show();
        this.center.toFront();
        if(!$.browser.opera &&  !$.browser.msie) {
            this.toFront();
        }
    };
    var hoverOut = function () {
        this.text.hide();
        this.center.hide();
    };
    var circle = this.circle(x, y, r);
    circle.center = this.circle(x, y, r/10).toBack();
    circle.text = this.text(x, y -FONT_SIZE, "[" +x + "," + (-y) + "]");
    circle.attr({"stroke": "none", fill: "#000", "fill-opacity": 0 });
    circle.center.attr({"stroke": "#ccc", "fill": "#ccc"});
    circle.text.attr({"font-size": 0.7*FONT_SIZE, "fill": "#ccc"});
    circle.text.hide();
    circle.center.hide();
    circle.hover(hoverIn, hoverOut);
    return circle;
}

// Grid for shapes to be shown on
Raphael.fn.grid = function (radius) {
    var pointInterval = 5;
    var color = '#666';
    var labelColor = '#aaa';
    for (var i = -radius; i <= radius; i++) {
        var hPath = this.path("M" + (-radius) +","+  i +"l"+ (radius*2) +" 0");
        var vPath = this.path("M"+ i +"," +(-radius) +"l0 "+ (radius*2));
        var stroke = ((i == 0) ? 4 : ((i)%5 == 0 ? 1.1 : 0.5));
        var lineAttr = {"stroke": color, "stroke-width": stroke};
        hPath.attr(lineAttr);
        vPath.attr(lineAttr);
        if (i % pointInterval == 0) {
            for (var j = -radius; j <= radius; j += pointInterval) {
                this.gridPoint(i, j, pointInterval/2);
            }
        }
    }
    var xLabel = this.text(0,-radius -FONT_SIZE/2, "y");
    var yLabel = this.text(radius + FONT_SIZE/2, 0, "x");
    var labelAttr = {"font-size": FONT_SIZE, 'fill': labelColor}
    xLabel.attr(labelAttr);
    yLabel.attr(labelAttr);
}

function base64_decode (data) {
    // Decodes string using MIME base64 algorithm  
    // 
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/base64_decode
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Thunder.m
    // +      input by: Aman Gupta
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Pellentesque Malesuada
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: utf8_decode
    // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
    // *     returns 1: 'Kevin van Zonneveld'
    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof this.window['btoa'] == 'function') {
    //    return btoa(data);
    //}
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        dec = "",
        tmp_arr = [];
 
    if (!data) {
        return data;
    }
 
    data += '';
 
    do { // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(data.charAt(i++));
        h2 = b64.indexOf(data.charAt(i++));
        h3 = b64.indexOf(data.charAt(i++));
        h4 = b64.indexOf(data.charAt(i++));
 
        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
 
        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;
 
        if (h3 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1);
        } else if (h4 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1, o2);
        } else {
            tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
        }
    } while (i < data.length);
 
    dec = tmp_arr.join('');
    dec = utf8_decode(dec);
 
    return dec;
}
function utf8_decode (str_data) {
    // Converts a UTF-8 encoded string to ISO-8859-1  
    // 
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/utf8_decode
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +      input by: Aman Gupta
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Norman "zEh" Fuchs
    // +   bugfixed by: hitwork
    // +   bugfixed by: Onno Marsman
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: utf8_decode('Kevin van Zonneveld');
    // *     returns 1: 'Kevin van Zonneveld'
    var tmp_arr = [],
        i = 0,
        ac = 0,
        c1 = 0,
        c2 = 0,
        c3 = 0;
 
    str_data += '';
 
    while (i < str_data.length) {
        c1 = str_data.charCodeAt(i);
        if (c1 < 128) {
            tmp_arr[ac++] = String.fromCharCode(c1);
            i++;
        } else if (c1 > 191 && c1 < 224) {
            c2 = str_data.charCodeAt(i + 1);
            tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = str_data.charCodeAt(i + 1);
            c3 = str_data.charCodeAt(i + 2);
            tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
 
    return tmp_arr.join('');
}

window.initShapes = function (task) {
    Shapes.init(task);
    $("#expression").submit(function(){ 
       try{
           Shapes.drawUserInput($("#text").val());
       }catch(e){
           alert(e)
       };
       return false;
    });

    $("#text").charCounter();
}

})(window, Raphael);
