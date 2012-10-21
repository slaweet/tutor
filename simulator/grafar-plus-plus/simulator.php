        <!--

           SIMULATOR START


        -->
        <!--<link rel="stylesheet" href="simulator/kalkulacka/calc.css" type="text/css" media="screen">-->
        <!--<script type='text/javascript' src='simulator/rush_hour/scripts/mootools-1.2.1-core.js'></script>-->
        <!--<script src="simulator/kalkulacka/raphael.js" type="text/javascript" charset="utf-8"></script>-->
        <!--<script src="simulator/kalkulacka/calc.js" type="text/javascript" charset="utf-8"></script>-->

        <link rel="stylesheet" href="simulator/grafar-plus-plus/khan-exercise.css">
        <style>
#task {
 /*border: solid #ffa500 1px;*/
 padding: 1em, 2em;
}

#task td,
#task input, 
#task select {
 font-size: 25px;
}
#task tr td:first-child {
 text-align: right;
}

#task>tr {
 margin-top: 7px; 
 margin-bottom: 3px;
}

#task .error {
 color: red;
}
        </style>


        <script src="simulator/grafar-plus-plus/ku/jquery.js"> </script>

        <!-- Ohlehcená definice objektu KhanUtil -->
        <script src="simulator/grafar-plus-plus/mock-khan-exercise.js"> </script>

        <!-- Kvuli jQuery.tmpl.getVARS -->
        <script src="simulator/grafar-plus-plus/ku/utils/tmpl.js"> </script>

        <!-- Vykreslení popisek os grafu -->
        <script src="simulator/grafar-plus-plus/ku/utils/MathJax/1.1a/MathJax.js?config=KAthJax-77111459c7d82564a705f9c5480e2c88"> </script>

        <!-- Knihovna pro práci s SVG -->
        <script src="simulator/grafar-plus-plus/ku/utils/raphael.js"> </script>

        <!-- Grafí -->
        <script src="simulator/grafar-plus-plus/ku/utils/graphie.js"> </script>

        <!-- addMouseLayer(); addMoveablePoint(); -->
        <script src="simulator/grafar-plus-plus/ku/utils/interactive.js"> </script>

        <!-- pro MoveablePoint - interaktivita-->
        <script src="simulator/grafar-plus-plus/ku/utils/jquery.adhesion.js"> </script>
        <script src="simulator/grafar-plus-plus/ku/utils/jquery.mobile.vmouse.js"> </script>

        <!-- pro MoveablePoint - správné vykreslení-->
        <script src="simulator/grafar-plus-plus/ku/utils/math.js"> </script>

        <!-- pro mathjaxové výrazy (KhanUtil.expr())-->
        <script src="simulator/grafar-plus-plus/ku/utils/expressions.js"> </script>
        <script src="simulator/grafar-plus-plus/ku/utils/math-format.js"> </script>

        <!-- matematické výrazy do js-->
        <script src="simulator/grafar-plus-plus/ASCIIsvg.js" charset="utf-8"> </script>

        <!-- Inverzní grafar-->
        <script src="simulator/grafar-plus-plus/invgrafar.js" charset="utf-8"> </script>
        <script src="simulator/grafar-plus-plus/main.js" charset="utf-8"> </script>
        <script type='text/javascript'>

            //globalni promenne tutora
            var tutor_globals = {
                    instance_name : '<?= $instance_name ?>', // název dané hry (treba Sklad 515)
                    instance_plan : "<?= base64_encode($instance_plan) ?>", // textový formát dané hry (treba zápis mapy Sokobanu)
                   instance_solution : '<?= $instance_solution ?>', // volitelne, informace o správném reseni pro simulátor
                   session_id : '<?= $session_id ?>', // id dané session = daná partie, dané hry, daného hráce
                    session_hash : '<?= $session_hash ?>' // syntaktický cukr, 32 znaku, pro kontrolu prohlízece
                };
            /////////////////////////////////////////////////////////

            var p;
            $(document).ready(function () {
                'use strict';
                tutor_globals.instance_plan = tutor_globals.instance_plan != "" ? tutor_globals.instance_plan : location.hash.substring(1);
                //kazdý jQuery objekt dostal metodu graphie, která v nem najde div .graphie a inicializuje ho
                jQuery('#holder').graphie();
                //objekt grafu je nyní ve window.KhanUtil.graph
                 p = window.invGrafar(
                        {
                            tutor: tutor({session_id : tutor_globals.session_id, session_hash: tutor_globals.session_hash}),
                            context: window.KhanUtil,
                            problem: {name: tutor_globals.instance_name, plan:tutor_globals.instance_plan}
                        });
            });
        </script>
        </head>

        <body id='body' >
        <div id="task" style="">
            <table id="rovnice"></table>
        </div>
        <br/>
        <div id="holder">
            <div class="graphie"></div>
        </div>
        <div id="debug"></div>
        <!--

           SIMULATOR END

        -->
