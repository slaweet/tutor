// Copyright  2009, Blake Coverett 
// Use and Redistribute Freely under the Ms-PL
// http://www.opensource.org/licenses/ms-pl.html
// Modified by Radek Pelanek

base.require('html');

var robozzle = (function() {
    var module = {};
    var width, height, maxSubs, maxSubLength;
    var directions, cellSprites, programSprites;
    var puzzle, board = [], program = [];
    var col, row, dir, stars, steps, stack;
    var centerX, continueRunning, stepping, buttons = {};
    var moveCount = 0;
    var lastProgramString = "";
    var Id = html.$;
    var alerts = {};

    // asi ruzna nastaveni zobrazovani herniho planu
    
    var SetSprite = function(elem, sprite) {
        elem.style.backgroundPosition = sprite;
    }
    var MergeSprites = function(row, col) {
        var r = row.split(' ');
        var c = col.split(' ');
        return c[0] + ' ' + r[1];
    }

    var SetCell = function(x, y, c) {
                SetSprite(board[y][x], cellSprites[c]);
        board[y][x].puzzleColor = c.charAt(0).toLowerCase();
        if (c >= 'A' && c <= 'Z') {
            board[y][x].puzzleStar = true;
            ++stars;
        } else
            board[y][x].puzzleStar = false;
    }
    var GetCell = function(x, y) {
        return { color: board[y][x].puzzleColor, star: board[y][x].puzzleStar };
    }
    var ClearContent = function(x, y) {
        SetCell(x, y, board[y][x].puzzleColor);
    }
    var SetProgramBlock = function(block, cmd) {
        cmd = cmd.toLowerCase().split('-');
        var predicate, action;
        if (cmd.length == 1) {
            if (cmd[0] == 'nop') {
                SetSprite(block, programSprites['nop']);
                block.puzzlePredicate = 'nop';
                block.puzzleAction = 'nop';
                return;
            }
            predicate = 'grey';
            action = cmd[0];
        } else {
            predicate = cmd[0];
            action = cmd[1];
        }
        if (action == 'red' || action == 'green' || action == 'blue') action = 'paint' + action;
        SetSprite(block, programSprites[predicate + '-' + action]);
        block.puzzlePredicate = predicate;
        block.puzzleAction = action;
    }
    var SetProgram = function(func, step, cmd) { SetProgramBlock(program[func][step], cmd); }
    var HighlightStep = function(func, step, showHighlight) {
        if(showHighlight)
            $(program[func][step]).addClass('highlighted');
        else
            $(program[func][step]).removeClass('highlighted');
        
    }

    // kodovani programu retezcem

    var GetProgramString = function() {
        var programString = '';
        for (var func = 0; func < maxSubs; ++func) {
            for (var step = 0; step < maxSubLength; ++step) {
                var action = program[func][step].puzzleAction;
                if (action != "nop") {

                    programString += encodedPredicates[program[func][step].puzzlePredicate];
                    programString += encodedActions[action];
                }
            }
            programString += "|";
        }
        return programString;
    }

    // animated representation of program stack by slaweet    
    var Stack = {
        init: function() {
            this.maxLength = 20;
            this.actor = Id('stack');
            this.style = this.actor.style;
            this.height = $('#stack').height();
            this.animatePart = 1;
            base.attach(Id('tooglestack'), 'click', this.onToogleClick);
            this.pressDown();
            if(!Id('tooglestack').defaultChecked)
                $('#stack').hide();
        },

        onToogleClick: function() {
            $('#stack').fadeToggle(function() {Stack.update();});
            html.Cookie.create('showstack', (this.checked ? 'checked' : ''), 365);
        },

        slideLeft: function(elem) {
             $(elem).animate({width: '0'}, 'fast', function() {
                 $(elem).css({display: 'none'});
             });
        },

        animate: function(to, callback) {
            $('#animate').animate({ top: to.top, left: to.left}, Stack.speed, callback);
        },

        getLineOfStack: function(i, count) {
            if(stack.length < 1)
                return '';
            var onLine = 0;
            var line = '';
            for (var j = stack[i].step; j < maxSubLength; j++) {
                if (program[stack[i].func][j].puzzleAction != "nop") {
                    bgPos = program[stack[i].func][j].style.backgroundPosition;
                    if(onLine + 1 == count && count == 4)
                        bgPos += '; width: 20px';
                    if(onLine < count)
                        line += "<span style='background-position: " + bgPos + ";'></span> ";
                    onLine++;
                }
            }
            return line;
        },

        getPositionOfFirst: function() {
            var wrapper = $('#stackwrapper').position();
            var position = $('#stack div:first-child').position();
            position.top = (wrapper.top + position.top );
            position.left = (wrapper.left + position.left + 5 );
            return position;
        },

        getPositionBelowFirst: function() {
            var position = this.getPositionOfFirst();
            var shift = ( $('#stack div:first-child').children().length > 0  ? 35 : 0); 
            position.top = position.top - shift;
            return position;
        },

        setSpeed: function() {
            this.speed = ((stepping) ? 300 : (GetSpeed()-50) / 2); 
        },
        
        animationDone: function() {
                Stack.update();
        },

        updateAnimate: function(predicate) {
            if((continueRunning && this.speed < 100) || this.style.display == 'none') {
                this.update();
            } else {
                $('#stack div:first-child span:first-child').remove();
                $('#stack div:first-child').css({paddingLeft: '35px'});
                $('#stack div:first-child').animate({paddingLeft: '5px'}, speed );
                $('#stack div:first-child span:eq(2)').animate({width: '30px'}, speed );
                $('#animate').css({display: 'block'});
                if(stack.length > this.prewLength) {
                    this.animate($(program[stack[0].func][stack[0].step]).position(), function() {
                           $('#animate').html(Stack.getLineOfStack(0, maxSubLength));
                           Stack.animate(Stack.getPositionBelowFirst(), Stack.animationDone);
                        });
                } else if (predicate) {
                    this.animate(Robot.getPosition(), Stack.animationDone);
                } else {
                    this.animate($('#nop').position(), Stack.animationDone);
                }
            }
            this.prewRow = row;
            this.prewCol = col;
        },

        update: function() {
            var stackString = '';
            var lines = 0
            for (var i = 0; i < stack.length && lines <= this.maxLength; i++) {
                var line = this.getLineOfStack(i, 4);
                if(line != '') {
                    stackString += '<div>' + line + '</div>';
                    lines++;
                }
            }
            this.prewLength = stack.length;
            this.actor.innerHTML = stackString;
            if(this.actor.children.length > this.maxLength)
                $('#stack div:last-child span').css({height: '10px'});
            this.pressDown();
            $('#animate').html(this.getLineOfStack(0, 1));
            if($('#animate').html() != '' ) {
                var pos = this.getPositionOfFirst();
                $('#animate').css({display: 'none', top: pos.top, left: pos.left});
            }
        },

        pressDown: function() {
            var innerHeight = Math.min(this.height, 35 * this.actor.children.length);
            this.style.paddingTop = (this.height - innerHeight) + 'px';
            this.style.height = innerHeight + 'px';
        },
    }

    var encodedActions = {
        nop: '_',
        forward: 'F',
        left: 'L',
        right: 'R',
        paintred: 'r',
        paintgreen: 'g',
        paintblue: 'b',
        f1: '1',
        f2: '2',
        f3: '3',
        f4: '4',
        f5: '5'
    };

    var encodedPredicates = {
        nop: '_',
        grey: '_',
        red: 'r',
        green: 'g',
        blue: 'b'
    };
    
    // interpretace akci - pro kazdou z nich vraci funkci, ktera ji realizuje
    
    var actions = {
        nop: function() { return true },
        forward: function() {
            var d = directions[dir];
            row += d.row;
            if (row < 0 || row >= height) return false;
            col += d.col;
            if (col < 0 || col >= width) return false;
            Robot.animate();
            return true;
        },
        left: function() { dir = (dir + 3) % 4; Robot.animate(); ++steps; return true },
        right: function() { dir = (dir + 1) % 4; Robot.animate(); ++steps; return true },
        paintred: function() { SetCell(col, row, 'r'); Robot.animate(); ++steps; return true },
        paintgreen: function() { SetCell(col, row, 'g'); Robot.animate(); ++steps; return true },
        paintblue: function() { SetCell(col, row, 'b'); Robot.animate(); ++steps; return true },
        f1: function() { ++stack[0].step; stack.unshift({ func: 0, step: -1 }); return true; },
        f2: function() { ++stack[0].step; stack.unshift({ func: 1, step: -1 }); return true; },
        f3: function() { ++stack[0].step; stack.unshift({ func: 2, step: -1 }); return true; },
        f4: function() { ++stack[0].step; stack.unshift({ func: 3, step: -1 }); return true; },
        f5: function() { ++stack[0].step; stack.unshift({ func: 4, step: -1 }); return true; }
    };

    // interpretace predikatu
    
    var predicates = {
        nop: function() { return false },
        grey: function() { return true },
        red: function() { return GetCell(col, row).color == 'r' },
        green: function() { return GetCell(col, row).color == 'g' },
        blue: function() { return GetCell(col, row).color == 'b' }
    };


    var PuzzleFinished = function(isDone) {
        continueRunning = false;
        for (b in buttons) {
            if (isDone) { Id(b).style.backgroundPosition = buttons[b]; }
            else { Id(b).style.backgroundPosition = ""; Id(b).removeAttribute("style"); }
        }
        if(isDone) {
            //++stack[0].step
        }
        else
            Stack.update();
    }
   var Robot = {
       init: function() {
            var from = $(board[row][col]).position();
            $('#robot').css({display: 'block', top: from.top, left: from.left});
            Stack.prewRow = row;
            Stack.prewCol = col;
       },

       animate: function() {
            var elem = $('#robot');
            if(Stack.speed > 20) {
                $(elem).animate({width: '40px'}, Stack.speed, function() {
                    var to = $(board[row][col]).position();
                    SetSprite(Id('robot'), cellSprites[' ' + dir]);
                    $(elem).animate({ top: to.top, left: to.left}, Stack.speed, function() {
                        Robot.checkFinish();
                    });
                });
            } else {
                var to = $(board[row][col]).position();
                SetSprite(Id('robot'), cellSprites[' ' + dir]);
                $(elem).css({ top: to.top, left: to.left})
                Robot.checkFinish();
            }
       },

        getPosition: function() {
            var wrapper = $('#boardwrapper').position();
            var position = $('#robot').position();
            position.top = (wrapper.top + position.top);
            position.left = (wrapper.left + position.left);
            return position;
        },

       checkFinish: function() {
            var c = GetCell(col, row);
            if (c.star) --stars;
            ClearContent(col, row);

            if (stars < 1) {
                PuzzleFinished(true);
                var programString = GetProgramString();		
                var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+moveCount+"&move=solution:"+programString;
                sendDataToInterface(q);		
                q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+moveCount+"&win=1";
                sendDataToInterface(q);
                after_win();		
                return;
            }
            if (c.color == ' ') { 
                alert(alerts.onStones);
                PuzzleFinished(true);
                return;
            }
            if (steps > 1000) {
                alert(alerts.tooManySteps);
                PuzzleFinished(true);
                return;
            }
            ++steps;
       }
   }
    // jeden krok programu
    
    var Step = function() {
        if (Id('runPuzzle').style.backgroundPosition) return;
        var func = stack[0].func;
        var step = stack[0].step;
        var failure = false;
        Stack.setSpeed();
        var predicate = predicates[program[func][step].puzzlePredicate]();
        if (predicate) {
            failure = (!actions[program[func][step].puzzleAction]())
        }

        HighlightStep(func, step, false);
        do {
            if (++stack[0].step >= maxSubLength) {
                stack.shift();
                if (stack.length < 1) {
                    Stack.updateAnimate(predicate);		
                    PuzzleFinished(true);
                    return;
                }
            }
        }
        while (program[stack[0].func][stack[0].step].puzzlePredicate == 'nop');
        HighlightStep(stack[0].func, stack[0].step, true);

		Stack.updateAnimate(predicate);		
	
        if(failure) {
            alert(alerts.outOfBoard);
            PuzzleFinished(true);
            return;
        }
        if (continueRunning) window.setTimeout(Step, GetSpeed()); 
    };

    // get speed from radios
    var GetSpeed = function() {
        var speedRadio = document.forms['speed'].elements['speed'];
        for(var i = 0; i < speedRadio.length; i++) {
            if(speedRadio[i].checked) {
                html.Cookie.create('defaultspeed', speedRadio[i].value, 365);
                return speedRadio[i].value;
            }
        }
        return 100;
    }

    // krokovani a spousteni programu

    var TutorLog = function() {
	var programString = GetProgramString();
	if (programString != lastProgramString) {
	    var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+moveCount+"&move="+programString;
	    sendDataToInterface(q);
	    lastProgramString = programString;
	    moveCount++;
	}
    }
    
    var StepPuzzle = function() {
	TutorLog();
        if (Id('stepPuzzle').style.backgroundPosition) return false;
        Id('stepPuzzle').style.backgroundPosition = buttons['stepPuzzle'];
        continueRunning = false;
        stepping = true;
        Step();
        window.setTimeout(function() {
                if (!Id('runPuzzle').style.backgroundPosition) {
                     Id('stepPuzzle').style.backgroundPosition = ""; 
                     Id('stepPuzzle').removeAttribute("style");
                 }
                 }, 700);
        return false;
    }

    var RunPuzzle = function() {
	TutorLog();
        if (Id('runPuzzle').style.backgroundPosition) return false;
        stepping = false;
        if (!continueRunning) {
            continueRunning = true;
            Step();
        } else
            continueRunning = false;
        return false;
    }

    var ResetPuzzle = function() {
        window.setTimeout(function() { LoadPuzzle(puzzle); },  (continueRunning ? (GetSpeed()*2) : 0)); //HACK 
        continueRunning = false;
        return false;
    }

    // vytvori herni plan zadane velikosti a vhodne to vsechno propoji
    
    var CreateBoard = module.CreateBoard = function(w, h, subs, subLen) {
        width = w; height = h; maxSubs = subs; maxSubLength = subLen;
        directions = [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: -1, col: 0}];
        cellSprites = {};
        var colors = { ' ': 'grey', r: 'red', g: 'green', b: 'blue' };
        for (var c in colors) {
            var color = colors[c];
            cellSprites[c] = Id('board' + color).style.backgroundPosition;
            if (c != ' ')
                cellSprites[c.toUpperCase()] = MergeSprites(cellSprites[c], Id('star').style.backgroundPosition);
            for (var d = 0; d < 4; ++d)
                cellSprites[c + d] = MergeSprites(cellSprites[c], Id('robot' + d).style.backgroundPosition);
        }
        programSprites = { 'unavailable': Id('unavailableProgram').style.backgroundPosition };
        for (var predicate in predicates)
            for (var action in actions)
            programSprites[predicate + '-' + action] =
					    MergeSprites(Id(predicate).style.backgroundPosition,
								     Id(action == 'nop' ? 'grey' : action).style.backgroundPosition);
        programSprites['grey-nop'] = programSprites['nop'] = Id('blankProgram').style.backgroundPosition;

        var rowTemplate = { tr: [] };
        for (var x = 0; x < width; ++x) rowTemplate.tr.push({ td: html.marker });
        for (var y = 0; y < height; ++y) board.push(html.add(Id('board'), rowTemplate));
        var progTemplate = { div: [{ div: ['F{num}'], id: 'sub{num}'}] };
        for (var i = 0; i < maxSubLength; ++i) progTemplate.div.push({ span: html.marker });
        for (var i = 0; i < maxSubs; ++i) program.push(html.add(Id('program'), progTemplate, { num: i + 1 }));
        base.attach(Id('runPuzzle'), 'click', RunPuzzle);
        buttons['runPuzzle'] = Id('runPuzzle').style.backgroundPosition;
        base.attach(Id('stepPuzzle'), 'click', StepPuzzle);
        buttons['stepPuzzle'] = Id('stepPuzzle').style.backgroundPosition;
        base.attach(Id('resetPuzzle'), 'click', ResetPuzzle);
        for (var action in actions) {
            base.attach(Id(action), 'click', (function(cmd) {
                return function() {
                    if(cmd == 'nop') {
                        DND.drop(); return;
                    }
                    if(cmd != DND.actor.puzzleAction)
                        DND.grab(DND.actor.puzzlePredicate, cmd);
                    else if(DND.actor.puzzlePredicate != 'nop')
                        DND.grab(DND.actor.puzzlePredicate, 'nop');
                    else
                        DND.drop();
                }
            })(action));
        }
        for (var predicate in predicates) {
            if (predicate != "nop")
                base.attach(Id(predicate), 'click', (function(pred) {
                    return function() {
                        if(pred != DND.actor.puzzlePredicate)
                            DND.grab(pred, DND.actor.puzzleAction);
                        else if(DND.actor.puzzleAction != 'nop')
                            DND.grab('nop', DND.actor.puzzleAction);
                        else
                            DND.drop();
                    }
                })(predicate));
        }

        centerX = Id('robozzle').offsetWidth / 2 + Id('robozzle').offsetLeft;
        
        KeyControl.init();
        DND.init();
        Stack.init();
        stackLineWidth = 15;
    }
        
    // zobrazeni vyberu operace
    var OnProgramClick = function(e) {
        //uprava slaweet
        //var button = (e.which ? e.which : e.button)
        //if(button != 1) {
        //    DND.drop();
        //    return false;
        //}
        var pred = DND.actor.puzzlePredicate;
        var cmd = DND.actor.puzzleAction;
        if(!DND.isDragged()) {
            if(this.puzzlePredicate != 'nop' || this.puzzleAction != 'nop') {
                DND.grabbing = true;
                DND.grab(this.puzzlePredicate, this.puzzleAction);
                SetProgramBlock(this, ('nop-nop'));
                ResetPuzzle();
            }
            return;
        } else {
            //if((this.puzzlePredicate != 'gray' && pred == 'nop') || (this.puzzleAction != 'nop' && cmd == 'nop')) {
            if((this.puzzleAction != 'nop' && cmd != 'nop')) {
                DND.grab(this.puzzlePredicate, this.puzzleAction);
                SetProgramBlock(this, ((pred == 'nop' ? 'grey' : pred) + '-' + cmd));
                ResetPuzzle();
                return;
            }
        }
        if(pred == 'nop') {
            pred = (this.puzzlePredicate == 'nop' ? 'grey' : this.puzzlePredicate);
        }
        if(cmd == 'nop') {
            cmd = this.puzzleAction;
        }
        SetProgramBlock(this, (pred + '-' + cmd));
        ResetPuzzle();

        if(DND.inDrag() > 0)
            DND.toogleDropping(true);

        if((DND.actor.puzzleAction != 'nop' || DND.actor.puzzlePredicate != 'nop') && !DND.dropping) {
            DND.drop();
        }
    }

    // drag'n'drop by slaweet
    var DND = {
        init: function() {
            this.actor = Id('drag');
            this.style = this.actor.style;
            this.drop();
            base.attach(Id('body'), 'mousemove', this.onMouseMove);
            base.attach(Id('body'), 'mousedown', this.onMouseDown);
            base.attach(Id('body'), 'mouseup', this.onMouseUp);
            base.attach(Id('multidrag'), 'click', this.onToogleClick);
            this.mouseDown = 0;
            this.grabbing = false;
            this.toogleDropping(false);
        },

        toogleDropping: function(start) {
            if(start) {
                this.style.paddingLeft = '0px';
            } else if(this.dropping) {
                this.style.paddingLeft = '30px';
                if(this.inDrag() == 0) {
                    this.drop();
                } else {
                    this.dropFirstTo(this.actor);
                }
            }
            this.dropping = start;
        },

        drop: function() {
            SetProgramBlock(this.actor, 'nop');
            this.style.display = 'none';
            this.actor.innerHTML = '';
            this.style.width = 0 + 'px';
        },

        inDrag: function() {
            return this.actor.children.length;
        },
        
        dropFirstTo: function (block) {
            var first = this.actor.children[0];
            SetProgramBlock(block, (first.puzzlePredicate + '-' + first.puzzleAction));
            this.actor.removeChild(first);
            this.style.width = (30 * (this.inDrag())) + 'px';
        },

        grabMore: function (predicate, action) {
            $('#drag').append("<span></span> ");
            SetProgramBlock(this.actor.children[this.inDrag() -1], (predicate + '-' + action));
            this.style.width = (30 * (this.inDrag())) + 'px';
        },

        grab: function(predicate, action) {
            SetProgramBlock(this.actor, (predicate + '-' + action));
            this.style.display = 'block';
        },

        isDragged: function() {
            return this.style.display == 'block';
        },

        onToogleClick: function() {
            html.Cookie.create('multidrag', (this.checked ? 'checked' : ''), 365);
        },

        onMouseOver: function() {
            if(Id('multidrag').checked && DND.mouseDown > 0) {
                if(DND.grabbing && (this.puzzlePredicate != 'nop' || this.puzzleAction != 'nop')) {
                    DND.grabMore(this.puzzlePredicate, this.puzzleAction);
                    SetProgramBlock(this, ('nop-nop'));
                }
                if(DND.dropping && DND.inDrag() > 0) {
                    DND.dropFirstTo(this);
                }
                ResetPuzzle();
            }
        },

        onMouseDown:function() { 
            DND.mouseDown = 1;
        },

        onMouseUp:function() { 
            DND.mouseDown = 0;
            DND.grabbing = false;
            DND.toogleDropping(false);
        },

        onMouseMove: function(e) {
            if (e == null) 
                var e = window.event; 
            var drag = Id('drag');
            drag.style.left = (e.clientX + 3) + 'px';
            drag.style.top  = (e.clientY + 3) + 'px';
        },
    }

    // keyboard control by slaweet 
    var KeyControl = {
        actions: [],
        predicates: [],
        controls: ['runPuzzle', 'stepPuzzle', 'resetPuzzle'],

        init: function() {
            this.activeBlock = program[0][0];
            this.parseShorcutsFromTooltips();
            document.addEvent('keydown', this.onKeyDown);
            base.attach(Id('tooltips'), 'click', this.onTooltipsClick);
            if(Id('tooltips').defaultChecked)
                this.onTooltipsClick();
        },

        onTooltipsClick: function() {
            if(this == Id('tooltips'))
                html.Cookie.create('tooltips', (this.checked ? 'checked' : ''), 365);
            for (var action in actions) {
                 $(Id(action).children[0]).fadeToggle();
            }
            for (var predicate in predicates) {
                if (predicate != "nop")
                    $(Id(predicate).children[0]).fadeToggle();
            }
            for (var key in KeyControl.controls) {
                if(key.length == 1)
                    $(Id(KeyControl.controls[key]).children[0]).fadeToggle();
            }
            KeyControl.setActiveBlock(KeyControl.activeBlock); //just to highlight activeBlock if not used before
        },

        parseShorcutsFromTooltips: function() {
            for (var action in actions) {
                this.actions[Id(action).children[0].innerHTML] = action;
            }
            for (var predicate in predicates) {
                if (predicate != "nop")
                    this.predicates[Id(predicate).children[0].innerHTML] = predicate;
            }

            var temp = [];
            for (var key in this.controls) {
                if(key - 0 == key) {//test if is a number
                    var shortcut = Id(this.controls[key]).children[0].innerHTML; 
                    temp[shortcut] = this.controls[key];
                }
            }
            this.controls = temp;
        },

        setActiveBlock: function(block) {
            if(this.activeBlock) $(this.activeBlock).removeClass('active');
            this.activeBlock = block;
            $(this.activeBlock).addClass('active');
        },

        setAction: function(cmd) {
                var p = this.activeBlock.puzzlePredicate;
                SetProgramBlock(this.activeBlock, ((cmd != 'nop' && p != 'nop') ? p + '-' : '') + cmd);
                ResetPuzzle();
        },

        setPredicate:  function(pred) {
                SetProgramBlock(this.activeBlock, pred + '-' + this.activeBlock.puzzleAction);
                ResetPuzzle();
        },

        move : function(deltaFunc, deltaStep) {
           var pos = this.activeBlock.pos.split(',');
           var func = parseInt(pos[0]) + deltaFunc;
           var step = parseInt(pos[1]) + deltaStep;
           if (step < 0)  step = puzzle.subs[func] - 1;
           if (func < 0)  func = puzzle.subs.filter(function(x) {return x > 0}).length -1;
           if (puzzle.subs.length <= func || puzzle.subs[func] == 0) func = 0;
           if (step >= puzzle.subs[func]) {
               if (deltaFunc == 0) step = 0;
               else step = puzzle.subs[func] -1;
           }
           this.setActiveBlock(program[func][step]);
        },

        handleKeyDown: function (event) {
            var cmd = this.actions[event.key];
            if(cmd) {
                if (Id(cmd).style.visibility != 'hidden')
                    this.setAction(cmd); 
                return;
            }
            var pred = this.predicates[event.key];
            if(pred) {
                this.setPredicate(pred); 
                return;
            }
            var cont = this.controls[event.key];
            if(cont) {
                eval(cont.charAt(0).toUpperCase() + cont.slice(1) + '()')
            }
        },

        onKeyDown: function(event){
            switch (event.key) {
                case 'down':  KeyControl.move(1,0); event.stop(); break;
                case 'up'  : KeyControl.move(-1,0); event.stop(); break;
                case 'left': KeyControl.move(0,-1); event.stop(); break;
                case 'right': KeyControl.move(0,1); event.stop(); break;
                case 'esc': DND.drop(); break;
                case 'delete': KeyControl.setAction('nop'); break;
                //other shorcuts are parsed from HTML structure of controls (see 'parseShorcutsFromTooltips')
                default: KeyControl.handleKeyDown(event);
            }
        },
    }
    var SetLanguage = function(lang) {
        switch (lang) {
        case 'en': alerts = {
                    outOfBoard: "Robotanik hit the edge of the board and got stuck.",
                    tooManySteps: "Problem has to be solved in less than 1000 steps.",
                    onStones: "Robotanik have run on stones and got stuck.",
                };
                break;
        default:
        case 'cs': alerts = {
                    outOfBoard: "Robotanik narazil na hranu herniho planu a zasekl se.",
                    tooManySteps: "Uloha musi byt vyresena v mene jak 1000 krocich.",
                    onStones: "Robotanik vjel na kameny a zasekl se.",
                };
                break;
        }
    }

    // nahrani konkretniho zadani
    var LoadPuzzle = module.LoadPuzzle = function(p, solution) {
        puzzle = p;
        SetLanguage(p.lang);
        Id('puzzleTitle').innerHTML = puzzle.title;
	Id('puzzleAbout').innerHTML = puzzle.about;
        stars = steps = 0;
        stack = [{ func: 0, step: 0}];
        for (var x = 0; x < width; ++x)
            for (var y = 0; y < height; ++y)
            SetCell(x, y, puzzle.board.charAt(y * width + x));
        col = puzzle.robotCol;
        row = puzzle.robotRow;
        dir = puzzle.robotDir;
        Robot.init();
        Robot.animate();
        for (var func = 0; func < maxSubs; ++func) {
            if (puzzle.subs[func] > 0) {
                Id('sub' + (func + 1)).style.display = 'block';
                Id('f' + (func + 1)).style.visibility = 'visible';
            } else {
                Id('sub' + (func + 1)).style.display = 'none';
                Id('f' + (func + 1)).style.visibility = 'hidden';
            }
            for (var step = 0; step < maxSubLength; ++step) {
                if (solution !== undefined) SetProgram(func, step, 'nop');
                try {
                    base.detach(program[func][step], 'mousedown', OnProgramClick);
                    base.detach(program[func][step], 'mouseover', DND.onMouseOver);
                } catch (e) { }
                HighlightStep(func, step, false);
                var p = program[func][step];
                if (step >= puzzle.subs[func]) {
                    SetSprite(program[func][step], programSprites['unavailable']);
                    p.style.display = 'none';
                } else {
                    p.style.deisplay = 'inline';
                    p.pos = func + ',' + step;
                    base.attach(program[func][step], 'mousedown', OnProgramClick);
                    base.attach(program[func][step], 'mouseover', DND.onMouseOver);
                }
            }
        }
        if (solution !== undefined)
            for (var func = 0; func < solution.length; ++func)
            if (solution[func].length > 0) {
            var funcSteps = solution[func].split(' ');
            for (var step = 0; step < funcSteps.length; ++step)
                SetProgram(func, step, funcSteps[step]);
        }
        HighlightStep(stack[0].func, stack[0].step, true);
        //Id('resources').style.display = 'none';
        Id('paintred').style.visibility = (puzzle.allowedCommands & 1) ? 'visible' : 'hidden';
        Id('paintgreen').style.visibility = (puzzle.allowedCommands & 2) ? 'visible' : 'hidden';
        Id('paintblue').style.visibility = (puzzle.allowedCommands & 4) ? 'visible' : 'hidden';
        PuzzleFinished(false);
    }

    return module;
})();
