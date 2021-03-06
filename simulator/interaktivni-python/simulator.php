<!-- 

	SIMULATOR START


 -->
    <link rel="stylesheet" href="simulator/interaktivni-python/style.css" type="text/css" />
    <link rel="stylesheet" href="simulator/interaktivni-python/codemirror.css" type="text/css" />
    <link rel="stylesheet" href="simulator/interaktivni-python/default.css" type="text/css" />

    <script type="text/javascript" src="simulator/interaktivni-python/jquery.js"></script>
    <script type="text/javascript" src="simulator/interaktivni-python/codemirror.js"></script>
    <script type="text/javascript" src="simulator/interaktivni-python/python.js"></script>
    <script type="text/javascript" src="simulator/interaktivni-python/skulpt.js"></script>
    <script type="text/javascript" src="simulator/interaktivni-python/builtin.js"></script>

    <script src="simulator/konecne-automaty/lang.js" type="text/javascript" charset="utf-8"></script>
    <script src="simulator/interaktivni-python/manager.js" type="text/javascript" charset="utf-8"></script>

        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//z�sk�n z glob�ln� prom�nn�
            var id_game = "<?= $session_id ?>";  		//z�sk�n z glob�ln� prom�nn� 
            var check_hash = "<?= $session_hash ?>"; 	//z�sk�n z glob�ln� prom�nn�
            var task = "<?= base64_encode($instance_plan) ?>";
            var lang = "<?= LocaleController::get_lang() ?>";

            window.onload = function () {
                task = task != "" ? task : location.hash.substring(1).replace(/@/g, ' ');
                Lang.setLang(lang);
                initPythonManager(task);
            }
        </script>


</head>
<body>
<div class="documentwrapper" oncontextmenu="return false;" >
    <p class="lang solution">solution<p/>
    <div id="solution" class="solution">
        <textarea cols="50" rows="12" id="solution_code" class="active_code">
        </textarea>
    </div>

    <p id="text"></p>

    <p class="lang">solve<p/>
    <div id="attempt" >
        <textarea cols="50" rows="12" id="attempt_code" class="active_code" >
        </textarea>
    </div>

    <p class="lang">test<p/>
    <div id="testing" >
        <textarea cols="50" rows="12" id="testing_code" class="active_code">
        </textarea>
        <button id="run-button" class="lang">run</button>
        <button id="submit-button" class="lang">submit</button>

    </div>
    <p id="message"></p>

    <div>
        <span class="result">
            <p class="lang">result</p>
            <pre id="testing_pre" class="active_out">

            </pre>
        </span>
        <span class="result">
            <p class="lang">expected</p>
            <pre id="testing2_pre" class="active_out">

            </pre>
        </span>
    </div>
    <br style="clear:both"/>

    </div>
</div>

<!-- 

	SIMULATOR END

 -->
     
