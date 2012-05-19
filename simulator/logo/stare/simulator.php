<?

?>

<script type="text/javascript" src="simulator/logo/compat.js"></script> <!-- ECMAScript 5 Functions -->
<script type="text/javascript" src="simulator/logo/canvastext.js"></script> <!-- Canvas text functions c/o Hershey fonts -->
<script type="text/javascript" src="simulator/logo/logo.js"></script> <!-- Logo interpreter -->
<script type="text/javascript" src="simulator/logo/turtle.js"></script> <!-- Canvas turtle -->
<!-- <script type="text/javascript" src="simulator/logo/feed.js"></script> <\!-- Atom feed to HTML -\-> -->
<script type="text/javascript"><!--

var g_logo;
var g_entry;

function onenter()
{
    var e = g_entry;
    var v = g_entry.value;
    if( v !== "" )
    {
        var log = document.getElementById("log");
        log.innerHTML = log.innerHTML + v + "\n";

        try {
            g_logo.run(v);
        }
        catch (e) {
            window.alert("Error: " + e);        
        }
    }
}


window.onload = function() {

    var stream = {
        read: function(s) {
            return window.prompt(s ? s : "");
        },
        write: function() {
            var div = document.getElementById('overlay');
            for (var i = 0; i < arguments.length; i += 1) {
                div.innerHTML += arguments[i];
            }
            div.scrollTop = div.scrollHeight;
        },
        clear: function() {
            var div = document.getElementById('overlay');
            div.innerHTML = "";
        },
        readback: function() {
            var div = document.getElementById('overlay');
            return div.innerHTML;
        }
    };

    var canvas = document.getElementById("sandbox");
    var turtle = new CanvasTurtle(canvas, canvas.width, canvas.height);
    g_logo = new LogoInterpreter(turtle, stream);

    document.getElementById('run').onclick = onenter;
    document.getElementById('reset').onclick = function() { g_logo.run("home clean"); };

    
    g_entry = document.getElementById('entry_multi');
    g_entry.onkeydown = onkey;
    g_entry.focus();

};
//-->
</script>

<style type="text/css">
h1, h2, h3, p { margin-bottom: 6pt; margin-top: 6pt; }
body, p, h1, h2, h3 { font-family: sans-serif; }
dt, dd { font-size: 8pt; }
code { font-family: monospace; }
#guide {
    position: absolute;
    right:10px;
    top: 10px;
    width: 300px;
    /*height: 400px;*/

    padding: 5pt;
    padding-top: 0px;

    z-index: 10;

    color: black;
    background-color: white;
    border: solid 1px black;
}

</style>

<!-- Pozn - pri zmene rozmeru nezapomenout zmenit overlay -->

<h2>Výsledný obrazec</h2>
<img src="simulator/logo/priklady/<?=$instance_plan?>.png" width=300 />

<table>
<tr>

<td>Zadej příkazy:
  <div id="input" style="width: 300px; padding: 0; padding-top: 5px;">
    <!-- <input id="entry_single" type="text" style="width: 660px; font-family: monospace; display: none;" /> -->
    <textarea rows="20" cols="80" id="entry_multi" style="width: 300px; height: 400px; font-family: monospace; "></textarea><br>
    <input id="run" class="button" type="button" value="Proveď" title="Run the specified
    						    statements" />
    <input id="reset" class="button" type="button" value="Reset" style="margin-left: 20px">
  </div>
</td>

<td>
    <div id="display" style="width: 400px; height: 400px;">
        <canvas id="sandbox" width="400" height="400" style="position: absolute; border: solid 1px black;">
            <span style="color: red; background-color: yellow; font-weight: bold;">Your browser does not support the canvas element - sorry!</span>
        </canvas>
        <div id="overlay" style="width: 400px; height: 400px; padding: 10px; margin: 0; position: absolute; z-index: 2; background-color: transparent; overflow: hidden; white-space: pre-wrap; font-family: Monospace;"></div>
    </div>
</td> 

</tr>
</table>
    
<pre id="log" style="display: none; border: 1px solid black; width: 760px; height: 400px; overflow: scroll;"> 
</pre>
 
