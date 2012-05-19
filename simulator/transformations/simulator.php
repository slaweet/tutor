<!-- 

	SIMULATOR START


 -->
        <link rel="stylesheet" href="simulator/transformations/style.css" type="text/css" media="screen">
        <script src="simulator/transformations/raphael.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/transformations/transformations.js" type="text/javascript" charset="utf-8"></script>
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
        <span id="plot"></span>    
        <span id="controls" cass="controls"></span> 
        <div id="matrixline">
        <span id="matrixwraper" class="matrixwraper"></span>
        <span class="matrixpositioner">
            <span id="matrix" class="matrix">
                <form onsubmit='if(Transformations.buttons["m"])Transformations.buttons["m"].onClick(); return false;'>
                    <input type="text" id="m0" value=""/>
                    <input type="text" id="m1" value=""/>
                    <span class="bracket"></span>
                    <input type="text" id="m2" value=""/>
                    
                    <input type="text" id="m3" value=""/>
                    <input type="text" id="m4" value=""/>
                    <span class="bracket"></span>
                    <input type="text" id="m5" value=""/>

                    <input type="hidden" id="m6" value=""/>
                    <input type="hidden" id="m7" value=""/>
                    <input type="hidden" id="m8" value=""/>
                    <input type="submit" value="" style="width:0"/>
                </form>
            </span>
        </span>
        <span id="counter"  class="label"></span>
        <span id="u" class="button"></span>
        </div>
        <span id="total"  class="label"></span>
        <span id="sumarymatrixwraper" class="matrixwraper"></span>
        <span class="matrixpositioner">
        <span id="sumarymatrix" class="matrix">
        <form onsubmit='if(Transformations.buttons["m"])Transformations.buttons["m"].onClick(); return false;'>
            <input type="text" id="c0" value="" readonly/>
            <input type="text" id="c1" value="" readonly/>
                    <span class="bracket"></span>
            <input type="text" id="c2" value="" readonly/>
            
            <input type="text" id="c3" value="" readonly/>
            <input type="text" id="c4" value="" readonly/>
                    <span class="bracket"></span>
            <input type="text" id="c5" value="" readonly/>

            <input type="hidden" id="c6" value="" readonly/>
            <input type="hidden" id="c7" value="" readonly/>
            <input type="hidden" id="c8" value="" readonly/>
            <input type="submit" value="" style="width:0"/>
        </form>
        </span>
        </span>
    </div>
    <br>
    <span id="source"></span>
<!-- 

	SIMULATOR END

 -->
     
