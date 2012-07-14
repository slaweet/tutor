/*
* Author: Vít Stanislav<slaweet@mail.muni.cz> 
* Year: 2012
*/
var BUNDLE = {
    "en":{ 
    "solve": "Solve here: ",
    "test": "Test here: ",
    "run": "Run this test",
    "submit": "Run test that fails",
    "result": "Actual result:",
    "expected": "Expected result:",
    "task": "napište funkci ",
    "that": ", that "
    },
    "cs":{ 
    "solve": "Prostor pro řešení: ",
    "test": "Prostor pro testování: ",
    "run": "Spustit tento test",
    "submit": "Spustit test který neprojde",
    "result": "Výstup:",
    "expected": "Požadovaný výstup:",
    "task": "Napište funkci ",
    "that": ", která "
    }
}

var PythonManager = {
    testCycles: 50,
    init: function(task) {
        this.task = task;
        for (var i in BUNDLE) {
            Lang.setBundle(i, BUNDLE[i]);
        }
        $('.lang').text(function(i, text){ return Lang.get(text);});
        this.functionHeader = task.function.name + '(' + task.function.paramNames.join(', ') + ')'; 
        $('#text').text(Lang.get("task") + this.functionHeader + Lang.get("that") + task.text);
        cm_editors["attempt_code"].setValue('def '+ this.functionHeader + ':\n    """code here"""\n    ');
        this.setup();
        cm_editors["solution_code"].setValue(task.solution);
        cm_editors["attempt_code"].focus();
        cm_editors["attempt_code"].setCursor(3);
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
            case 'smallint':
                return Math.floor(Math.random()*1000)
            case 'int':
                return Math.floor(Math.random()*1000000000)
            case 'tinyint':
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
