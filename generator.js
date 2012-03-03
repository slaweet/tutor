function $(id) {return document.getElementById(id)}; 

var Generator = {
    bools: ['true', 'false'],
	vars: ['x', 'y'],
	oppBoxs: [
        'x+y', 'x-y', 'x*y', 'x/y', 'x^y','|x|', 'log_x(y)', 'sin(x)', 'cos(x)',
        'x or y', 'x and y', 'not x', 'x==y', 'x!=y', 'x<=y', 'x>=y', 'x>y', 'x<y'
    ],
	types: {
        'x+y': ['num','num'], 'x-y': ['num','num'], 'x*y': ['num','num'], 'x/y': ['num','num'],
        'x^y': ['num','num'], '|x|': ['num','num'], 'log_x(y)': ['num','num'], 
        'sin(x)': ['pinum','num'], 'cos(x)': ['pinum','num'],
        'x or y': ['bool','bool'], 'x and y': ['bool','bool'], 'not x': ['bool','bool'],
        'x==y': ['num','bool'], 'x!=y': ['num','bool'], 'x<=y': ['num','bool'], 
        'x>=y': ['num','bool'], 'x>y': ['num','bool'], 'x<y': ['num','bool']
    },
	parseForm: function() {
		this.from = parseInt($('from').value); 
		this.to = parseInt($('to').value); 
		this.cardsFrom = parseInt($('cardsfrom').value); 
		this.cardsTo = parseInt($('cardsto').value); 
		this.count = parseInt($('count').value); 
        this.opps = []
        for (var i = 0; i < this.oppBoxs.length; i++) {
            var o = this.oppBoxs[i];
            if($(o).checked)
                this.opps.push(o);
        }
	},
	number: function(from, to) {
		return Math.floor(Math.random()*(to - from + 1) + from);
	},
	task: function(type) {
        var task = '';
        if(this.number(0,2) != 0 || this.cards.length > this.cardsFrom){
            if(type == 'num')
                task = '' + this.number(this.from, this.to);
            else if(type == 'bool')
                task = this.randFromArray(this.bools);
            else
                task = 'PI';
        } else {
            var i = 0;
            do {
            task = this.randFromArray(this.opps);
            i++;
            } while(type != this.types[task][1] && i < this.opps.length * 3);
            type = this.types[task][0];
        }
        if(this.number(0,2) != 0)
            this.cards.push(task);
        else
            this.cards.unshift(task);
        task = Evaluator.parseName(task);
        for (var i in this.vars) {
            if(task.indexOf(this.vars[i]) != -1)
                task = task.replace(this.vars[i], this.task(type));
        }
        return '(' + task + ')';
    },
    randFromArray: function (array) {
            var i = this.number(0, array.length - 1);
            var ret = array[i];
            //array = array.splice(i,1);
            return ret;
    },
    /*
    makeOpps: function() {
        this.opps = []
        do {
            for (var i = 0; i < this.checkedOpps.length; i++) {
                this.opps.push(this.checkedOpps[i]);
            }
        } while(this.opps.length < this.cardsTo );
    },
    makeNums: function() {
        this.nums = []
        do {
            for (var i = this.from; i <= this.to; i++) {
                this.nums.push(i);
            }
        } while(this.nums.length < this.cardsTo * 2);
    },
    */
	generate: function() {
		do {
		this.cards = [];
        //this.makeNums();
        //this.makeOpps();
		var task = this.task(this.types[this.randFromArray(this.opps)][1]);
		var result = eval(task);
		} while ((result < this.from || result > this.to)
			|| result != Math.floor(result)
			|| result == 0 
			|| (this.cards.length < this.cardsFrom
			   || this.cards.length > this.cardsTo))
		this.cards.unshift('x=' + result)
		var ret = '';
            for (var i = 0; i < this.cards.length; i++) {
		    ret += ",'" + this.cards[i] + "'";
	    }
		return '[' + ret.substring(1) + ']';
    },
    click: function() {
        this.parseForm();
        $('gen').innerHTML = 'Generování...' ; 
        $('text').innerHTML = '' ; 
        for (var i = 0; i < this.count; i++) {
            $('text').innerHTML += Generator.generate()+ "\n\n";
        }
        $('gen').innerHTML = 'Generovat' ; 
    }, 
}
window.onload = function () {
    for (var i = 0; i < Generator.oppBoxs.length; i++) {
        var o = Generator.oppBoxs[i];
        var ch = i < 4 ? ' checked ' : '';
        $('opps').innerHTML += '<input type="checkbox" id="'+o+'"'+ ch +'>' + o + ' ';
    }
}


// Just one function for debuging

var debug = function(object) {
        var al;
        if(typeof object == "string")
            al = object;
        else
            for(var i in object) {
                al += ' # ' + i +  '%' + object[i] + "<br>\n";
            }
        document.getElementById('debug').innerHTML += al + "<br>\n"; 
    };

