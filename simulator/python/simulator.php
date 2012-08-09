<!-- 

	SIMULATOR START


 -->
    <link rel="stylesheet" href="simulator/python/style.css" type="text/css" />
    <link rel="stylesheet" href="simulator/python/codemirror.css" type="text/css" />
    <link rel="stylesheet" href="simulator/python/default.css" type="text/css" />

    <script type="text/javascript" src="simulator/python/jquery.js"></script>
    <script type="text/javascript" src="simulator/python/mootools-1.2.3.1-more.js"></script>
    <script type="text/javascript" src="simulator/python/codemirror.js"></script>
    <script type="text/javascript" src="simulator/python/python.js"></script>
    <script type="text/javascript" src="simulator/python/skulpt.js"></script>
    <script type="text/javascript" src="simulator/python/builtin.js"></script>

    <script src="simulator/automaty/lang.js" type="text/javascript" charset="utf-8"></script>
    <script src="simulator/python/base64.js" type="text/javascript" charset="utf-8"></script>
    <script src="simulator/python/manager.js" type="text/javascript" charset="utf-8"></script>

        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//získán z globální promìnné
            var id_game = "<?= $session_id ?>";  		//získán z globální promìnné 
            var check_hash = "<?= $session_hash ?>"; 	//získán z globální promìnné
            var task = "<?= base64_encode($instance_plan) ?>";
            var lang = "<?= LocaleController::get_lang() ?>";

            window.onload = function () {
                task = task != "" ? task : location.hash.substring(1).replace(/@/g, ' ');
                Lang.setLang(lang);
                PythonManager.init(task);
            }
        </script>


</head>
<body>
<div class="documentwrapper">
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
        <button onclick="PythonManager.run(this)" class="lang">run</button>
        <button onclick="PythonManager.submit(this);" class="lang">submit</button>

    </div>

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
     
