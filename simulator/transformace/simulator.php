<!-- 

	SIMULATOR START


 -->
        <link rel="stylesheet" href="simulator/transformace/style.css" type="text/css" media="screen">
        <script src="simulator/transformace/raphael.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/transformace/transformations.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/transformace/lang.js" type="text/javascript" charset="utf-8"></script>
        <script src="simulator/transformace/jquery.js" type="text/javascript" charset="utf-8"></script>
        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//získán z globální promìnné
            var id_game = "<?= $session_id ?>";  		//získán z globální promìnné 
            var check_hash = "<?= $session_hash ?>"; 	//získán z globální promìnné
            var task = "<?= $instance_plan ?>";
            var lang = "<?= LocaleController::get_lang() ?>";

            window.onload = function () {
                task = task != "" ? task : location.hash.substring(1);
                Lang.setLang(lang);
                Transformations.init(task);
            };
        </script>
	</head>
    <div id="holder">
        <span id="plot"><img src="simulator/obrazce/loading.gif" style="margin-left:150px; margin-top:200px;"/></span>    
        <span id="controls" cass="controls"></span> 
        <div id="matrixline">
        <span id="matrixwraper" class="matrixwraper"></span>
        <span class="matrixpositioner">
            <span id="matrix" class="matrix">
                <form onsubmit='Transformations.buttons["m"].onClick(); return false;'>
                    <span>
                        <input type="text" id="m0" value=""/>
                        <input type="text" id="m1" value=""/>

                        <input type="text" id="m3" value=""/>
                        <input type="text" id="m4" value=""/>
                    </span>
                    <input type="text" id="m2" value=""/>
                    <input type="text" id="m5" value=""/>

                    <input type="submit" value=""  style="width:0px"/>
                    <input type="hidden" id="m6" value=""/>
                    <input type="hidden" id="m7" value=""/>
                    <input type="hidden" id="m8" value=""/>
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
                <form>
                    <span>
                        <input type="text" id="c0" value="" readonly/>
                        <input type="text" id="c1" value="" readonly/>

                        <input type="text" id="c3" value="" readonly/>
                        <input type="text" id="c4" value="" readonly/>
                    </span>

                    <input type="text" id="c2" value="" readonly/>
                    <input type="text" id="c5" value="" readonly/>

                    <input type="hidden" id="c6" value="" readonly/>
                    <input type="hidden" id="c7" value="" readonly/>
                    <input type="hidden" id="c8" value="" readonly/>
                    <input type="submit" value="" style="width:0"/>
                </form>
            </span>
        </span>
    </div>
<!-- 

	SIMULATOR END

 -->
     
