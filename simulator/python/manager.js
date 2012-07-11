/*
* Author: Vít Stanislav<slaweet@mail.muni.cz> 
* Year: 2012
*/

var PythonManager = {
    testCycles: 50,
    init: function(task) {
        this.task = task;
        this.functionHeader = task.function.name + '(' + task.function.paramNames.join(', ') + ')'; 
        $('#text').text("Napište funkci "+ this.functionHeader +", která" + task.text);
        cm_editors["attempt_code"].setValue('def '+ this.functionHeader + ':\n    #code here');
        this.setup();
        cm_editors["solution_code"].setValue(task.solution);
    },
    run: function(button) {
        runit('testing', button, {1:'attempt'});
        cm_editors['testing2_code'].setValue(cm_editors['testing_code'].getValue()); 
        runit('testing2', button, {1:'solution'})
    },
    setup: function(button) {
        var code = "";
        for (var i = 0; i < this.task.function.paramNames.length; i++) {
            code += this.task.function.paramNames[i] + ' = ' + this.getRand(this.task.function.paramTypes[i]) + '\n';
        }
        code += this.functionHeader;
        cm_editors["testing_code"].setValue(code);
    },
    getRand: function(type) {
        switch(type) {
            case 'int':
                return Math.floor(Math.random()*20)
        }
    },
    submit: function(button) {
        for (var i = 0; i < this.testCycles; i++) {
            this.setup();
            this.run(button);
            var isCorrect = $('#testing2_pre').text() == $('#testing_pre').text(); 
            if (!isCorrect) {
                return false;
            }
        }
        var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&win=1";
        sendDataToInterface(q);
        after_win();
    }
}
