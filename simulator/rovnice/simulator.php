<? $instance_plan = stripSlashes($_GET['zadani']) ?>
<!-- 

	SIMULATOR START


 -->
        <link rel="stylesheet" href="simulator/rovnice/style.css" type="text/css" media="screen">
        <script src="simulator/rovnice/raphael.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/rovnice/jquery.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/rovnice/rovnice.js" type="text/javascript" charset="utf-8"></script>
        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//získán z globální promìnné
            var id_game = "<?= $session_id ?>";  		//získán z globální promìnné 
            var check_hash = "<?= $session_hash ?>"; 	//získán z globální promìnné
            var buttons = "<?= $instance_plan ?>";

            window.onload = function () {
                r = Raphael("holder", HOLDER_WIDTH, HOLDER_HEIGHT);
                EquationSimulator.init(buttons);
            };
        </script>
	</head>

	<body id='body' >
    <div id="wraper">
        <div id="holder"> </div>
        <form id="form" onreset='EquationSimulator.hideForm();' onsubmit='EquationSimulator.submit(); return false;'>
            <div id="question"></div>
            <input type="text" id="in"\>
            <button id="submit" type="submit">OK</button>
            <button id="reset" type="reset">x</button>
        </form>
    </div>
    <div id="debug"></div>
<!-- 

	SIMULATOR END

 -->
     
