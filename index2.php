<?
 error_reporting(E_ALL);
// index.php contains just include of index2.php, because local_settings calls "git pull" and index.php shouldn't be overriten by pull.
include 'local_settings.php';

  class LocaleController {
   function get_lang(){
    if (isset($_SESSION["lang"])){ if (in_array($_SESSION["lang"], Array("en"))){ $lang="en"; }else{$lang="cs";}} else {$lang="cs";}
    return $lang;
   }
   function set_lang($lang){
    $_SESSION["lang"] = $lang;
   }
   function get_flag($lang){
    return  $_SESSION["lang"].'	<a href="'.$_SERVER['REQUEST_URI'].'&changelang='.$lang.'">
  <img src="./obr/'.$lang.'_'.($lang == LocaleController::get_lang() ? '': '').'active.png" class="'.$lang.'_flag">
  </a>';
   }
  }


  function getUloha() {
    return isset($_GET['uloha']) ? $_GET['uloha'] : (isset($_GET['problem_id']) ? $_GET['problem_id'] : 'transformations');
  }

function problemList() {
	$adr = opendir('simulator');
	$ret = '<div class="resit">';
	while ($file = readdir($adr)) {
	    if($file != "." and $file != "..") {
		$ret .= '<div ><a href="index.php?p=problem_map&problem_id='.$file
		.'"><img src="simulator/'.$file.'/default.png" /><h1>'.$file.'</h1></a></div>';
	}
	}
	return $ret.'</div>';
}
function processInstances($data) {
    $data = preg_split("/(\n\n|\r\n\r\n|\r\r)/", $data);
    foreach ($data as $key => $instance) {
        $task = preg_split("/(\n|\r\n|\r)/", $instance);
        if (count($task) == 4) {
            $_POST["name_cs"] = $task[0];
            $_POST["name_en"] = $task[1];
            $_POST["initial_mean_time"] = $task[2];
            $_POST["problem_cs"] = $task[3];
            InstanceController::add_instance($key);
        }
    }
}
class InstanceController {
 function add_instance($id){
  $time = $_POST["initial_mean_time"];
		echo '<div class="vyreseno" ><a href="index.php?p=instance_solve&problem_id='.$_GET['problem_id'].'&instance_id='.$id.'" ><strong style="font-size: 1.0em;" >'.$_POST["name_".LocaleController::get_lang()].'</strong><br /><br />Předpověď<br />'.floor($time/60).':'. ($time%60 < 10 ? '0':'').($time%60).'<br /></a></div>';

  
  }
}

function instanceList($problem) {
	echo '<h1>'.$problem.'</h1><div class="resit">';
	$data = file_get_contents('simulator/'.$problem.'/instances.txt');
	processInstances($data);
	echo '</div>';
}

function getInstance($problem, $id) {
	$data = file_get_contents('simulator/'.$problem.'/instances.txt');
	$data = preg_split("/(\n\n|\r\n\r\n|\r\r)/", $data);
	$instance = preg_split("/(\n|\r\n|\r)/", $data[$id]);
	return $instance;
}
?>
<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">
<html xmlns=\"http://www.w3.org/1999/xhtml\" dir=\"ltr\">

<head>
	<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
  <title><?= $server .'-'.getUloha() ?>-Problem Solving TUTOR</title>

