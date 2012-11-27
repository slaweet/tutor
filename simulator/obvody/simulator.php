<!-- 

	SIMULATOR START


 -->
        <link href="simulator/obvody/graffle.css" rel="stylesheet" type="text/css" media="screen">
        <script src="simulator/obvody/raphael.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/obvody/graffle.js" type="text/javascript" charset="utf-8"></script>
        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//získán z globální promìnné
            var id_game = "<?= $session_id ?>";  		//získán z globální promìnné 
            var check_hash = "<?= $session_hash ?>"; 	//získán z globální promìnné
            var names = [<?= $instance_plan ?>];

            window.onload = function () {
                initCardManager(names);
            }
        </script>
	</head>

	<body id='body' >
        <div id="holder"> </div>
<!-- 

	SIMULATOR END

 -->
     
