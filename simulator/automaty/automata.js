/*
* Author: Vít Stanislav<slaweet@mail.muni.cz> 
* Year: 2012
* compatibility: Mozilla Firefox, Opera, Google Chrome, Safari, Microsoft Internet Explorer 9
* works, but slowly: MSIE 8, MSIE 7
*/

/*
//damn MSIE
const HOLDER_WIDTH = 640;
const HOLDER_HEIGHT = 480;
const CARD_HEIGHT = 40;
*/

var HOLDER_WIDTH = 640;
var HOLDER_HEIGHT = 480;
var CONTROLS_WIDTH = 245;
var CONTROLS_HEIGHT = 65;
var CARD_HEIGHT = 40;
var SLIDER_WIDTH = 120;
var NORMAL_OPACITY = 0.2;
var HOVER_OPACITY = 0.4;
var STATE_RADIUS = 30;
var LABEL_RADIUS = 10;
var ANIMATION_TIME = 200;
var GOOD_COLOR = "#26bf00";
var BAD_COLOR = "#bf0000";
var NEUTRAL_COLOR = "#fff";
var START_Y = 200;

var BUNDLE = {
    "en":{ 
    "start": "start",
    "no-start": "There is no state at the start",
    "conditions": "Requirements",
    "use-regexp": "Sestavte konečný automat rozpornávající jazyk zadaný regulárním výrazem" 
    },
    "cs":{ 
    "grammar": "generuje gramatika",
    "start": "start",
    "no-start": "Na startu není žádný stav",
    "conditions": "Sestrojte automat přijímající každé slovo, které",
    "use-regexp": "Sestavte konečný automat rozpornávající jazyk zadaný regulárním výrazem" 
    }
}
var r; //global var for the raphael object;

// cookie manager

var Cookie = {
    create: function (name,value,days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
    },

    read: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    },

    erase: function (name) {
        createCookie(name,"",-1);
    },
    
    readOrDefault: function(name, def) {
        var cookie = Cookie.read(name);
        return ((cookie == null) ? def : cookie);
    }
}

// manager of automata

