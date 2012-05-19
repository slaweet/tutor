function $(id) {return document.getElementById(id)}; 

window.onload = function () {

        Solver.findSolutions(['3','-5','|x|','x+y','x=2']);
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
    findSolutions: function(task) {
        this.solutions = [];
        this.iterations = 0;
        this.tryAll(task, [], 0);
        return this.solutions.length;
        //return this.iterations;
    },
    tryAll: function(possible, given, inOutBalance) {
        this.iterations++;
        if(this.iterations > this.limit) {
            throw 'too long input';
        }
        //if (given.length > 0 &&(given[given.length -1]+'').indexOf('=') == -1) {
        for (var j = 0; j < possible.length; j++) {
            var newGiv = given.slice();
            newGiv.unshift(possible[j]);
            var diff = this.balance(possible[j]);
            if (inOutBalance + diff > 0 && (newGiv[newGiv.length -1]+'').indexOf('=') != -1) {
                var newPos = possible.slice();
                newPos.splice(j, 1);
                this.tryAll(newPos, newGiv, inOutBalance + diff);
            } else if (possible.length == 1 && this.isSolution(newGiv.join(','))) {
                //debug(newGiv.join(',')); 
                this.solutions.push(newGiv);
            }
        }
    },
    balance: function(name) {
        var arity = CardManager.getArity(name);
        if (arity >= 0) {
            arity--;
        } else {
            arity *= -1;
        }
        return arity;
    },
    /*
    inMinusOut: function(names) {
        var diff = 0;
        for (var i = 0; i < names.length; i++) {
            var arity = cardmanager.getarity(names[i]);
            diff += math.abs(arity);
            if (arity >= 0) {
                diff--;
            }
        }
        return diff; 
    },
    */
    repetitions: function(cards) {
        retVal = 1;
        for (var i = 0; i < cards.length; i++) {
            if (cards[i].search(/x[+*=]y/) != -1) {
                retVal *= 2;
            }
        }
        return retVal;
    },
    click: function() {
        this.limit = $('limit').value;
        var cards = eval('[' + $('source').value + ']');
        try {
            var count = this.findSolutions(cards);
        } catch (e) {
            var count = 'error: too large data';
        }
        $('count').value = count;
        $('pure').value = count / this.repetitions(cards);
        $('text').innerHTML = this.solutions.join("\n");

    }
};
