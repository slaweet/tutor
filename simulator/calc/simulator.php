<!-- 

	SIMULATOR START


 -->
        <link rel="stylesheet" href="simulator/calc/calc.css" type="text/css" media="screen">
        <script src="simulator/calc/raphael.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/calc/calc.js" type="text/javascript" charset="utf-8"></script>
        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//z�sk�n z glob�ln� prom�nn�
            var id_game = "<?= $session_id ?>";  		//z�sk�n z glob�ln� prom�nn� 
            var check_hash = "<?= $session_hash ?>"; 	//z�sk�n z glob�ln� prom�nn�
            var buttons = [<?= $instance_plan ?>];

            window.onload = function () {
                initCalculator(buttons);
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
     