var AutomataManager = {
    wordsIndex: 0,
    animPos: 0,
    maxTestedWordLength: -1,
    init: function(task) {
        for (var i in BUNDLE) {
            Lang.setBundle(i, BUNDLE[i]);
        }

        this.maxTestedWordLength = task.maxTestedWordLength || -1;
        this.paper = Raphael("holder", HOLDER_WIDTH, HOLDER_HEIGHT);
        this.controlsPaper = Raphael("controls", CONTROLS_WIDTH, CONTROLS_HEIGHT);
        r = this.paper;
        var c = this.controlsPaper.controls();
        this.playButton = c.playButton;
        this.slider = c.slider;
        this.stateStack = this.paper.stateStack(-10, HOLDER_HEIGHT - 50, task.maxStatesCount, task.alphabet || task.automata.alphabet);
        this.automata = Automata;
        this.words = task.words || [];
        this.regexp = new RegExp('^'+task.regexp+'$');
        for (var i = 0; i < this.words.length; i++) {
            this.addWord(this.words[i], i);
        }
        var defaultAutomata = {"stateCount":1,"alphabet":task.alphabet,"delta":[],"init":"0","accepting":[]};
        this.initAutomata(task.automata || defaultAutomata);
        if (task.text && task.text == 'regexp') {
            $('#text').html(Lang.get('use-regexp') + ': <br><b>' + task.regexp + '</b>');
        } else if (task.text) {
            $('#text').html(Lang.get('conditions') + ' ' + task.text.replace("G = ",Lang.get('grammar')+":\n G = ").replace(/\n/g, "\n<br>"));
        }
    },
    initAutomata: function(automata) {
        this.start = this.paper.start(0, START_Y, this.maxTestedWordLength <= -1);
        this.automata.token = this.paper.token(-25, START_Y, this);
        if (automata == undefined) {
            return;
        }
        var statesInRow = Math.floor(HOLDER_WIDTH / 150);
        var y = 0;
        var x = (statesInRow - automata.stateCount) * 75 + 90;
        for (var i = 0; i < automata.stateCount; i++) {
            var state = this.stateStack.getState();
            x += 150;
            if (i % statesInRow == 0) {
                y += 150;
                x = (i != 0 && automata.stateCount - i < statesInRow ? (statesInRow - automata.stateCount + i) * 75 : 0) + 90;

            }
            state.moveTo({x: x, y:y})
            this.automata.addState(state);
        }
        this.setInit(this.automata.states[automata.init]);

        for (var i = 0; i < automata.accepting.length; i++) {
            this.automata.states[automata.accepting[i]].toggleAccepting();
        }
        for (var i = 0; i < automata.delta.length; i++) {
            var f = automata.delta[i];
            var conn = this.automata.states[f.from].getConnectionTo(this.automata.states[f.to]);
            var label = this.automata.states[f.from].labels[f.char];
            conn.addLabel(label)
            this.automata.addEdge(label);
        }
    },
    addWord: function(word) {
        var wordSpan = ""
        var accepted = this.shouldBeAccepted(word) ? "good" : "bad";
        for (var i = 0; i < word.length; i++) {
            wordSpan += '<span class="letter">'+word.charAt(i)+'</span>';
        }
        $("#words>div").append('<span class="word '+accepted+'" id="w'+word+'">'+wordSpan+'<span class="info"></span></span>');
        $("#w"+word).css({cursor: "pointer"}).click(function() {
            AutomataManager.playButton.start(this.id.substring(1));
        });
    },
    run: function(word) {
        if (word != undefined) {
            this.wordsIndex = this.words.indexOf(word);
        } else if (this.checkIfDone(this.words) && this.checkIfDone(this.getAllWords(this.stateStack.alphabet, this.maxTestedWordLength))) {
            //alert("succes!");
            var q = "session_id="+id_game+"&session_hash="+check_hash+"&move_number="+this.moveCount+"&win=1";
            sendDataToInterface(q);
            after_win();
            this.wordsIndex = this.words.length -1;
            return;
        } 
        if (this.animPos == 0) {
            this.automata.run(this.words[this.wordsIndex++ % this.words.length]);
        } else {
            this.automata.token.moveTo(this.animPos);
        }
    },
    shouldBeAccepted: function(word) {
        return this.regexp.test(word);
    },
    checkIfDone: function(words) {
        for (var i = 0; i < words.length; i++) {
            var isAccepted = this.automata.isAccepted(words[i]);
            if (this.shouldBeAccepted(words[i]) != isAccepted) {
                if (this.words.indexOf(words[i]) == -1) {
                    this.addWord(words[i]);
                    this.words.push(words[i]);
                }
                this.wordsIndex = this.words.indexOf(words[i]);
                return false;
            } else {
                this.setWordResult(words[i], isAccepted);
            }
        }
        return true;
    },
    reset: function() {
        this.automata.token.attr({cx: 50, cy: -50});
        this.animPos = 0;
        for (var i = 0; i < this.words.length; i++) {
            this.setWordColor(this.words[i], NEUTRAL_COLOR);
        }
        this.taskPrint();
    },
    taskPrint: function() {
        var a = {
            stateCount: this.automata.states.length,
            alphabet: this.stateStack.alphabet,
            delta: this.automata.getEdgesToPrint(),
            init: this.automata.init && this.automata.init.name[1],
            accepting: this.automata.getAcceptingStates()
        }
        $("#debug").text(JSON.encode(a));
    },
    setWordColor: function(word, color) {
        $("#w"+word).css({color: color});
    },
    setWordResult: function(word, isAccepted) {
        var shouldBe = this.shouldBeAccepted(word);
        var isCorrect = isAccepted == shouldBe;
        $("#w"+word + " .info").css({'background-position': "0px " + (isCorrect ? -25 : 0) + 'px'});
        this.setWordColor(word, isAccepted ? GOOD_COLOR : BAD_COLOR);
    },
    getAllWords: function(alphabet, maxLength) {
        var words = maxLength >= 0 ? [''] : [];
        var prewLengthWords = [''];
        for (var i = 1; i <= maxLength; i++) {
            var currLengthWords = [];
            for (var j = 0; j < prewLengthWords.length; j++) {
                for (var k = 0; k < alphabet.length ; k++) {
                    currLengthWords.push(prewLengthWords[j] + alphabet[k]);
                }
            }
            words = words.concat(currLengthWords);
            prewLengthWords = currLengthWords;
        }
        return words;
    },

    setInit: function(state) {
        this.automata.init = state;
        var pos = this.start.getPos();
        pos.x += state.getRadius() + (state.isAccepting ? 5 : 0)+2;
        state.moveTo(pos);
    }
}

