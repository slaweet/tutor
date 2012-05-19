/* 
 * puvodni verze Martin Korbel, 2010
 * pro Tutora zhackoval Radek Pelanek, 2011
 */


function Turtle (canvasElement, pencolor, canvasElementArrow) {

    // canvas element (jQuery)
    this.canvasElement = null;    
    this.canvas = null;
    this.canvasArrow = null;
    this.pencolor = "#000000";
    this.extraArrowCanvas = false;
    // position of zero point
    this.x0 = 0;
    this.y0 = 0;
    // actual position
    this.x = 0;
    this.y = 0;
    // angle of rotate
    this.angle = 0;
    // pen is down
    this.pen = true;
    // turtle is visible
    this.visible = true;
    // Radek: vypis pro kontrolu 
    this.lineshash = new Object();
    this.point_succs = new Object();

    // Draw turtle
    this.draw = function() {
        if (!this.visible) {
            return false;
        }
        // size of turtle
        var size = 15;
        // helper variables
        var k2 = size*2/3;
        var k1 = size/3;
        // convert to radian
        var rad = this.angle * Math.PI / 180;
        // rotate turtle on zero point
        var A = Vector.rotate(0, -3*k2/2, rad);
        var B = Vector.rotate(k2, k1, rad);
        var C = Vector.rotate(-k2, k1, rad);        

        if(this.extraArrowCanvas) {
            this.canvasArrow.canvas.width = this.canvasArrow.canvas.width;
            this.canvasArrow.translate(this.x0, this.y0);
        }
        this.canvasArrow.save();
        this.canvasArrow.strokeStyle = "#339933";
        this.canvasArrow.lineWidth = 2;
        this.canvasArrow.beginPath();
        // move turtle to this.x and this.y position
        this.canvasArrow.moveTo(this.x+A.x, this.y+A.y);
        this.canvasArrow.lineTo(this.x+B.x, this.y+B.y);
        this.canvasArrow.lineTo(this.x+C.x, this.y+C.y);
        this.canvasArrow.closePath();
        this.canvasArrow.stroke();
        this.canvasArrow.restore();
    }    

    this.right = function(angle) {
        this.angle = (this.angle + angle) % 360;
    }
    
    this.left = function(angle) {
        this.right(-1*angle);
    }

    this.forward = function(step) {     
        var rad = this.angle * Math.PI / 180;
        var ox = this.x;
        var oy = this.y;
        this.x = this.x + step * Math.sin(rad);
        this.y = this.y - step * Math.cos(rad);
        if(this.pen == true) {
	    this.canvas.strokeStyle = this.pencolor; // "#993333";
            this.canvas.beginPath();
            this.canvas.moveTo(ox, oy);
            this.canvas.lineTo(this.x, this.y);
            this.canvas.closePath();
            this.canvas.stroke();
	    var p1 = Math.round(10*ox) + "," + Math.round(10*oy);
	    var p2 = Math.round(10*this.x) + "," + Math.round(10*this.y);
	    if (this.point_succs[p1] == undefined) { this.point_succs[p1] = new Array(); }
	    if (this.point_succs[p2] == undefined) { this.point_succs[p2] = new Array(); }
	    if (this.lineshash[p1 + ";" + p2] == undefined) {
	    	this.lineshash[p1 + ";" + p2] = 1 ;
	    	this.lineshash[p2 + ";" + p1] = 1 ;
	     	this.point_succs[p1].push(p2);
		this.point_succs[p2].push(p1);	    
	    }
        }
    }
    
    this.in_the_middle_of_line = function(x,y,x1,y1,x2,y2) {
    	if ( x == x1 || x == x2 ) {
    		if (x == x1 && x == x2 && (y - y1) * (y - y2) < 0 ) {
    			return 1;
    		} else {
    			return 0;
    		}
    	} 
    	if ((x-x1) * (x-x2) < 0) {
    		if (Math.round(10* Math.atan((y-y1) / (x-x1))) == Math.round(10* Math.atan((y-y2)/(x-x2)))) {
    			return 1;
    		}
    	} 
    	return 0;
    }

    this.normalize_point_succs = function() {
    	var change = 1;
    	while (change) {
    	change = 0;
	for (var p in this.point_succs) {
		var tmp = p.split(",");
		var x = tmp[0]; var y = tmp[1];	
		for (var i = 0; i < this.point_succs[p].length - 1; i++) {
			tmp = this.point_succs[p][i].split(",");
			var x1 = tmp[0]; var y1 = tmp[1];				
			for (var j = i+1; j < this.point_succs[p].length; j++) {
				tmp = this.point_succs[p][j].split(",");
				var x2 = tmp[0]; var y2 = tmp[1];
				if (this.in_the_middle_of_line(x,y,x1,y1,x2,y2)) {
//					var out = "X " + x  + "," + y + "; " + x1 + "," + y1 + "; " + x2+ ","+y2;
//					alert(out);
					change = 1;
					// odstranim sousedy x,y
					this.point_succs[x+","+y].splice(i,1);
					this.point_succs[x+","+y].splice(j-1,1);
					// odstranim x,y jakou soused x1,y1 a x2, y2
					for (var k = 0; k < this.point_succs[x1+","+y1].length; k++) {
						if (this.point_succs[x1+","+y1][k] == x +","+y) { 
							this.point_succs[x1+","+y1].splice(k,1);
						}
					}
					for (var k = 0; k < this.point_succs[x2+","+y2].length; k++) {
						if (this.point_succs[x2+","+y2][k] == x +","+y) { 
							this.point_succs[x2+","+y2].splice(k,1);
						}
					}
					// pridam spojnici x1,y1 a x2, y2
					this.point_succs[x1+","+y1].push(x2 +","+y2);
					this.point_succs[x2+","+y2].push(x1 +","+y1);					
				} else if (this.in_the_middle_of_line(x1,y1,x,y,x2,y2)) {
//					var out = "X1 " + x  + "," + y + "; " + x1 + "," + y1 + "; " + x2+ ","+y2;
//					alert(out);
					change = 1;
					// odstranim x1, y1 jako souseda x,y
					this.point_succs[x+","+y].splice(i,1);
					// odstranim x,y jakou soused x1,y1 
					for (var k = 0; k < this.point_succs[x1+","+y1].length; k++) {
						if (this.point_succs[x1+","+y1][k] == x +","+y) { 
							this.point_succs[x1+","+y1].splice(k,1);
						}
					}
				} else if (this.in_the_middle_of_line(x2,y2,x,y,x1,y1)) {
//					var out = "X2 " + x  + "," + y + "; " + x1 + "," + y1 + "; " + x2+ ","+y2;
//					alert(out);
					change = 1;
					// odstranim x2, y2 jako souseda x,y
					this.point_succs[x+","+y].splice(j,1);
					// odstranim x,y jakou soused x2,y2 
					for (var k = 0; k < this.point_succs[x2+","+y2].length; k++) {
						if (this.point_succs[x2+","+y2][k] == x +","+y) { 
							this.point_succs[x2+","+y2].splice(k,1);
						}
					}
				}				
			}			
		} 
	}    
	} // konec while	
    }


    this.create_lineshash = function() {
        this.lineshash = new Object();
	for (var p in this.point_succs) {
		for (var i = 0; i < this.point_succs[p].length; i++) {
			var p2 = this.point_succs[p][i];
			if (p < p2) {
				this.lineshash[p + ";" + p2] = 1;
			}
		}
	}    
    }
    
    this.back = function(step) {
        this.forward(-1*step);
    }

    this.clean = function() {
        this.canvas.canvas.width = this.canvas.canvas.width;
        this.canvas.translate(this.x0, this.y0);
         if(this.extraArrowCanvas) {
            this.canvasArrow.canvas.width = this.canvasArrow.canvas.width;
            this.canvasArrow.translate(this.x0, this.y0);
        }
        // vymazat cary
        this.lineshash = new Object();
	this.point_succs = new Object();        
    }

    this.penup = function() {
        this.pen = false;        
    }

    this.pendown = function() {
        this.pen = true;
    }

    this.home = function() {
        this.x=0; this.y=0;
    }

    this.hide = function() {
        this.visible = false;
    }

    this.show = function() {
        this.visible = true;
    }

    if (canvasElement.jquery != null) {
        this.canvas = canvasElement[0].getContext("2d");
    }else{
        this.canvas = canvasElement.getContext("2d");
        canvasElement = $(canvasElement);
    }
    this.canvasElement = canvasElement;
 
    if (pencolor != null) {
         this.pencolor = pencolor;
    }

    if (canvasElementArrow != null) {
        if (canvasElementArrow.jquery != null) {
            canvasElementArrow = canvasElementArrow[0];
        }
        this.canvasArrow = canvasElementArrow.getContext("2d");
        this.extraArrowCanvas = true;
    } else {
        this.canvasArrow = this.canvas;
    }

    this.x0 = Math.ceil(this.canvasElement.width() / 2);
    this.y0 = Math.ceil(this.canvasElement.height() / 2);
    this.clean();
    
}
