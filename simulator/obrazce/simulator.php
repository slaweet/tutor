<!-- 

	SIMULATOR START


 -->
        <link rel="stylesheet" href="simulator/obrazce/style.css" type="text/css" media="screen">
        <script src="simulator/obrazce/raphael.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/obrazce/shapes.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/obrazce/ASCIIsvg.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/obrazce/lang.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/obrazce/jquery.js" type="text/javascript" charset="utf-8"></script>
        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//získán z globální promìnné
            var id_game = "<?= $session_id ?>";  		//získán z globální promìnné 
            var check_hash = "<?= $session_hash ?>"; 	//získán z globální promìnné
            var task = "<?= base64_encode($instance_plan) ?>";
            var lang = "<?= LocaleController::get_lang() ?>";

            window.onload = function () {
                task = task != "" ? task : location.hash.substring(1);
                Lang.setLang(lang);
                Shapes.init(task);
            };
        </script>
	</head>

	<body id='body' >

    <div id="solution"></div>
    <div id="holder">
            <form onsubmit='try{Shapes.drawUserInput(document.getElementById("text").value);}catch(e){alert(e)}; return false;'>
                <input type="text" id="text" maxlength="80" onkeydown="Shapes.setCharCounter(this.value.length)" onkeyup="Shapes.setCharCounter(this.value.length)"/>
                <span id="charcounter">0/80</span>
                <input type="submit" id="drawbutton" value=""/>
                <div id="error"></div> 
            </form>
        <span class="graph">
            <div id="goallabel"></div> 
            <span id="goal"></span> 
        </span>
        <span class="graph">
            <div id="userlabel"></div> 
            <span id="user"><img src="simulator/obrazce/loading.gif" style="margin-top:100px;"/></span>    
        </span>
        <span class="graph">
            <div id="difflabel"></div> 
            <span id="diff"></span>    
        </span>
    </div>
<!-- 

	SIMULATOR END

 -->
     