var Automata = {
    states: [],
    edges: [],
    word: "",
    init: null,
    addState: function(state) {
        this.states.push(state)
    },
    removeState: function(state){
        this.states.splice(this.states.indexOf(state), 1);
        for (var i = 0; i < state.connections.length; i++) {
            for (var j = 0; j < state.connections[i].labels.length; j++) {
                this.removeEdge(state.connections[i].labels[j]);
            }
        }
        AutomataManager.stateStack.getBack(state);
    },
    addEdge: function(label){
        this.edges.push(label);
    },
    removeEdge: function(label){
        this.edges.splice(this.edges.indexOf(label), 1);
    },
    getEdgesToPrint: function(){
        var edges = [];
        for (var i = 0; i < this.edges.length; i++) {
            var label = this.edges[i];
            var edge = {
                from: this.states.indexOf(label.connection.from),
                to: this.states.indexOf(label.connection.to),
                char: label.name
            }
            if (edge.from > -1) {
                edges.push(edge)
            }
        }
        return edges;
    },
    run: function(word){
        if (this.init == null) {
            alert(Lang.get('no-start')); 
            AutomataManager.playButton.stop();
            return;
        }
        this.token.toFront();
        this.lastState = this.init;
        this.word = word;
        this.wordIndex = 0;
        this.animateArrow();
        this.token.moveToHome();
        var pos = this.init.getPos();
        this.token.animate({cx: pos.x, cy: pos.y}, 5000 / AutomataManager.slider.speed(), function(){
            this.manager.automata.animate(); 
        });
    },
    animate: function() {
        var symbol = this.word.charAt(this.wordIndex++);
        var line = this.lastState.getLineWithLabel(symbol);
        if (line == null) {
            var isAccepted = this.lastState.isAccepting && symbol == "";
            var color = isAccepted ? GOOD_COLOR : BAD_COLOR;
            this.token.setColor(color);
            AutomataManager.setWordResult(this.word, isAccepted);
            AutomataManager.playButton.stop();
        } else {
            this.animateArrow();
            this.lastState = line.to;
            this.token.setPath(line.line);
            this.token.moveTo(0);
        }
    },
    animateArrow: function() {
            var pos = $("#w"+this.word).position();
            var letterWidth = 22;
            var marginLeft = 10;
            pos.left += marginLeft + letterWidth * (this.wordIndex);
            $("#arrow").animate(pos, 5000 / AutomataManager.slider.speed());
    },
    getAcceptingStates: function(){
        var acc = [];
        for (var i = 0; i < this.states.length; i++) {
            if (this.states[i].isAccepting) {
                acc.push(i);
            }
        }
        return acc;
    },
    isAccepted: function(word) {
        if (this.init == null) return false;
        var state = this.init;
        for (var i = 0; i < word.length; i++) {
            var symbol = word.charAt(i);
            var line = state.getLineWithLabel(symbol);
            if (line == null) {
                return false;
            }
            state = line.to;
        }
        return state.isAccepting === true;
    }
}

// Circle for the animation of running automata 

Raphael.fn.token = function (x, y, manager) {
    token = this.circle(x, y, 20).attr({"fill-opacity": .5, "stroke-width": 2});
    
    token.manager = manager;
    token.moveTo = function(length){
        var p = this.path.getPointAtLength(length);
        this.animate({cx: p.x, cy: p.y}, 50, function(){
            if(!this.manager.playButton.paused) {
                if(length < this.pathLength)
                    this.moveTo(length + this.manager.slider.speed())
                else {
                    this.manager.animPos = 0;
                    this.manager.automata.animate();
                }
            } else {
                this.manager.animPos = length + this.manager.slider.speed();
            }
        });
    }
    token.setColor = function(color) {
        this.attr({stroke: color, fill: color});
    }
    token.moveToHome = function() {
        this.attr({cx: x, cy: y});
        this.setColor(NEUTRAL_COLOR);
    }
    token.setPath = function(line) {
        this.path = line;
        this.pathLength = line.getTotalLength();
    }
    token.moveToHome();
    return token;
}

// start arrow

Raphael.fn.start = function (x,y, showText) {
    var color = NEUTRAL_COLOR;
    var start = {
        text: showText && this.text(x +20, y + 10, Lang.get('start')).attr({"font-size": 15, "fill": color}),
        line: this.path(['M', x, y, 'l', 60, 0].join()).attr({"stroke-width": 2, "stroke": color}),
        arrow: this.path(['M', x + 60, y, 'l', -20, 10, 10, -10, -10, -10, 20, 10].join()).attr({"stroke": color, "fill": color}),
        overlapesWith: function(state) {
            var pos = state.getPos();
            return pos.x < x+120 && Math.abs(pos.y-y) < 40;
        },
        getPos: function() {
            return {x: 60, y: y};
        }
    }
    return start;
}
//rect for new states in the bottom

