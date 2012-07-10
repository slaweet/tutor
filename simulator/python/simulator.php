<!-- 

	SIMULATOR START


 -->
    <link rel="stylesheet" href="simulator/python/style.css" type="text/css" />
    <link rel="stylesheet" href="simulator/python/pygments.css" type="text/css" />
    <link rel="stylesheet" href="simulator/python/video.css" type="text/css" />
    <link rel="stylesheet" href="simulator/python/edu-python.css" type="text/css" />
    <link rel="stylesheet" href="simulator/python/codemirror.css" type="text/css" />
    <link rel="stylesheet" href="simulator/python/default.css" type="text/css" />

    <script type="text/javascript">
      var DOCUMENTATION_OPTIONS = {
        URL_ROOT:    '../',
        VERSION:     '3.0',
        COLLAPSE_INDEX: false,
        FILE_SUFFIX: '.html',
        HAS_SOURCE:  true
      };
    </script>
    <script type="text/javascript" src="simulator/python/jquery.js"></script>
    <script type="text/javascript" src="simulator/python/underscore.js"></script>
    <script type="text/javascript" src="simulator/python/doctools.js"></script>
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
    <script type="text/javascript" src="simulator/python/http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
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
    <script type="text/javascript" src="simulator/python/manager.js"></script>

        <script type='text/javascript'>

			//globalni promenne tutora
            var session_id = "<?= $session_id ?>"; 		//získán z globální promìnné
            var id_game = "<?= $session_id ?>";  		//získán z globální promìnné 
            var check_hash = "<?= $session_hash ?>"; 	//získán z globální promìnné
            var task = '<?= $instance_plan ?>';

            window.onload = function () {
                task = task != "" ? task : location.hash.substring(1);
                task = eval("(" + task.replace(/\n/g, '\\n') + ")");
                PythonManager.init(task);
            }
        </script>


</head>
<body>
    <div class="document">
      <div class="documentwrapper">
        <div class="bodywrapper">
          <div class="body">
          <div class="section">
          <div id="text">
          </div>

<p> Solve here: <p/>
<div id="attempt" >
<textarea cols="50" rows="12" id="attempt_code" class="active_code">
</textarea>
</div>

<p> Test here: <p/>
<div id="testing" >
<textarea cols="50" rows="12" id="testing_code" class="active_code">
row(10)
</textarea>
<button onclick="PythonManager.run(this)">Run this test</button>
<button onclick="PythonManager.submit(this);">Run test that fails</button>
<br />

<p>Actual result:</p>
<canvas id="testing_canvas" height="400" width="400" style="border-style: solid; display: none"></canvas>

<pre id="testing_pre" class="active_out">

</pre>
<p>Expected result:</p>
<canvas id="testing2_canvas" height="400" width="400" style="border-style: solid; display: none"></canvas>

<pre id="testing2_pre" class="active_out">

</pre>
</div>
</div>
<div id="testing2"  style="display:none" >
<textarea cols="50" rows="12" id="testing2_code" class="active_code">
row(10)
</textarea>
</div>

<div id="solution" style="display:none" >
<textarea cols="50" rows="12" id="solution_code" class="active_code">
</textarea>
</div>
</div>


          </div>
        </div>
      </div>
<!-- 

	SIMULATOR END

 -->
     
