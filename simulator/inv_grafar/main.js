/**
 * Created with IntelliJ IDEA.
 * User: jirka
 * Date: 8/10/12
 * Time: 12:25 PM
 * To change this template use File | Settings | File Templates.
 */

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
    var colors = [window.KhanUtil.BLUE,window.KhanUtil.GREEN,window.KhanUtil.PINK,window.KhanUtil.YELLOW];
    my = my || {};
    var that = {};

    my.tutor = spec.tutor;
    my.graph = graphObj(spec.context);
    my.graph.initialize();

    my.functions = [];
    my.solved = [];

    for (var index in spec.problem.plan) {
        if (!spec.problem.plan.hasOwnProperty(index)) {
            continue;
        }
        var f = spec.problem.plan[index];
        f.spec.color = colors[index % colors.length]
        f.spec.fpoints = f.spec.fpoints || [[0, 0], [2, 1]];
        var fob = funcObject(f.spec);

        var i = my.functions.push(fob);
        my.solved.push(false);
        i -= 1;

        var color = f.spec.color;
        $("#rovnice").append("<div id=\"rce_" + i + "\" style=\"margin-top: 7px; margin-bottom: 3px; color:" + color + "\"><code>" + f.eqn + "</code> "+getSelect(i, f.spec.type)+"</div>");

        //capture current value of i and color
        (function(i, c) {
        fob.notify = function(solved) {
            if (my.solved[i] !== solved) {
                my.solved[i] = solved;
                console.log(my.solved);
                if (solved) {
                    $("#rce_"+i).css('color', "#999999");
                    my.functions[i].color = "#999999";
                } else {
                    $("#rce_"+i).css('color', c);
                    my.functions[i].color = spec.problem.plan[i].spec.color || KhanUtil.BLUE;
                }
                my.graph.redrawFunc(my.functions[i]);
            }
        };}(i, color));

        my.graph.addFunc(fob);
    }
    jQuery("code").tmpl();

    $(".rce-select").change(function(){
        var id = $(this).attr("id").replace("select-", "");
        var type = $(this).val();
        my.functions[id].setType(type);
        my.graph.redrawFunc(my.functions[id]);
    });

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
        my.tutor.sendMove(move.move_desc, move.winning);
        if (move.winning) {
            my.grafar.freeze();
            tutor.showWin();
        }
    };
    return that;
};

var getSelect = function(id, type) {
    if (type) {
        return ""
    }
    var options = ["Line", "Parabola", "Circle", "Sinus"]//, "Tangens"];
    var select = "<select id='select-"+id+"' class='rce-select'>"
    for (var i = 0; i < options.length; i++) {
        select += "<option value='"+options[i]+"' "+(type==options[i] ? "selected='selected'" : "")+">"+options[i]+"</option>"; 
    }
    select += "</select>"
    return select;
}