Raphael.fn.stateStack = function (x, y, maxStates, alphabet) {
    hoverIn = function() {
        this.isHovered = true;
        var state = this.stack.states[0];
        if (state) {
            state.moveTo({x: x+50, y: y+40}, ANIMATION_TIME);
        }
    },
    hoverOut = function() {
        this.isHovered = false;
        this.animate({x: this.attr("x")}, 500, function() {
            var state = this.stack.states[0];
            if(state && !state.fg.inDrag && !this.isHovered) {
                state.moveTo({x: x+50, y: y+60}, ANIMATION_TIME);
            }
        })
    },
    start = function () {
        var state = this.stack.states[0];
        if (state) {
            state.fg.startMove();
        }
    },
    onMove = function (dx, dy) {
        var state = this.stack.states[0];
        if (state) {
            state.fg.onMove(dx,dy);
        }
    },
    up = function () {
        var state = this.stack.getState(ANIMATION_TIME);
        if (state) {
            state.fg.stopMove();
            AutomataManager.automata.addState(state);
            if (state.getPos().y >= y) {
                state.moveTo({x: x+50, y: y-40}, ANIMATION_TIME);
                state.bg.updateRadius();
                state.moveLabelsToHome();
            }
        }
    }
    var stack = {
        states: [],
        rect: this.rect(x,y,100,100,5).attr({stroke: "#aaa", "stroke-width": 5, fill: "#aaa", "fill-opacity": NORMAL_OPACITY, "cursor": "pointer"}),
        paper: this,
        maxStates: maxStates || Number.MAX_VALUE,
        next: 0,
        alphabet: alphabet,
        getState: function(time) {
            var state = this.states.shift();
            if (this.next < this.maxStates) {
                if (this.states.length == 0) {
                    this.createState(time);
                }
                this.states[0].moveTo({x: x+50, y: y+60}, time);
            } else {
                this.rect.attr({ "cursor": "default"});
            }
            return state; 
        },
        createState: function(time) {
            var state = this.paper.state(x + 50, y + 90, "s"+this.next++, this.alphabet);
            this.states.push(state);
            this.rect.toFront();
        },
        overlapesWith: function(state) {
            var pos = state.getPos();
            return pos.x < x+100 && pos.y > y;
        },
        getBack: function(state) {
            this.states[0] && this.states[0].moveTo({x: x+50, y: y+90}, ANIMATION_TIME);
            this.states.unshift(state);
            state.moveTo({x: x+50, y: y+40}, ANIMATION_TIME);
            while (state.connections.length > 0) {
                state.connections[0].remove();
            }
            this.rect.attr({ "cursor": "move"});
        }
    }
    stack.rect.stack = stack;
    stack.rect.hover(hoverIn, hoverOut);
    stack.rect.drag(onMove, start, up);
    stack.createState();
    stack.states[0].moveTo({x: x+50, y: y+60});
    return stack;
}

//state of an automata

