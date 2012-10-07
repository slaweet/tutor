$(document).ready(function(){
    module("Automata");

    test("addState", function() {

       
    })

    test("translateX", function() {
        var trX = 2;
        t.buttonClick("translateX", trX);

        for (var i = 0; i < t.sourceShape.points.length; i++) {
            equal(t.sourceShape.points[i].x, xs[i] + trX, "points x " + i);
            equal(t.sourceShape.points[i].y, ys[i], "points y " + i);
        }
    })

    test("undo", function() {
        t.buttonClick("undo");

        for (var i = 0; i < t.sourceShape.points.length; i++) {
            equal(t.sourceShape.points[i].x, xs[i], "points x " + i);
            equal(t.sourceShape.points[i].y, ys[i], "points y " + i);
        }
    })

    test("mirrorY", function() {
        var miY = 0;
        t.buttonClick("mirrorY", miY);

        for (var i = 0; i < t.sourceShape.points.length; i++) {
            equal(t.sourceShape.points[i].x, xs[i], "points x " + i);
            equal(t.sourceShape.points[i].y, -ys[i], "points y " + i);
        }
    })
});

