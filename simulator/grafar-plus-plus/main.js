/**
 * Created with IntelliJ IDEA.
 * User: jirka
 * Date: 8/10/12
 * Time: 12:25 PM
 * To change this template use File | Settings | File Templates.
 */
(function(window, undefined) {

var BUNDLE = {
    "cs":{ 
    "not a number" :  "souřadnice není číslo!", 
    "error" : "Chyba",
    "empty input" : "Prázdný vstup",
    "invalid format" : "Neplatný formát."
    },
    "en":{ 
    "not a number" :  "coordinate is not a number!", 
    "error" : "Error",
    "empty input" : "Empty input",
    "invalid format" : "Invalid format."
    }
}

var tutor = function (spec, my) {
    'use strict';
    var my = my || {};
    my.move_count = 0;
    my.generic_query = "session_id="+spec.session_id+"&session_hash="+spec.session_hash;

    var that = {};
    that.sendMove = function (move_desc, winning) {
        var q;
        var move_query = my.generic_query + "&move_number="+my.move_count;
        q = move_query + "&move="+move_desc;
        sendDataToInterface(q);

        if (winning) {
            q = move_query + "&win=1";
            sendDataToInterface(q);
        }
        my.move_count += 1;
    };
    that.showWin = function () {
        after_win();
    };
    return that;
};

var invGrafar = function (spec, my) {
    'use strict';
    
    for (var i in BUNDLE) {
        Lang.setBundle(i, BUNDLE[i]);
    }
    my = my || {};
    my.colors = [KhanUtil.BLUE, KhanUtil.GREEN, KhanUtil.PINK, KhanUtil.YELLOW];
    my.letters = ['f','g','h','i'];
    var that = {};

    if (spec.problem.plan.indexOf('"') == -1) {
        spec.problem.plan = base64_decode(spec.problem.plan);
    }
    var JSON = JSON || {decode: function(json) {return eval("(" + json + ")")}};
    spec.problem.plan = JSON.decode(spec.problem.plan);
    my.props = spec.problem.plan[0].eqn ? {} : spec.problem.plan.shift();

    my.tutor = spec.tutor;
    my.graph = graphObj(spec.context, my.props);
    my.graph.initialize();
    that.graph = my.graph;

    my.functions = [];
    my.solved = [];

    for (var i = 0; i < spec.problem.plan.length; i++) {
        var f = spec.problem.plan[i];
        f.color = my.colors[i % my.colors.length];

        var fob = addFunction(f);

        my.graph.addFunc(fob);
        my.functions.push(fob);
        my.solved.push(false);
    }
    jQuery("code").tmpl();

    function addFunction (f) {
        var i = my.functions.length;
        var fce = (f.eqn.indexOf("=") == -1 ? my.letters[i] + "(x) = " : f.eqn.substr(0, f.eqn.indexOf("=")+1));
        f.eqn = f.eqn.substr(f.eqn.indexOf("=")+1);
        var input = ""; 
        var inputEnterFunction;
        var className = "";
        if (f.solpoints) {
            var x = i * 1 || 0;
            var y = i * 2 || 0;
            f.fpoints = f.fpoints || [[0 + x, 0 - y], [2 + x, 2 - y]];
            fce += f.eqn;
            input = getSelect(i, f.type);
        } else if (f.type == "Point") {
            f.soltype = f.type;
            f.fpoints = f.fpoints || [[5, 5]];
            f.setCoords = function(p) {
                $("#rce_" + i + " .coords").text("[" + p[0] + "," + p[1] + "]");
            };
            fce += f.eqn;
            className = "coords";
        } else if (f.type == "PointInput") {
            f.soltype = f.type;
            f.fpoints = f.fpoints || [];
            input = "[<input type='text' value='5'/>,<input type='text' value='5'/>]</td><td class='error'>";
            fce += f.eqn;
            f.constrains = [function(p){return false;}];
            className = "coords";
            inputEnterFunction = function (e) {
              if (e.which == 13) {
                var i = $(this).parents("tr").attr("id").replace("rce_", "");
                var func = my.functions[i];
                var pointCoord = function (elem, index) {
                    var input = $(elem).parent().children("input:nth-child("+index+")");
                    var val = input.val();
                    var coord = parseFloat(val);
                    return coord;
                }
                func.point = [pointCoord(this, 1), pointCoord(this, 2)];
                var error = '';
                for (var i = 0; i < func.point.length; i++) {
                    if (isNaN(func.point[i])) {
                        error = Lang.get("error") + ": " + (i + 1) + ". " +Lang.get("not a number");
                   }
                };
                $("#rce_"+i+ " .error").html(error);
                if (error == "") {
                    my.graph.redrawFunc(func);
                    func.notify(func.checkSolved());
                }
              }
            };
        } else if (f.type == "Draw") {
            fce += f.eqn;
            f.fpoints = getDrawPoints(f.init || "0.01x^3", f.range || [11,11]);
            f.soltype = f.type;
        } else {
            f.type = "Generic";
            f.soltype = f.type;
            f.fpoints = [];
            input = "<input type='text' value='"+(f.init||"")+"'/></td><td class='error'>";
            inputEnterFunction = function (e) {
              if (e.which == 13) {
                var i = $(this).parents("tr").attr("id").replace("rce_", "");
                var func = my.functions[i];
                func.eqn = $(this).val();
                var error = funcError((func.eqn));
                $("#rce_"+i+ " .error").html(error);
                my.graph.redrawFunc(func);
                func.notify(func.checkSolved());
              }
            };
        }
        $("#rovnice").append("<tr id=\"rce_" + i + "\"><td><code>"+ fce  + "</code></td><td class='"+ className + "'> "+input+"</td></tr>");
        $("#rce_"+i+ " input").keypress(inputEnterFunction);
        var fob = funcObject(f);
        $("#rce_" + i + ", #rce_" + i + " input" + ", #rce_" + i + " select").css({color: f.color});
        
        fob.notify = function(solved) {
            if (my.solved[i] !== solved) {
                my.solved[i] = solved;
                //console.log(my.solved);
                if (solved) {
                    $("#rce_"+i+ ", #rce_" + i + " input" + ", #rce_" + i + " select").css('color', "#999999");
                    my.functions[i].color = "#999999";
                } else {
                    $("#rce_"+i+ ", #rce_" + i + " input" + ", #rce_" + i + " select").css('color', f.color);
                    my.functions[i].color = spec.problem.plan[i].color || KhanUtil.BLUE;
                }
                my.graph.redrawFunc(my.functions[i]);
            }
            var move = {
                desc : toLogString(my.functions),
                winning : (my.solved.filter(function(x){return !x}).length == 0) 
            }
            that.reportMove(move);
        };
        return fob;
    }

    $(".rce-select").change(function(){
        var id = $(this).attr("id").replace("select-", "");
        var type = $(this).val();
        my.functions[id].setType(type);
        my.graph.redrawFunc(my.functions[id]);
    });

    $("#rce_0 input").focus();

    /** @type string */
    my.name = spec.problem.name || "";



//        for (var d in spec.problem.plan) {
//            var el = d.func(d.params);
//            my.dynamic.push(el);
//            my.formulas.push(d.formula);
//        }
//        my.tutor = spec.tutor;
//        my.grafar =

    that.start = function () {

    };
    /**
     *
     * //@param move
     */
    that.reportMove = function (move) {
        // TODO: až to pustí, nevolat při posouvání
        my.tutor.sendMove(move.desc, move.winning);
        if (move.winning) {
            //my.grafar.freeze();
            my.tutor.showWin();
        }
    };
    return that;
};

var toLogString = function(funcs) {
    var log = funcs.map(function (f) {
        return f.getLogString();
    });
    JSON.stringify = JSON.stringify || JSON.encode;
    log = JSON.stringify(log); 
    log = encodeURIComponent(log);
    return log;
    
}

var funcError = function(func) {
    var func = preprocess(func);
    var x = 10;
    if (func.trim().length == 0) {
        return Lang.get("empty input");
    }
    try {
        var val = eval(func);
        console.log(val);
    } catch(e) {
        return Lang.get("invalid format");// (Chyba: " + e.message + ")";
    }
    if(!isFinite(val)) {
        return Lang.get("invalid format");
    }
    return "";
}

var getDrawPoints = function(eqn, range) {
    var points = [];
    var fn = getEvalFunc(eqn);
    var step = 0.1;
    for (var x = -range[0]; x <= range[0]; x+= step) {
        var point = [ x, fn(x)]
        if (point[1] > -range[1] && point[1] < range[1]) {
            points.push(point);
        }
    };
    points = myRDP(points, 10);
    return points;
}

var myRDP = function(points, requiredLength) {
    var epsilon = 0.1;
    while (points.length > requiredLength) {
        points = properRDP(points, epsilon);
        epsilon = 1.1 * epsilon;
        console.log(epsilon, points.length);
    }
    return points;
}

var getSelect = function(id, type) {
    if (type) {
        return ""
    }
    var options = ["Line", "Absolute", "Parabola"];//, "Sinus", "Tangens"];
    var select = "<select id='select-"+id+"' class='rce-select'>"
    for (var i = 0; i < options.length; i++) {
        select += "<option value='"+options[i]+"' "+(type==options[i] ? "selected='selected'" : "")+">"+options[i]+"</option>"; 
    }
    select += "</select>"
    return select;
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

window.tutor = tutor;
window.invGrafar = invGrafar;

// parse old grapher instances from tutor export .txt file opened in browser
// http://tutor.fi.muni.cz/old/include/a_data_file_instances.php?problem_id=17
// var i = 1;document.activeElement.innerHTML.match(/plot(.*);/g).map(function(el){return el.replace('plot(',"Puvodni "+(i)+"\nOld "+(i++)+"\n90\n[{eqn:").replace(');',"}]\n")}).join("\n")
})(window);