Raphael.fn.state = function (x, y, name, alphabet) {
    var start = function () {
        if (AutomataManager.automata.init == this.parent) {
            AutomataManager.automata.init = null;
        }
        this.inDrag = true;
        this.ox = this.attr("cx");
        this.oy = this.attr("cy");
        this.animate({"fill-opacity": HOVER_OPACITY}, ANIMATION_TIME);
    },
    onMove = function (dx, dy) {
        if (this.ox + dx < 0 )
            dx = -this.ox;
        else if (this.ox + dx > HOLDER_WIDTH)
            dx = HOLDER_WIDTH - this.ox;
        if (this.oy + dy < 0)
            dy = -this.oy;
        else if (this.oy + dy > HOLDER_HEIGHT)
            dy = HOLDER_HEIGHT - this.oy;
        this.parent.moveTo({x: this.ox + dx, y: this.oy + dy});
    },
    up = function () {
        this.animate({"fill-opacity": NORMAL_OPACITY}, ANIMATION_TIME);
        this.inDrag = false;
        if (AutomataManager.start.overlapesWith(this.parent)) {
            AutomataManager.setInit(this.parent)
        }
        if (AutomataManager.stateStack.overlapesWith(this.parent)) {
            AutomataManager.automata.removeState(this.parent);
        } else {
            this.parent.hoverIn();
        }
        //workaround for doubleclick
        var time =  new Date().getTime();
        if (time - this.lastClickTime < 500) {
            this.parent.toggleAccepting();
        }
        this.lastClickTime = time;
    },
    hoverIn = function() {
        this.isHovered = true;
        if(!this.inDrag) {
            this.animate({"fill-opacity": HOVER_OPACITY}, ANIMATION_TIME);
            this.parent.hoverIn();
        }
        AutomataManager.reset();
    },
    hoverOut = function() {
        this.isHovered = false;
        this.animate({r: this.attr("r")}, 500, function() {
            if(!this.isHovered && !this.inDrag) {
                this.animate({"fill-opacity": NORMAL_OPACITY}, ANIMATION_TIME);
                this.parent.hoverOut();
            }
        });
    },
    color = '#bfac00';

    var state = {
        bg: this.circle(x, y, STATE_RADIUS).attr({fill: '#333', "fill-opacity": 1, stroke: color, "stroke-width": 3, cursor: "pointer"}),
        text: this.text(x, y, name).attr({"font-size": 30, 'fill': color}),
        fg: this.circle(x, y, STATE_RADIUS).attr({fill: color, stroke: color, "fill-opacity": NORMAL_OPACITY, "stroke-width": 3, cursor: "move"}),
        name: name,
        color: color,
        labels: {},
        connections: [],
        addConnection: function(conn) {
            this.connections.push(conn);
        },
        removeConnection: function(conn) {
            this.connections.splice(this.connections.indexOf(conn), 1);
        },
        getConnectionTo: function(to) {
            for (var i = 0; i < this.connections.length; i++) {
                if (this.connections[i].from == this && this.connections[i].to == to) {
                    return this.connections[i];
                }
            }
            return r.connection(this, to); 
        },
        getLineWithLabel: function(symbol) {
            for (var i = 0; i < this.connections.length; i++) {
                if (this.connections[i].getLabel(symbol) !=  null && this.connections[i].from == this) {
                    return this.connections[i];
                }
            }
            return null; 
        },
        getPos:  function() {
            return {x: this.fg.attr("cx"), y: this.fg.attr("cy")};
        },
        getRadius: function(withBg) {
            return this.fg.attr("r") + (withBg && this.isAccepting ? 5 : 0);
        },
        toFront: function() {
            this.bg.toFront();
            this.text.toFront();
            this.fg.toFront();
        },
        moveTo: function(pos, time) {
            var cpos =  {cx: pos.x, cy: pos.y};
            if (time != undefined) {
                this.fg.animate(cpos, time, function() {
                    this.parent.updateConnections();
                });
                this.bg.animate(cpos, time);
                this.text.animate(pos, time);
                this.moveLabelsTo(pos, time);
            } else{
                this.fg.attr(cpos);
                this.bg.attr(cpos);
                this.text.attr(pos);
                this.moveLabelsToHome();
                this.updateConnections();
            }
        },
        moveLabelsTo: function(pos, time) {
            for (var i in this.labels) {
                if (!this.labels[i].isUsed) {
                    this.labels[i].moveTo(pos, time);
                }
            }
        },
        moveLabelsToHome: function(time) {
            for (var i in this.labels) {
                this.labels[i].moveToHome(time);
            }
        },
        toggleAccepting: function() {
            this.isAccepting = !this.isAccepting; 
            this.bg.updateRadius();
            this.updateConnections();
            AutomataManager.reset();
        },
        updateConnections: function() {
            for (var i = 0; i < this.connections.length; i++) {
                r.connection(this.connections[i]);
            }
            r.safari();
        },
        hoverIn: function() { 
            var alpha = 2 * Math.PI / this.labelsLength;
            var j = 0;
            var r = this.getRadius() + 20;
            for (var i in this.labels) {
                if (!this.labels[i].isUsed) {
                    var pos = this.getPos();
                    pos.x += r * Math.sin(alpha * j);
                    pos.y += r * Math.cos(alpha * j);
                    this.labels[i].moveTo(pos, ANIMATION_TIME);
                }
                j++;
            }
            for (var i = 0; i < this.connections.length; i++) {
                this.connections[i].toBack();
            }
        },
        hoverOut: function() { 
            this.moveLabelsToHome(ANIMATION_TIME);
        },
        overlapesWith: function(obj) {
            var p1 = this.getPos();
            var p2 = obj.getPos();
            return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) <= Math.pow(this.getRadius() + obj.getRadius(), 2);
        }
    }

    for (var i = 0; i < alphabet.length; i++) {
        state.labels[alphabet[i]] = this.label(state, alphabet[i]);
    }
    state.moveLabelsToHome()
    state.labelsLength = alphabet.length;
    state.fg.drag(onMove, start, up);
    state.fg.hover(hoverIn, hoverOut);
    state.fg.startMove = start;
    state.fg.onMove = onMove;
    state.fg.stopMove = up;
    state.fg.parent = state;

    state.bg.parent = state;
    state.bg.updateRadius = function() {
        var shift = this.parent.isAccepting ? 5 : 0;
        this.animate({r: this.parent.getRadius() + shift}, ANIMATION_TIME);
    }
    return state;
}

