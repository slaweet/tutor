
<style type="text/css">
textarea {width:400px; height: 200px}
h4 {margin: 5px;padding: 0px}
.data {width: 340px; float:right;}
.rect, .data { border:3px solid #ccc;  margin-bottom: 20px; padding: 5px}
.send {cursor: pointer}
</style>

<script type="text/javascript" src="simulator/xml/jquery.js"></script>
<script type="text/javascript" src="simulator/xml/xml.js"></script>
<script type="text/javascript">
	//globalni promenne tutora
	var session_id = "<?= $session_id ?>"; 		
	var check_hash = "<?= $session_hash ?>"; 

    window.onload = function () {
        XMLSolver.init();
    }
</script>
<div style="text-align:left" >
  <div  id="tasktext" class="rect"></div>

  <div style="width:400px; float:left;">
  <textarea id="solution"></textarea>
  <button class="send">Spusť program</button>
  </div>

  <div class="data" > 
   <h4>Testovací soubory:</h4>
   <div id='xmldata'></div>
  </div>
  <div class="data" >
    <h4 >Výstup:</h4>
    <div id="result"></div>
  </div>
<br style="clear:both;">
<!--
<div>
JSON zadání pro účely testovací vezre:<br>
<textarea id="task">{
 text: "Napište xpath výraz, který vybere věchny buňky html tabulky s id 'sales'.",
 type: "XPath",
 solution: "//table[/@id=sales]//td",
 data: "input1.xml, input2.xml, input3.xml, input4.xml"
 }</textarea></br>
  <button onclick="XMLSolver.init()">Načti zadání</button><br /><br />
  </div>
  -->
  </div>

