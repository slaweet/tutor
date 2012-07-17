<!-- 

	SIMULATOR START


 -->
        <link href="simulator/automaty/style.css" rel="stylesheet" type="text/css" media="screen">
        <script src="simulator/automaty/raphael.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/automaty/jquery.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/automaty/lang.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/automaty/automata.js" type="text/javascript" charset="utf-8"></script>
        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//získán z globální promìnné
            var id_game = "<?= $session_id ?>";  		//získán z globální promìnné 
            var check_hash = "<?= $session_hash ?>"; 	//získán z globální promìnné
            var task = '<?= $instance_plan ?>';
            var lang = "<?= LocaleController::get_lang() ?>";

            window.onload = function () {
                task = task != "" ? task : location.hash.substring(1);
                task = eval("(" + task.replace(/\n/g, '\\n') + ")");
                Lang.setLang(lang);
                AutomataManager.init(task);
            }
        </script>
	</head>

	<body id='body' >
        <div id="text"> </div>
        <div id="words">
            <span id="controls"></span>
            <div></div><br style="clear:both;"/><span id="arrow"/>
        </div>
        <div id="holder"> </div>
        <div id="debug"> </div>
<!-- 

	SIMULATOR END

 -->
     
