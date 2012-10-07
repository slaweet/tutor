var graphObj = function (khanutil) {
    'use strict';

    var g = khanutil.currentGraph;
    var snapXc = 0.5;
    var snapYc = 0.5;

    var that = {
        functions : [],
        points : [],
        initialize : function () {
            g.graphInit({
                range: 11,
                scale: 20,
                axisArrows: "&lt;-&gt;",
                tickStep: 1,
                labelStep: 1,
                gridOpacity: 0.05,
                axisOpacity: 0.2,
                tickOpacity: 0.4,
                labelOpacity: 0.5
            });

            g.label( [ 0, -11 ], "y", "below" );
            g.label( [ 11, 0 ], "x", "right" );

            khanutil.addMouseLayer();
        },
        addPoint : function (fpoint, color, update, func) {
            'use strict';
            var gp = khanutil.addMovablePoint({
                coord : fpoint,
                snapX: snapXc,
                snapY: snapYc,
                normalStyle: {
                    stroke: color,
                    fill: color
                }
            });
            gp.onMove = function(x, y) {
                'use strict';
                var i;
                var free = true;
                for (i=0; i<that.points.length; i++) {
                    if (x === that.points[i].coord[0] && y == that.points[i].coord[1]) {
                        free = false;
                    }
                }
                if (free && update([x, y], false)) {
                    gp.setCoord([ x, y ]);
                    func.redraw(g);
                    return true;
                } else {
                    return false;
                }
            };
            gp.onMoveEnd = function (x, y) {
                return update([x, y], true);
            };
            that.points.push(gp);
        },
        addPoints : function (points, color, update, func) {
            'use strict';
            var i;
            for (i=0; i<points.length; i++) {
                that.addPoint(points[i], color, update(i), func);
            }
        },
        addFunc : function (func) {
            'use strict';
            that.functions.push(func);
            that.addPoints(func.getPoints(), func.color || window.KhanUtil.BLUE, func.update, func);
            func.redraw(g);
        },
        redrawFunc : function (func) {
            func.redraw(g);
        }

    };
    return that;
};

var approxzero = 0.00001;

/**
 * (a b)
 * (c d)
 */
var det2 = function (a, b, c, d) {
    return a*d - b*c;
};

/**
 *    +---------------+
 * [x1, y1]       [x2, y2]
 *
 *               +----------+
 *           [x3, y3]    [x4, y4]
 */
var compare_linear = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    var fp = det2(x2 - x1, y2 - y1, x3 - x1, y3 - y1);
    var sp = det2(x2 - x1, y2 - y1, x4 - x1, y4 - y1);
    return Math.abs(fp) < approxzero && Math.abs(sp) < approxzero;
};

var compare_circle = function (sx1, sy1, r1, sx2, sy2, r2) {
    return Math.abs(sx1 - sx2) < approxzero && Math.abs(sy1 - sy2) < approxzero && Math.abs(r1 - r2) < approxzero;
};