// label with one alphabet symbol (part of a state)

Raphael.fn.label = function (state, name) {
     var start = function () {
        this.ox = this.attr("cx");
        this.oy = this.attr("cy");
        if (this.parent.isUsed) {
            AutomataManager.automata.removeEdge(this.parent);
            this.parent.connection.removeLabel(this.parent);
        }
        if (this.connection == undefined) {
            r.connection(this.parent.parent, this.parent);
        }
        this.parent.toFront();
        this.inDrag = true;
        AutomataManager.reset();
    },
    move = function(dx, dy) {
        this.parent.moveTo({x: this.ox + dx, y: this.oy + dy});
        r.connection(this.parent.connection);
        r.safari();
        this.parent.toFront();
    },
    up = function () {
        this.parent.isUsed = false;
        for (var i = 0; i < AutomataManager.automata.states.length; i++) {
            var to = AutomataManager.automata.states[i];
            if (to.overlapesWith(this.parent)) {
                var from = this.parent.connectedTo;
                this.parent.connection.remove();
                var conn = from.getConnectionTo(to);
                conn.addLabel(this.parent);
                this.inDrag = false;
                AutomataManager.automata.addEdge(this.parent);
                return;
            }
        }
        this.parent.rollBack();
        this.inDrag = false;
    },
    hoverIn = function() {
        this.isHovered = true;
        //this.animate({"fill-opacity": HOVER_OPACITY}, ANIMATION_TIME);
    },
    hoverOut = function() {
        this.isHovered = false;
        if (!this.inDrag) {
            //alert()
            this.parent.moveToHome(ANIMATION_TIME);
        }
        //this.animate({"fill-opacity": NORMAL_OPACITY}, ANIMATION_TIME);
    },

    x = state.getPos().x,
    y = state.getPos().y,
    color = state.color;

    var label = {
        bg: this.circle(x, y, LABEL_RADIUS).attr({fill: '#333', "fill-opacity": 1, stroke: color, "stroke-width": 3}),
        text: this.text(x, y, name).attr({"font-size": 15, "fill": color}),
        fg: this.circle(x, y, LABEL_RADIUS + 10).attr({fill: color, stroke: "none", "fill-opacity": 0, "stroke-width": 0, cursor: "move"}),
        name: name,
        parent: state,
        rollBack: function() {
            if (!this.connectedTo.overlapesWith(this)) {
                var pos = this.getPos();
                pos.x += (this.connectedTo.getPos().x - this.getPos().x)*0.29;
                pos.y += (this.connectedTo.getPos().y - this.getPos().y)*0.29;
                this.moveTo(pos, 2, function() {
                    r.connection(this.parent.connection);
                    this.rollBack();
                });
            } else {
                this.connection.remove();
                this.moveToHome(ANIMATION_TIME);
            }
        },
        moveToHome: function(time) {
            if(!this.fg.isHovered && !this.isUsed) {
                this.toBack();
                this.moveTo(this.parent.getPos(), time);
            }
        },
        moveTo: function(pos, time, callback) {
            var cpos = {cx: pos.x, cy: pos.y};
            if (time != undefined) {
                this.fg.animate(cpos, time, callback);
                this.bg.animate(cpos, time);
                this.text.animate(pos, time);
            } else {
                this.fg.attr(cpos);
                this.bg.attr(cpos);
                this.text.attr(pos);
            }
        },
        addConnection: function(conn) {
            this.connection = conn;
            this.connectedTo = conn.from;
        },
        removeConnection: function() {
            delete this.connection;
            delete this.connectedTo;
        },
        toFront: function() {
            this.bg.toFront();
            this.text.toFront();
            this.fg.toFront();
        },
        toBack: function() {
            this.fg.toBack();
            this.text.toBack();
            this.bg.toBack();
        },
        getPos: function() {
            return {x: this.fg.attr("cx"), y: this.fg.attr("cy")};
        },
        getRadius: function() {
            return this.bg.attr("r");
        }
    }
    label.fg.drag(move, start, up);
    label.fg.hover(hoverIn, hoverOut);
    label.fg.parent = label;
    label.fg.rollBack = function(){this.parent.rollBack()}
    return label;
};

