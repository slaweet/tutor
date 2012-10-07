        <!--

           SIMULATOR START


        -->
        <!--<link rel="stylesheet" href="simulator/kalkulacka/calc.css" type="text/css" media="screen">-->
        <!--<script type='text/javascript' src='simulator/rush_hour/scripts/mootools-1.2.1-core.js'></script>-->
        <!--<script src="simulator/kalkulacka/raphael.js" type="text/javascript" charset="utf-8"></script>-->
        <!--<script src="simulator/kalkulacka/calc.js" type="text/javascript" charset="utf-8"></script>-->

        <link rel="stylesheet" href="simulator/inv_grafar/khan-exercise.css">

        <script src="simulator/inv_grafar/ku/jquery.js"> </script>

        <!-- Ohlehcená definice objektu KhanUtil -->
        <script src="simulator/inv_grafar/mock-khan-exercise.js"> </script>

        <!-- Kvuli jQuery.tmpl.getVARS -->
        <script src="simulator/inv_grafar/ku/utils/tmpl.js"> </script>

        <!-- Vykreslení popisek os grafu -->
        <script src="simulator/inv_grafar/ku/utils/MathJax/1.1a/MathJax.js?config=KAthJax-77111459c7d82564a705f9c5480e2c88"> </script>

        <!-- Knihovna pro práci s SVG -->
        <script src="simulator/inv_grafar/ku/utils/raphael.js"> </script>

        <!-- Grafí -->
        <script src="simulator/inv_grafar/ku/utils/graphie.js"> </script>

        <!-- addMouseLayer(); addMoveablePoint(); -->
        <script src="simulator/inv_grafar/ku/utils/interactive.js"> </script>

        <!-- pro MoveablePoint - interaktivita-->
        <script src="simulator/inv_grafar/ku/utils/jquery.adhesion.js"> </script>
        <script src="simulator/inv_grafar/ku/utils/jquery.mobile.vmouse.js"> </script>

        <!-- pro MoveablePoint - správné vykreslení-->
        <script src="simulator/inv_grafar/ku/utils/math.js"> </script>

        <!-- pro mathjaxové výrazy (KhanUtil.expr())-->
        <script src="simulator/inv_grafar/ku/utils/expressions.js"> </script>
        <script src="simulator/inv_grafar/ku/utils/math-format.js"> </script>

        <!-- Inverzní grafar-->
        <script src="simulator/inv_grafar/invgrafar.js" charset="utf-8"> </script>
        <script src="simulator/inv_grafar/main.js" charset="utf-8"> </script>
        <script type='text/javascript'>

            //globalni promenne tutora
            var tutor_globals = {
                    instance_name : '<?= $instance_name ?>', // název dané hry (treba Sklad 515)
                    instance_plan : <?= $instance_plan ?>, // textový formát dané hry (treba zápis mapy Sokobanu)
                   instance_solution : '<?= $instance_solution ?>', // volitelne, informace o správném reseni pro simulátor
                   session_id : '<?= $session_id ?>', // id dané session = daná partie, dané hry, daného hráce
                    session_hash : '<?= $session_hash ?>' // syntaktický cukr, 32 znaku, pro kontrolu prohlízece
                };
            /////////////////////////////////////////////////////////

            $(document).ready(function () {
                'use strict';
                //kazdý jQuery objekt dostal metodu graphie, která v nem najde div .graphie a inicializuje ho
                jQuery('#holder').graphie();
                //objekt grafu je nyní ve window.KhanUtil.graph
                var p = window.invGrafar(
                        {
                            tutor: tutor({session_id : tutor_globals.session_id, session_hash: tutor_globals.session_hash}),
                            context: window.KhanUtil,
                            problem: {name: tutor_globals.instance_name, plan:tutor_globals.instance_plan}
                        });
            });
        </script>
        </head>

        <body id='body' >
        <div id="task" style="border: solid #ffa500 1px; padding: 1em, 2em; font-size: 3em;">
            <center id="rovnice"></center>
        </div>
        <br/>
        <div id="holder">
            <div class="graphie"></div>
        </div>
        <div id="debug"></div>
        <!--

           SIMULATOR END

        -->
