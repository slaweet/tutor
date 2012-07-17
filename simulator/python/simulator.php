<!-- 

	SIMULATOR START


 -->
    <link rel="stylesheet" href="simulator/python/style.css" type="text/css" />
    <link rel="stylesheet" href="simulator/python/codemirror.css" type="text/css" />
    <link rel="stylesheet" href="simulator/python/default.css" type="text/css" />

    <script type="text/javascript" src="simulator/python/jquery.js"></script>
    <script type="text/javascript" src="simulator/python/underscore.js"></script>
    <script type="text/javascript" src="simulator/python/simplemodal.js"></script>
    <script type="text/javascript" src="simulator/python/jquery.textarea.js"></script>
    <script type="text/javascript" src="simulator/python/edu-python.js"></script>
    <script type="text/javascript" src="simulator/python/bookfuncs.js"></script>
    <script type="text/javascript" src="simulator/python/codemirror.js"></script>
    <script type="text/javascript" src="simulator/python/python.js"></script>
    <script type="text/javascript" src="simulator/python/skulpt.js"></script>
    <script type="text/javascript" src="simulator/python/builtin.js"></script>
    <script type="text/javascript" src="simulator/python/assess.js"></script>
    <script type="text/javascript" src="simulator/python/animationbase.js"></script>
<script type="text/javascript"> 
eBookConfig = {}
eBookConfig.host = 'http://interactivepython.org' ? 'http://interactivepython.org' : 'http://127.0.0.1:8000',
eBookConfig.app = eBookConfig.host+'/courselib',
eBookConfig.ajaxURL = eBookConfig.app+'/ajax/',
eBookConfig.course = 'thinkcspy',
eBookConfig.logLevel = 10,
eBookConfig.loginRequired = false
eBookConfig.isLoggedIn = false;
</script>

    <script src="simulator/automaty/lang.js" type="text/javascript" charset="utf-8"></script>
    <script src="simulator/python/manager.js" type="text/javascript" charset="utf-8"></script>

        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//získán z globální promìnné
            var id_game = "<?= $session_id ?>";  		//získán z globální promìnné 
            var check_hash = "<?= $session_hash ?>"; 	//získán z globální promìnné
            var task = '<?= addslashes($instance_plan) ?>';

            window.onload = function () {
                task = task != "" ? task : location.hash.substring(1);
                task = eval("(" + task.replace(/\n/g, '\\n') + ")");
                PythonManager.init(task);
            }
        </script>


</head>
<body>
<div class="documentwrapper">
    <div id="text"></div>

    <p class="lang">solve<p/>
    <div id="attempt" >
        <textarea cols="50" rows="12" id="attempt_code" class="active_code">
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
    <div id="testing2"  style="display:none" >
    <textarea cols="50" rows="12" id="testing2_code" class="active_code">
    </textarea>
    </div>

    <div id="solution" style="display:none" >
    <textarea cols="50" rows="12" id="solution_code" class="active_code">
    </textarea>
    </div>
</div>

<!-- 

	SIMULATOR END

 -->
     
