$(document).ready(function(){
    module("Transformations");
        var t = Transformations;
        var task = "[1,2],[1,5],[7,5]:[-7,-3],[-7,0],[-1,0]:ty,tx,rx,ry,m";
        location.hash = task;

        t.init(task);
        var xs = [1,1,7];
        var ys = [2,5,5];

    test("init", function() {

        for (var i = 0; i < t.sourceShape.points.length; i++) {
            equal(t.sourceShape.points[i].x, xs[i], "points x " + i);
            equal(t.sourceShape.points[i].y, ys[i], "points y " + i);
        }
        
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