// The white line with arrow between two states.

Raphael.fn.connection = function (obj1, obj2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }

    var x1 = obj1.getPos().x,
        y1 = obj1.getPos().y,
        x4 = obj2.getPos().x,
        y4 = obj2.getPos().y;
    if (obj1.overlapesWith(obj2)) {
        var shift = 100
        var x2 = x1 - shift,
            y2 = y1 - shift,
            x3 = x4 + shift,
            y3 = y4 - shift;
    } else {
        var a = x1 - x4;
        var b = y1 - y4;
        var c = Math.sqrt(a*a + b*b); 
        var sinAlpha = b/c;
        var alpha = Math.asin(sinAlpha);
        alpha += Math.PI/10 * (x4 <= x1 ? -1 :1);
        var x2 = x1 + c/2 * Math.cos(alpha) * (x1 < x4 ? 1 : -1),
            y2 = y1 - c/2 * Math.sin(alpha),
            x3 = x2,
            y3 = y2;
    }
    var path = ["M", x1, y1, "C", x2, y2, x3, y3, x4, y4].join(",");
    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
        line.positionLabels();
    } else {
        var color = typeof line == "string" ? line : "#fff";
        var ret = {
            arrow: this.path("").attr({stroke: color, fill: color, "stroke-width": 0.5 }),
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            line: this.path(path).attr({stroke: color, fill: "none", "stroke-width": 2 }),
            from: obj1,
            to: obj2,
            labels: [],
            remove: function () {
                for (var i = 0; i < this.labels.length; i++) {
                    this.labels[i].removeConnection();
                    this.labels[i].isUsed = false;
                    this.labels[i].moveToHome(ANIMATION_TIME);
                }
                this.line.remove();
                this.arrow.remove();
                this.from.removeConnection(this);
                this.to.removeConnection(this);
            },
            addLabel: function(label) {
                label.isUsed = true;
                label.connection = this;
                this.labels.push(label);
                this.positionLabels(ANIMATION_TIME);
            },
            getLabel: function(name) {
                for (var i = 0; i < this.labels.length; i++) {
                    if (this.labels[i].name == name) {
                        return this.labels[i];
                    }
                }
                return null;
            },
            removeLabel: function(label) {
                label.removeConnection();
                this.labels.splice(this.labels.indexOf(label), 1);
                if (this.labels.length <= 0) {
                    this.remove();
                } else {
                    this.positionLabels(ANIMATION_TIME);
                }
            },
            positionLabels: function(time) {
                var step = 30;
                var offset = this.line.getTotalLength()/2 - (this.labels.length-1) * step/2;
                for(var i = 0; i < this.labels.length; i++) {
                    var pos = this.line.getPointAtLength(offset + i*step);
                    this.labels[i].moveTo(pos, time);
                    this.labels[i].toFront();
                }
                this.positionArrow();
            },
            positionArrow: function() {
                var arrowSize = 10;
                var length = this.line.getTotalLength();
                var start = this.line.getPointAtLength(length - this.to.getRadius(true) - 2);
                var end = this.line.getPointAtLength(length - this.to.getRadius(true) - (arrowSize +2));

                var x1 = start.x,
                    y1 = start.y,
                    x4 = end.x,
                    y4 = end.y;
                var a = x1 - x4;
                var b = y1 - y4;
                var c = Math.sqrt(a*a + b*b); 
                var sinAlpha = b/c;
                var alpha = Math.asin(sinAlpha) + Math.PI/6;
                var x2 = x1 + 2*c * Math.cos(alpha) * (x1 < x4 ? 1 : -1),
                    y2 = y1 - 2*c * Math.sin(alpha),
                    x3 = x1 + 2*c * Math.cos(alpha - Math.PI/3) * (x1 < x4 ? 1 : -1),
                    y3 = y1 - 2*c * Math.sin(alpha - Math.PI/3);
                var attr = {path: ["M",x1, y1, "L", x2, y2, x4, y4, x3, y3, x1, y1].join(",")};
                this.arrow.attr(attr);
            },
            toBack: function() {
                this.arrow.toBack();
                this.line.toBack();
            }
        };
        ret.toBack();
        obj1.addConnection(ret);
        obj2.addConnection(ret);
        return ret;
    }
};

