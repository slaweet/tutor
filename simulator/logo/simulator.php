<?
list($solution,$inittext) = Explode ("#",$instance_plan);
$newlines   = array("\r\n", "\n", "\r");
#$solution = str_replace($newlines, "\\n", $solution);
$solution = str_replace($newlines, "@", $solution);
$lang = $_SESSION["lang"];
if ($lang != "cz" and $lang != "en") { $lang = "cs"; }

echo '
<script>
			var session_id = "'.$session_id.'"; 	
			var check_hash = "'.$session_hash.'"; 	
			var lang = "'.$lang.'";
			var qt42 = "'.strrev($solution).'";			
</script>
  <script src="simulator/logo/lang/'.$lang.'/translation.js"></script>	    
';


?>

 <link href="simulator/logo/lib/jquery-ui-1.8.6/jquery-ui-1.8.6.custom.css" rel="stylesheet" type="text/css"  />    
 <link href="simulator/logo/css/style.css" rel="stylesheet" type="text/css">    

  <script src="simulator/logo/lib/jquery-1.4.2/jquery-1.4.2.min.js"></script>
  <script src="simulator/logo/lib/jquery-canvas-1.1/jquery.canvas.js"></script>
  <script src="simulator/logo/lib/jquery-ui-1.8.6/jquery-ui-1.8.6.custom.min.js"></script>

  <script src="simulator/logo/lib/code-mirror-0.9/js/codemirror.js"></script>
  <script src="simulator/logo/js/functions.js"></script>
  <script src="simulator/logo/js/turtle.js"></script>
  <script src="simulator/logo/js/parserSource.js"></script>	 
  <script src="simulator/logo/js/hash.js"></script>	 
    <script src="simulator/logo/examples/examples.js"></script>     
    <script src="simulator/logo/js/userInterface.js"></script>

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

   <div id="wrapper">
      <div id="head">
            <div id="status"></div>
            <div id="toolbar" class="ui-widget-header ui-corner-all">                
                <button id="play">Run</button>
                <button id="debug">Debug</button>

                <input type="checkbox" id="pause" /><label for="pause">Pause</label>
                <button id="stop">Stop</button>
                <input type="checkbox" id="timerButton" checked="checked" /><label for="timerButton">Time</label>
<!--                <div id="timerPanel">
                    <span id="slider-titile"><span id="speedText" class="transText">Rychlost: </span><span id="timerValue">350</span></span>
                    <div id="slider-range-min"></div>                    
                </div> -->

            </div>
      </div>
      <div id="content">

<table>
<tr><td>           
<canvas id="canvas" width="250" height="400"></canvas> 

</td><td>
            <div id="sourcePanel">
                <div id="sourceWrapper" class="border">
                                                       
<?
echo '<textarea id="source" cols="70" rows="50">'.$inittext.'</textarea>';
?>
                </div>
            </div>
</td></tr>
</table>
          
       <div id="resizableBarY"></div>       
        <div id="tabs">
             <ul>
		<li><a href="#message" class="transText" id="messageText">Errors</a></li>

		<li><a href="#watch" class="transText" id="debugText">Debug</a></li>
                <li><a href="#examples" class="transText" id="exampleText">Examples</a></li>                
		<li><a href="#syntax" class="transText" id="syntaxText">Syntax</a></li>
	     </ul>
	     <div id="message"></div>	     
	     <div id="watch"></div>
             <div id="examples"></div>
             <div id="syntax"></div>

	</div>

    </div>                                                      
    </div>             
   
<pre id="log" style="display: none; border: 1px solid black; width: 760px; height: 400px; overflow: scroll;"> 
</pre>
 
