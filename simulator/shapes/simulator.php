<!-- 

	SIMULATOR START


 -->
        <link rel="stylesheet" href="simulator/shapes/style.css" type="text/css" media="screen">
        <script src="simulator/shapes/raphael.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/shapes/shapes.js" type="text/javascript" charset="utf-8"></script>
        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//získán z globální promìnné
            var id_game = "<?= $session_id ?>";  		//získán z globální promìnné 
            var check_hash = "<?= $session_hash ?>"; 	//získán z globální promìnné
            var task = "<?= $instance_plan ?>";

            window.onload = function () {
                Transformations.init(task);
            };
        </script>
	</head>

	<body id='body' >

    <div id="holder">
            <form onsubmit='Transformations.update(); return false;'>
                <input type="text" id="text" style="width: 650px;"/>
                <input type="submit" value="Vykreslit"/>
                <div id="error"></div> 
            </form>
        <span>
            <div id="goallabel"></div> 
            <span id="goal"></span> 
        </span>
        <span>
            <div id="userlabel"></div> 
            <span id="user"></span>    
        </span>
        <span>
            <div id="difflabel"></div> 
            <span id="diff"></span>    
        </span>
    </div>
    <br>
    <span id="source"></span>
<!-- 

	SIMULATOR END

 -->
     
