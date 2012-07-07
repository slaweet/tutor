function $(id) {return document.getElementById(id)}; 

window.onload = function () {

        Solver.init();
        //Solver.findSolutions(['3','-5','|x|','x+y','x=2']);
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
        document.getElementById('opps').innerHTML += al + "<br>\n"; 
    };
// 1,5,8,x/y,3,5,x/y,x-y,x/y,x=40 

var Solver = {
    stack: [],
	vars: ['y', 'x'],
    solutions: [],
    limit: 5000,
    init: function() {
        Evaluator.writeResult = function(result) {
            this.no1 = result + '';
        }
        UI.result = {write: function(){}}
        UI.memoryIndicator = {show: function(){}}
    },
    isSolution: function(solution) {
        this.stack = []
        if(solution.indexOf(';') != -1) {
            return false;
        }
        var inSequence = solution.split(',');
        for (var i = 0; i < inSequence.length; i++) {
            this.processOne(inSequence[i]);
        }
        return this.stack.length == 1 && this.stack[0] === true;
    },
    processOne: function(item) {
        if (item - 0 == item) {
            this.stack.push(item);
        } else {
            var task = Evaluator.parseName(item);
            for (var i in this.vars) {
                if(task.indexOf(this.vars[i]) != -1) {
                    task = task.replace(this.vars[i], this.stack.pop());
                }
            }
            var result = Evaluator.jseval(task);
            this.stack.push(result);
        }
    },
    findSolutions: function(goal, buttons) {
        this.solutions = [];
        this.goal = goal;
        this.iterations = 0;
        this.tryAll(buttons, buttons, 0);
        return this.solutions.length;
        //return this.iterations;
    },
    tryAll: function(possible, given) {
        for (var i = 0; i < given.length; i++) {
            for (var j = 0; j < possible.length; j++) {
            }
        }
    },
    click: function() {
        this.limit = $('limit').value;
        var buttons = eval('[' + $('source').value + ']');
        var goal = buttons.shift();
        try {
            var count = this.findSolutions(goal, buttons);
        } catch (e) {
            var count = 'error: too large data';
        }
        $('count').value = count;
        $('pure').value = count / this.repetitions(cards);
        $('text').innerHTML = this.solutions.join("\n");

    }
};
