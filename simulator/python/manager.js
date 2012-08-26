/*
* Author: Vít Stanislav<slaweet@mail.muni.cz> 
* some functions stolen from: Brad Miller<bonelake@gmail.com>
* Year: 2012

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/
var BUNDLE = {
    "en":{ 
    "solution": "One of many possible solutions:",
    "solve": "Solve here:",
    "test": "Testing area:",
    "run": "Run test",
    "submit": "Submit",
    "result": "Actual output:",
    "expected": "Expected output:",
    "task": "Write function ",
    "that": ", that "
    },
    "cs":{ 
    "solution": "Jedno z mnoha možných řešení:",
    "solve": "Prostor pro řešení:",
    "test": "Prostor pro testování:",
    "run": "Spustit test",
    "submit": "Odevzdat",
    "result": "Váš výstup:",
    "expected": "Požadovaný výstup:",
    "task": "Napište funkci ",
    "wrong": "Funkce nefunfuje správně. (Pro příklad příklad argumentů se špatným chováním viz Prostor pro testování). ",
    "attempt": ". pokus o odevzdání. ",
    "that": ", která "
    }
};

var PythonManager = {
    testCycles: 50,
    moveCount: 0,
    editors: {},
    init: function(task) {
        for (var i in BUNDLE) {
            Lang.setBundle(i, BUNDLE[i]);
        }
        $('.lang').text(function(i, text){ return Lang.get(text);});
        if (task.indexOf("{") == -1) {
            task = base64_decode(task);
        }
        task = eval("(" + task.replace(/\n/g, '\\n') + ")");
        this.task = task;
        this.functionHeader = task.function.name + '(' + task.function.paramNames.join(', ') + ')'; 
        this.firstLine = 'def '+ this.functionHeader + ':\n';
        $('#text').html(Lang.get("task") + '<b>' + this.functionHeader  + '</b>' + Lang.get("that") + task.text);
        this.createEditors();
        this.setup(0);
        this.editors.attempt_code.setValue(this.firstLine + (this.task.attempt ||'    """code here"""\n    '));
        this.run();
        this.editors.attempt_code.focus();
        this.editors.attempt_code.setCursor(3);
    },
    createEditors: function() {
        var edList = new Array();
        edList = document.getElementsByClassName("active_code");
        for (var i = 0; i < edList.length; i++) {
            newEdId = edList[i].id;
            this.editors[newEdId] = CodeMirror.fromTextArea(edList[i], {
                mode: {name: "python",
                    version: 2,
                    singleLineStringErrors: false},
                lineNumbers: true,
                indentUnit: 4,
                tabMode: "indent",
                matchBrackets: true,
                //initCallback: rest
                onKeyEvent:handleEdKeys,
                onChange: clearMessage,
                lineNumberFormatter: function(i){return i+5}
            }
                    );
            this.editors[newEdId].parentDiv = edList[i].parentNode.id;
        }
    },
    setup: function(valueIndex) {
        var params = [];
        for (var i = 0; i < this.task.function.paramNames.length; i++) {
            params.push(this.getParamValue(i,valueIndex));
        }
        var code = (this.task.solution.indexOf('return') != -1 ? 'print ' : '') 
        	+ this.task.function.name + '(' + params.join(', ') + ')';
        this.editors["testing_code"].setValue(code);
    },
    getParamValue: function(paramIndex, valueIndex) {
        var type = this.task.function.paramTypes[paramIndex].split(' ');
        var value = (this.task.function.testParams && this.task.function.testParams[paramIndex][valueIndex]) || this.getRand(type);
        if (type[0] == 'str') {
            value = "'" + value + "'";
        }
        return value;
    },
    getRand: function(typeArray) {
        var type = typeArray[0];
        var min = typeArray[1];
        var max = typeArray[2];
        switch(type) {
            case 'int':
                return Math.floor(Math.random() * (max - min + 1) + min);
            case 'str':
                return Math.random().toString(36).substr(2, this.getRand(['int',min,max]));
        }
    },
    submit: function(button) {
        var allCorrect = true;
        for (var i = 0; i < this.testCycles; i++) {
            this.setup(i);
            this.run(button);
            var isCorrect = this.getNormalizedText('#testing2_pre') == this.getNormalizedText$('#testing_pre');
            if (!isCorrect) {
                allCorrect = false;
                break;
            }
        }
        this.tutorLog(this.editors["attempt_code"].getValue());
        if (allCorrect) {
            this.win();
        } else {
            $('#message').text(this.moveCount + Lang.get('attempt') + Lang.get('wrong'));
        }
    },
    getNormalizedText: function(selector) {
        return $(selector).text().replace(/ +/g, ' ').replace(/ +\n/, '\n');
    },
    tutorLog: function(move) {
        var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+(this.moveCount++)+"&move="+move;
        sendDataToInterface(q);
    },
    win: function(button) {
        this.editors["solution_code"].setValue(this.firstLine + this.task.solution);
        this.editors["solution_code"].refresh();
        $(".solution").css('display', 'block');
        var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&win=1";
        sendDataToInterface(q);
        after_win();
    },
    run: function(button) {
        this.runit('testing', button, '_pre', this.editors["attempt_code"].getValue());
        this.runit('testing', button, '2_pre', this.firstLine + this.task.solution);
    },
    runit: function(myDiv, theButton, pre, include) {
        $(theButton).attr('disabled','disabled');
        Sk.isTurtleProgram = false;
        if (theButton !== undefined) {
            Sk.runButton = theButton;
        }
        var editor = this.editors[myDiv+"_code"];
        var prog =  include + "\n" + editor.getValue();
        var mypre = document.getElementById(myDiv + pre);
        if (mypre) mypre.innerHTML = '';
        Sk.pre = myDiv + pre;
        // set execLimit in milliseconds  
        Sk.execLimit = 5000;
        // configure Skulpt output function, and module reader
        Sk.configure({output:outf,
                    read: builtinRead
                });
        try {
            Sk.importMainWithBody("<stdin>", false, prog);
        } catch (e) {
            var message = (e+"");
            if (message.indexOf("ParseError: bad input on line") != -1) {
                var a = message.split(" ");
                //alert(a[a.length-1] + " " + this.editors["attempt_code"].lineCount())
                if (parseInt(a[a.length-1]) > this.editors["attempt_code"].lineCount()) {
                    message = message.replace(/(\d)+/, (a[a.length-1]-this.editors["attempt_code"].lineCount()) + " in testing area");
                }
            }
            $(mypre).text(message);
            //alert(e);
        }
        $(theButton).removeAttr('disabled');
    }
}

    function rest(editor)
    {
        editor.focus();
        editor.grabKeys(function(e)
                {
                    if (e.keyCode === 13)
                    {
                        if (e.ctrlKey)
                        {
                            e.stop();
                        }
                        else if (e.shiftKey)
                        {
                            e.stop();
                        }
                    }
                }, function(e) {
                    return (e.ctrlKey || e.shiftKey) && e.keyCode === 13;
                });
    }

function clearMessage(ed, e) {
    $('#message').text('');
}

function handleEdKeys(ed, e) {
    if (e.keyCode === 13) {
        if (e.ctrlKey) {
            e.stop();
            PythonManager.run();
        }
        else if (e.shiftKey) {
            e.stop();
            PythonManager.submit();
        }
    } else if (e.keyCode === 86 || e.keyCode === 67) {
        //disable copy and paste
        if (e.ctrlKey) {
            e.stop();
        }
    } else if (e.keyCode === 38) {
        if (e.ctrlKey) {
            PythonManager.editors.attempt_code.focus();
            e.stop();
        }
    } else if (e.keyCode === 40) {
        if (e.ctrlKey) {
            PythonManager.editors.testing_code.focus();
            e.stop();
        }
    } else {
        /*if (ed.acEditEvent == false || ed.acEditEvent === undefined) {
            $('#'+ed.parentDiv+' .CodeMirror').css('border-top', '2px solid #b43232');
            $('#'+ed.parentDiv+' .CodeMirror').css('border-bottom', '2px solid #b43232');
        }*/
        ed.acEditEvent = true;
    }
}


function outf(text) {
    var mypre = document.getElementById(Sk.pre);
    // bnm python 3
    x = text;
    if (x.charAt(0) == '(') {
        x = x.slice(1,-1);
	x = '['+x+']';
	try {
        var xl = eval(x);
        xl = xl.map(pyStr);
        x = xl.join(' ');
	} catch(err) {
	    }
    }
    text = x;
    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
    mypre.innerHTML = mypre.innerHTML + text;
}

function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}