var funcObject = function (spec) {
    'use strict';
    var that = {
        color : spec.color || KhanUtil.BLUE,
        fpoints : spec.fpoints || [[0, 0], [2, 1]],
        constrains : [],
        type : spec.type || "Line",
        gobject : undefined,
        addConstrain : function (constrain) {
            that.constrains.push(constrain);
        },
        agreesWithConstrains : function () {
            var agrees = true;
            var i;
            for (i=0; i<that.constrains.length; i++) {
                agrees = agrees && that.constrains[i](that.fpoints);
            }
            return agrees;
        },

        notify : spec.notify || function(solved){},

        update : function (index) {
            return function (nfpoint, finished) {
                var ofpoint = that.fpoints[index];
                that.fpoints[index] = nfpoint;
                if (that.agreesWithConstrains()) {
                    if(finished) {
                        // notify about the change, after the change is fully processed
                        window.setTimeout(that.notify(that.checkSolved()),0);
                    }
                    return true;
                } else {
                    that.fpoints[index] = ofpoint;
                    return false;
                }
            }
        },
        getPoints : function () {
            return that.fpoints;
        },
        setType : function (type) {
            if (that["redraw" + type]) {
                that.type = type;
            }
            window.setTimeout(that.notify(that.checkSolved()),0);
        },
        redraw : function (graph) {
            if (that["redraw"+ that.type]) {
                that["redraw"+ that.type](graph);
            }
        },
        checkSolved : function () {
            if (that.type != spec.soltype) {
                return false;
            }
            if (that["checkSolved"+ that.type]) {
                return that["checkSolved"+ that.type]();
            }
        },
        redrawLine : function (graph) {
            'use strict';
            var x1 = that.fpoints[0][0];
            var y1 = that.fpoints[0][1];
            var x2 = that.fpoints[1][0];
            var y2 = that.fpoints[1][1];
            var wx = graph.range[0][1];
            var wy = graph.range[1][1];
            if (that.gobject !== undefined) {
                that.gobject.remove();
            }

            graph.style({ stroke: that.color, strokeWidth: 2}, function () {
                'use strict';
                if (Math.abs(x2 - x1) > 0.001) {
                    var slope = ( y2 - y1 ) / ( x2 - x1 );
                    var yint = slope * ( 0 - x1 ) + y1;
                    that.gobject = graph.line([ -wx - 1, (-wx - 1) * slope + yint ], [ wx + 1, (wx + 1) * slope + yint ]).toBack();
                } else {
                    that.gobject = graph.line([x1, -wy - 1], [ x1, wy + 1 ]).toBack();
                }
            });
        },
        checkSolvedLine : function () {
            var x1 = that.fpoints[0][0];
            var y1 = that.fpoints[0][1];
            var x2 = that.fpoints[1][0];
            var y2 = that.fpoints[1][1];
            var x3 = spec.solpoints[0][0];
            var y3 = spec.solpoints[0][1];
            var x4 = spec.solpoints[1][0];
            var y4 = spec.solpoints[1][1];
            var solved = compare_linear(x1, y1, x2, y2, x3, y3, x4, y4);
            return solved;
        },
        redrawParabola : function (graph) {
            'use strict';
            if (that.gobject !== undefined) {
                that.gobject.remove();
            }
            graph.style({ stroke: that.color, strokeWidth: 2}, function() {
                var x1 = that.fpoints[0][0];
                var y1 = that.fpoints[0][1];
                var x2 = that.fpoints[1][0];
                var y2 = that.fpoints[1][1];
                var x3 = x1 + (x1 - x2)
                var y3 = y2;

                var wx = graph.range[0][1];
                var wy = graph.range[1][1];

                that.gobject = graph.plot(function (x) {
                    // Lagrangeovy polynomy
                    var l1 = ( (x - x2) * (x - x3) ) / ( (x1 - x2) * (x1 - x3) );
                    var l2 = ( (x - x1) * (x - x3) ) / ( (x2 - x1) * (x2 - x3) );
                    var l3 = ( (x - x1) * (x - x2) ) / ( (x3 - x1) * (x3 - x2) );
                    return y1 * l1 + y2 * l2 + y3 * l3;
                }, [-wx, wx]);
            });
        },
        checkSolvedParabola : function () {
            var x1 = that.fpoints[0][0];
            var y1 = that.fpoints[0][1];
            var x2 = that.fpoints[1][0];
            var y2 = that.fpoints[1][1];
            var x3 = x1 + (x1 - x2)
            var y3 = y2;


            var x1p2 = Math.pow(x1,2);
            var x2p2 = Math.pow(x2,2);
            var x3p2 = Math.pow(x3,2);

            var denomin = ((x2-x1)*x3p2+(-x2p2+x1p2)*x3+x1*x2p2-x1p2*x2)
            var xpow2 = ((x2-x1)*y3+(-x3+x1)*y2+(x3-x2)*y1) / denomin;
            var xpow1 = ((-x2p2+x1p2)*y3+(x3p2-x1p2)*y2+(-x3p2+x2p2)*y1) / denomin;
            var xpow0 = ((x1*x2p2-x1p2*x2)*y3) / denomin + ((-x1*x3p2+x1p2*x3)*y2) / denomin +
                ((x2*x3p2-x2p2*x3)*y1) / denomin;


            console.log(denomin);
            console.log(xpow2);
            console.log(xpow1);
            console.log(xpow0);

            return spec.solpoints[2] &&
                Math.abs(xpow2 - spec.solpoints[0]) < approxzero &&
                Math.abs(xpow1 - spec.solpoints[1]) < approxzero &&
                Math.abs(xpow0 - spec.solpoints[2]) < approxzero;
        },
        redrawCircle : function (graph) {
            'use strict';
            if (that.gobject !== undefined) {
                that.gobject.remove();
            }
            graph.style({ stroke: spec.color, strokeWidth: 2}, function() {
                var x = that.fpoints[0][0];
                var y = that.fpoints[0][1];
                var r = dist(that.fpoints[0], that.fpoints[1]);
                that.gobject = graph.circle([x, y], r, { "fill-opacity": 0 });
            });
        },
        checkSolvedCircle : function () {
        },
        redrawSinus : function (graph) {
            that.func = sinFunc;
            that.redrawGonio(graph);
        },
        redrawTangens : function (graph) {
            that.func = tanFunc;
            that.redrawGonio(graph);
        },
        redrawGonio : function (graph) {
            'use strict';
            if (that.gobject !== undefined) {
                that.gobject.remove();
            }
            var wx = graph.range[0][1];
            var wy = graph.range[1][1];
            graph.style({ stroke: that.color, strokeWidth: 2}, function() {
                //that.gobject = graph.plot(function (x) {return x;}, [-wx, wx]);
                that.gobject = graph.plot(that.func(that.fpoints), [-wx, wx]);
            });
        },
        checkSolvedGonio : function () {
        },
    };

    that.addConstrain(function (fpoints) {
        var x1 = fpoints[0][0];
        var x2 = fpoints[1][0];
        return x1 != x2;
    });

    return that;
};


var dist = function (point1, point2) {
    'use strict';
    var dx = point1[0] - point2[0];
    var dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
};


// y = a * sin(b(x + c)) + d ?
var sinFunc = function (fpoints) {
    var k = 1;
    var c = -fpoints[0][0];
    var d = fpoints[0][1];
    var a = fpoints[1][1] - d;
    var s = (fpoints[0][0] < fpoints[1][0]) ? 1 : 0;
    var b = ((k+1)*s+k*3) * Math.PI / (2 * dist([-c, 0], [fpoints[1][0], 0]));
    return function (x) { return a * Math.sin(b*(x + c)) + d; };
};

// y = a * tg(b*(x + c)) + d
var tanFunc = function (fpoints) {
    var k = 1;
    var c = -fpoints[0][0];
    var d = fpoints[0][1];
    var a = fpoints[1][1] - d;
    var b = (s+k*4) * Math.PI / (2 * dist([-c, 0], [fpoints[1][0], 0]));
    return function (x) { return a * Math.tan(b*(x + c)) + d; };
};