// Slider element to control animation speed

Raphael.fn.slider = function (x, y) {
    var start = function () {
        this.ox = this.attr("cx");
        this.inDrag = true;
    },
    move = function(dx, dy) {
        if(this.ox + dx > x + SLIDER_WIDTH) {
            this.attr({cx: x + SLIDER_WIDTH});
        } else if(this.ox + dx < x) {
            this.attr({cx: x});
        } else { 
            this.attr({cx: this.ox + dx});
        }
    },
    up = function () {
        this.inDrag = false;
        this.animate({fill: '#aaa', stroke: '#aaa'}, ANIMATION_TIME);
        Cookie.create('animationspeed', (this.attr('cx') - this.x), 365);
    },
    hoverIn = function() {
        this.animate({fill: color, stroke: color,"fill-opacity": .8}, ANIMATION_TIME);
    },
    hoverOut = function() {
        if(!this.inDrag)
            this.animate({fill: '#aaa', stroke: '#aaa'}, ANIMATION_TIME);
    },  
    attr = {fill: '#aaa', stroke: '#aaa', "fill-opacity": .0, "stroke-width": 3},
    color = '#26bf00',
    animationSpeed = parseInt(Cookie.readOrDefault('animationspeed','10')),
    slider = this.circle(x + animationSpeed, y + 2, 8); 
    slider.x = x;
    slider.line = this.rect(x, y, SLIDER_WIDTH, 4, 2).toBack();
    slider.line.attr(attr);
    slider.attr(attr);
    slider.attr({ "fill-opacity": .8, cursor: 'move'});
    slider.inDrag = false;
    slider.drag(move, start, up);
    slider.hover(hoverIn, hoverOut);
    slider.speed = function() {
        return (this.attr('cx') - this.x+1) /1;
    }
    return slider;
}

// Play/pause button to control the animation 

Raphael.fn.playButton = function (x, y) {
    var hoverIn = function() {
            button.animate({stroke: color,"fill-opacity": .3}, ANIMATION_TIME);
    },
    hoverOut = function() {
            button.animate({stroke: '#aaa',"fill-opacity": .0}, ANIMATION_TIME);
    },    
    color = '#26bf00',
    button = this.set();
    button.pause1 = this.rect(x + 22.5, y + 10, 10, CARD_HEIGHT/2, 1).hide(),
    button.pause2 = this.rect(x + 37.5, y + 10, 10, CARD_HEIGHT/2, 1).hide(),
    button.play = this.path("M"+ (x + 27.5) +","+ (y + 10) +"l20 10,-20 10z")
    button.rect = this.rect(x, y, 70, CARD_HEIGHT, 2),
    button.pause = this.set();
    button.pause.push(button.pause1, button.pause2);
    button.push(button.rect, button.pause, button.play);
    button.attr({fill: color, stroke: '#aaa', "fill-opacity": .0, "stroke-width": 3, 'cursor': 'pointer'});
    button.rect.hover(hoverIn, hoverOut);
    button.rect.click(function() {
            if(button.play.node.style.display !== "none") {
                button.start();
            } else {
                button.stop();
            }
    });
    button.start = function(word) {
        this.paused = false;
        this.play.hide();
        this.pause1.show();
        this.pause2.show();
        AutomataManager.run(word);
    }
    button.stop = function() {
        this.paused = true;
        this.play.show();
        this.pause1.hide();
        this.pause2.hide();
    }
    return button;
};

// Rectangle in upper right corner with play/pause button and speed slider

Raphael.fn.controls = function () {
    var x =  10,
        y =  -10,
        controls = this.rect(x, y, CONTROLS_WIDTH, CONTROLS_HEIGHT, 10);
    controls.attr({stroke: '#aaa', "stroke-width": 5});
    controls.playButton = this.playButton(x + 10, y + 15);
    //controls.slider = this.speedMeter(x + 160, y + 50);
    controls.slider = this.slider(x + 100, y + 35);
    return controls;
};



