<!-- 

	SIMULATOR START


 -->
        <link rel="stylesheet" href="simulator/kalkulacka/calc.css" type="text/css" media="screen">
        <script src="simulator/kalkulacka/raphael.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/kalkulacka/calc.js" type="text/javascript" charset="utf-8"></script>
        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//získán z globální promìnné
            var id_game = "<?= $session_id ?>";  		//získán z globální promìnné 
            var check_hash = "<?= $session_hash ?>"; 	//získán z globální promìnné
            var buttons = [<?= $instance_plan ?>];

            window.onload = function () {
                r = Raphael("holder", HOLDER_WIDTH, HOLDER_HEIGHT);
                Calculator.init(buttons);
            };
        </script>
	</head>

	<body id='body' >
    <div id="task"></div>
    <div id="holder"> </div>
    <div id="debug"></div>
<!-- 

	SIMULATOR END

 -->
     