<link rel="icon" type="image/png" href="./obr/favicon.ico">
<style type="text/css">
	body {background-image: url('./obr/background.png');
			background-repeat: repeat-x;
			background-color: #ffffff;
			margin: 0;
			padding: 0;
			font-family: Calibri, Arial CE, sans-serif;
			height: 100%}
	img {border: 0px}

	.wrapper {position: absolute;
			width: 960px;
			margin-left: -480px;
			left: 50%;
			top: 0;
			height: 100%}
	.logout {position: absolute;
			top: 15px;
			right: 120px;
			font-size: 88%}
	.logout a{color: #000000;
			text-decoration: none;
			font-weight: normal}
	.logout a:hover{text-decoration: underline}
	
	.cs_flag {position: absolute;
			top: 16px;
			right: 55px}
	.en_flag {position: absolute;
			top: 16px;
			right: 21px}
			
	.main_menu {position: absolute;
			top: 66px;
			left: 400px;
			height: 50px;
			font-family: Candara, Arial CE, sans-serif;
			font-size: 125%;
			border-collapse: collapse;
			border-spacing: 0}
	.main_menu td{height: 50px;
			padding-left: 25px;
			padding-right: 25px;
			border-right: solid 1px #EBE1BD;
			vertical-align: middle;
			text-align: center;
			font-weight: bold;
			color: #5C4800}
	.main_menu td.last_item{border: 0}
	.main_menu a {color: black;
			text-decoration: none}
	.main_menu a:hover {color: #64AA13}
	
	.second_menu {position: absolute;
			top: 148px;
			left: 0px;
			width: 100%;
			font-family: Candara, Arial CE, sans-serif;
			font-size: 103%;
			border-collapse: collapse;
			border-spacing: 0}
	.second_menu td{padding: 3px 9px 3px 9px;
			border-bottom: solid 1px #EBE1BD;
			vertical-align: middle;
			text-align: center;
			font-weight: bold;
			color: #5C4800}
	.second_menu a {color: black;
			text-decoration: none}
	.second_menu a:hover {color: #64AA13}
	.second_menu td.vybrano {border-bottom: 0;
			border-left: solid 1px #EBE1BD;
			border-top: solid 1px #EBE1BD;
			border-right: solid 1px #EBE1BD}
			
	
  .next_menu {
			margin-bottom: 15px;
      font-family: Candara, Arial CE, sans-serif;
			font-size: 103%;
			border-collapse: collapse;
			border-spacing: 0}
	.next_menu  td{padding: 3px 9px 3px 9px;
			border-bottom: solid 1px #EBE1BD;
			vertical-align: middle;
			text-align: center;
			font-weight: bold;
			color: #5C4800}
	.next_menu  a {color: black;
			text-decoration: none}
	.next_menu a:hover {color: #64AA13}
	.next_menu  td.vybrano {border-bottom: 0;
			border-left: solid 1px #EBE1BD;
			border-top: solid 1px #EBE1BD;
			border-right: solid 1px #EBE1BD}



	.cara {position: absolute;
			top: 148px;
			_top: 138px;
			left: 0px;
			width: 100%;
			height: 1px;
			border-bottom: solid 1px #EBE1BD}
			
	.main{position: relative;
			margin-top: 195px;
			margin-bottom: 20px;
			top: 0px;
			left: 0px;
			width: 960px;
			vertical-align: top}
	.content{width: 620px;
			padding-right: 20px;
			vertical-align: top}
	.right{width: 300px;
			padding-left: 20px;
			vertical-align: top}
			
	h1{font-family: Candara, Arial CE, sans-serif;
			font-size: 120%}
	li{list-style-type: square;
			padding: 1px 0px 1px 0px}
	.main a{font-weight: bold;
			text-decoration: underline;
			color: #000000}
	.main a:hover{color: #64AA13}
	
			
	.formular{padding-left: 25px}
	.formular td{padding: 5px}
	.formular td input{border: solid 1px #EBE1BD;
			background-color: #FCFBF3;
			height: 22px}
	.formular td.tlacitko{text-align: center}
	.formular td.tlacitko input{position:relative;
			left: 20px;
			height: 24px;
			background-color: #F5EFD1;
			border: outset 1px #EBE1BD}
	.formular td.zapomenute{text-align: center}
	.formular td.zapomenute a{color: #5C4800;
			text-decoration: underline;
			font-weight: normal;
			font-size: 80%}
	.formular td.zapomenute a:hover{text-decoration: none}
			
	.footer{margin-top: auto;
            clear:both;
			width: 960px;
			background-image: url('./obr/footer.png');
			background-repeat: repeat-x;
			background-color: #ffffff;
			font-family: Calibri, Arial CE, sans-serif;
			font-size: 88%;
			border-collapse: collapse;
			border-spacing: 0;
			border-left: solid 1px  #EBE1BD;
			border-top: solid 1px  #EBE1BD;
			border-right: solid 1px  #EBE1BD}
	.footer td{padding: 8px 20px 8px 20px}
	.footer a{font-weight: bold;
			color: #000000;
			text-decoration: none}
	.footer a:hover{text-decoration: underline}

 	.resit{width: 100%;
			padding-top: 0px} /* zblebt zmenil z 20 na 0 */

/*  PO 5 V �AD� */
	.resit div{float: left;
			width: 140px;
			min-height: 140px;
			margin-right: 65px;
			margin-bottom: 25px;
			border: solid 1px  #EBE1BD;
			text-align: center}
	.resit img{padding: 0px;
			width: 140px;
			height: 140px}
	.resit h1{font-size: 105% !important; 
			margin-top: 10px !important}

  /* zblebt pridal pro vypis problemu nadpis typu ulohy (vzdelavaci atp.)) */
	.resit h2{font-family: Candara, Arial CE, sans-serif;
			font-size: 120%;
			margin-bottom: 10px}


/*  PO 10 V �AD� */
	.resit10 div{float: left;
			width: 69px;
			margin-right: 30px;
			margin-bottom: 20px;
			text-align: center}
	.resit10 img{padding: 0px;
			width: 69px;
			height: 69px}
	.resit10 h1{font-size: 95% !important}

/* *** */
	.resit div.last_item{margin-right: 0px}
	.resit h1{font-size: 100%;
			margin-top: 5px}
	.resit a{text-decoration: none}
	.resit a:hover{text-decoration: underline;
			color: black}
	.resit br{clear: both}

 	.resit10 div.last_item{margin-right: 0px}
	.resit10 h1{font-size: 100%;
			margin-top: 5px}
	.resit10 a{text-decoration: none}
	.resit10 a:hover{text-decoration: underline;
			color: black}
	.resit10 br{clear: both}

  table.doporucena_zadani {width: 100%}
	.doporucena_zadani td{
			vertical-align: top;
			text-align: center;
			border: 2px solid white;
			padding: 0px}

  .doporucena_zadani td{width:69px;}
	.doporucena_zadani td.vyreseno{background-color: #9CCF31}
	.doporucena_zadani td.reseno{background-color: #FF9E00}
	.doporucena_zadani td.nereseno{background-color: #F7D708}
	.doporucena_zadani a{display:block;
			border: 0px solid red;
			padding: 3px;
			font-size: 88%;
			font-weight: normal;
			text-decoration: none;
			margin: 6px 0px 6px}
	.doporucena_zadani a:hover{text-decoration: underline;
			color: black}
	.doporucena_zadani a h4{font-size: 110%;
			font-weight: bold;
			margin: 0px 0px 5px}

	.doporucujeme th{background-image: url('./obr/doporucujeme.png');
			background-repeat: no-repeat;
			background-position: center center}
	.doporucujeme td{text-align: center}
	.doporucujeme a{text-decoration: none}
	.doporucujeme th a{font-size: 130%}
	.doporucujeme a:hover{text-decoration: underline;
			color: black}
			
	.tabulka {
      /*width: 300px;*/
			margin: 20px 40px 40px;
			background-image: url('./obr/footer.png');
			background-repeat: repeat-x;
			background-color: #ffffff;
			border: 1px solid #EBE1BD;
			border-collapse: collapse}
	.tabulka .stinovani{
      background-image: url('./obr/footer.png');
  }
	.tabulka th{border: 1px solid #EBE1BD;
 		 padding: 3px 5px 3px}
	.tabulka td{border: 1px dotted #EBE1BD;
			padding: 3px 10px 3px 5px}
	.tabulka .vpravo {text-align: right}


	table.chybova_dobra, table.chybova_zla{width: 240px;
			height: 30px;
			border: 1px solid #EBE1BD;
			margin-top: 20px;
			margin-bottom: 20px}

	table.chybova_dobra{background-image: url('./obr/chyba_green_bg.png');
			background-repeat: repeat-y;
			background-color: #ffffff}

	table.chybova_zla{background-image: url('./obr/chyba_orange_bg.png');
			background-repeat: repeat-y;
			background-color: #ffffff}

	.chybova_dobra th, .chybova_zla th{width: 25px;
			padding-left: 3px;
			vertical-align: middle}

	.chybova_dobra td, .chybova_zla td{vertical-align: middle;
			text-align: center;
 		  padding: 4px 10px 4px 10px;
			font-weight: bold}

	td.zobrazeni_pravidel{text-align: right;
			vertical-align: top;
			border-right: 1px solid #EBE1BD;
			padding: 0px 20px 20px 0px}

	.zobrazeni_pravidel a{font-size: 100%;
			text-decoration: none;
			font-style: italic;
			font-weight: normal;
			color: black}

	.zobrazeni_pravidel a:hover{color: black;
			text-decoration: underline}

	td.pravidla{width: 300px;
			padding: 0px 0px 10px 20px;
			vertical-align: top;
			font-size: 88%}

	
			
</style>

</head>

<body>

<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/cs_CZ/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>

<div class="wrapper">
<a href="index.php?p=problem_list">	<img src="./obr/logo.png" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='./obr/logo.png'); _width:1px; _height:1; position: absolute; top: 20px; left: 10px" width="360" height="100" alt="Problem Solving TUTOR">
</a>
<?= LocaleController::get_flag('cs') . LocaleController::get_flag('en') ?>

<table class="main_menu"><tr><td><a href="index.php?p=main_page">ÚVOD</a><td><a href="index.php?p=about">VÝZKUM</a><td class="last_item" ><a href="index.php?p=contact">KONTAKT</a>
	</tr></table><table class="second_menu"><tr><td width="20"></td><td><a href="index.php?p=problem_list">Problémy</a></td><td width="20"></td><td><a href="index.php?p=results">Statistiky</a></td><td width="20"></td><td><a href="index.php?p=user_update">Osobní&nbsp;údaje</a></td><td width="20"></td><td><a href="index.php?p=write_us">Napište&nbsp;nám</a></td><td width="100%"></td></tr></table><div class="main"><script type="text/javascript" src="scripts/mootools-1.2.1-core.js"></script><script type="text/javascript" src="scripts/mootools-1.2-more.js"></script>
      <script language="JavaScript">
       function zobrazSkryj(idecko){
         el=document.getElementById(idecko).style; 
         el.display=(el.display == 'block')?'none':'block';
       }
       function skryjZobraz(idecko){
         el=document.getElementById(idecko).style; 
         el.display=(el.display == 'none')?'block':'none';
       }
      function zmen_text_odkazu(id,id2){
         el=document.getElementById(id); 
         el2=document.getElementById(id2).style;
         if (el2.display == 'block'){
           el.innerHTML='&gt;&gt;&gt;<br>Skrýt<br>pravidla<br>&gt;&gt;&gt';
         }else{
           el.innerHTML='&lt;&lt;&lt;<br>Zobrazit<br>pravidla<br>&lt;&lt;&lt;';
         }
      }

  		function sendDataToInterface(query) {
  			var requestSender = new Request({
  					method: 'get', 
            url: './interface/interface.php',
  					link: 'chain',
  					onComplete: function(response){  } // alert('Response: ' + response) 
  			});
  			var queryString = query;
  			//alert (queryString);
  			requestSender.send(queryString);
      }

      var after_win_zapsano_do_dbs=0; // globalni promenna
      var after_win_zapsano_do_dbs_old=0; // globalni promenna
      var interval =0;
      function after_win_stats_check(){
        var z=0;    
        var requestSender = new Request({
       	  method: 'get', 
          url: './interface/interface_after_win_check.php',
        	link: 'chain',
        	onComplete: function(response){  
            after_win_zapsano_do_dbs=response;
            if (after_win_zapsano_do_dbs==1 && after_win_zapsano_do_dbs_old==0){
              after_win_stats_load();
              clearInterval(interval);
            }else{
              /*document.getElementById("div_after_win_stat").innerHTML='nestihlo se zapsat do dbs';*/
            }
            after_win_zapsano_do_dbs_old = after_win_zapsano_do_dbs;
          } 
        });
        var queryString = 'user_id=5306&instance_id=703';
        requestSender.send(queryString);
      }
      
      function after_win(){
        document.getElementById("before_win_div").className = "skryvany";
        document.getElementById("after_win_div").className = "zobrazovany";          
        
      }                   
      
      function delayedHref(href){  window.location.href='index.php?'+href;  } 
      function delayedRestart(){ window.location='index.php?p=instance_solve&problem_id=<?=$_GET['problem_id']?>&instance_id=<?=$_GET['instance_id']?>';  }
      function delayedMap(){  window.location.href='index.php?p=problem_map&problem_id=<?=$_GET['problem_id']?>'; 
      }       


      /*function comments_insert(vstup_comment) {
        var requestSender = new Request({
  					method: 'get', 
            url: './interface/comments_insert.php',
  					link: 'chain',
  					onComplete: function(response){
              document.getElementById("comments").innerHTML=response;              
              document.getElementById("vstup_comment").value='';
            } 
  			});
        var queryString = 'user_id=5306&instance_id=703&text='+vstup_comment;
  			requestSender.send(queryString);
      } */
  	
      </script> 
    
      <style>
       .skryvany { display: none; }
       .zobrazovany { display: block; }
      </style>
      
      <script language="JavaScript">

      function after_win_stats_load() {
  			
        var requestSender = new Request({
  					method: 'get', 
            url: './interface/interface_after_win.php',
  					link: 'chain',
  					onComplete: function(response){  
              document.getElementById("div_after_win_stat").innerHTML=response;
            } 
  			});
  			var queryString = 'session_id=-1&session_hash=obihixyysllnbtuecmetakwqgilbfzqr&user_id=5306&instance_id=703&recommendation=1'; 
  			requestSender.send(queryString);
      
      }
      </script> 
    <table width="100%"><tr>
  <td rowspan=2 id="levetd" style="width:80px; margin:0px; padding:0px; display:block;" ></td>
  <td rowspan=2 valign=top width=800px><center><table align="center" class="chybova_dobra" cellpadding="0" cellspacing="0">
	</table><div id="after_win_div" class="skryvany"><h1>Vyhráli jste!</h1><br /><a href="index.php?p=problem_map&problem_id=<?=$_GET['problem_id']?>">
        <input onclick="delayedMap();" class="button" style="font-size:1em; height: 30px; width:250px; " type="submit" value="Pokračovat" /></a></div><br /><div id="div_after_win_stat"></div>
        <?



if (isset($_GET['changelang'])) {
    LocaleController::set_lang($_GET['changelang']);
}
if (isset($_GET['p']) and $_GET['p'] == 'problem_list') {
    echo problemList();
} else if (isset($_GET['p']) and $_GET['p'] == 'problem_map' and isset($_GET['problem_id'])) {
   instanceList($_GET['problem_id']);
} else {
	if (isset($_GET['p']) and $_GET['p'] == 'instance_solve') {
	   $instance = getInstance($_GET['problem_id'],$_GET['instance_id']);
	   $instance_plan = $instance[3];
   	   echo "<h1>".$instance[(LocaleController::get_lang() == 'cs' ? 0 : 1)]."</h1>";
	}

        require 'simulator/'.(getUloha()).'/simulator.php';
?>
     <br /><br /><div id="before_win_div" class="zobrazovany"><input class="button" onclick="
      sendDataToInterface('session_id=-1&session_hash=obihixyysllnbtuecmetakwqgilbfzqr&giveUp=1');
      setTimeout('delayedRestart()', 50); 
      " type="button" value="Nový pokus" />&nbsp;&nbsp; <input class="button" onclick="
      sendDataToInterface('session_id=-1&session_hash=obihixyysllnbtuecmetakwqgilbfzqr&giveUp=1&fail_increment=1'); 
      setTimeout('delayedMap()', 70); 
      " type="button" value="Zkusit jinou úlohu" /></div>
<?
}
?>
  </center></td>
  
  

</td></tr></table></div>
	<br />

  <table class="footer">
  
	<tr><td align="left"><a href="./index.php?p=contact">Kontakt</a> | <a href="./index.php?p=acknowledgement">Poděkování</a></td><td align="right">©2011 Proso Tutor</td></tr>
	</table>
	
	</div>
  
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-4711468-5']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

  </body>
  </html>
