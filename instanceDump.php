<?
/*
* File: instanceDump.php
* Author: Vít Stanislav<slaweet@mail.muni.cz> 
* Form to upload multiple problem instances. 
* instance separator is empty line (two new lines)
* instance property separator is new line. For more details see the function processInstances below.
*/

function processInstances($data) {
    $data = preg_split("/(\n\n|\r\n\r\n|\r\r)/", $data);
    foreach ($data as $instance) {
        $task = preg_split("/(\n|\r\n|\r)/", $instance);
        if (count($task) == 4) {
            $_POST["name_cs"] = $task[0];
            $_POST["name_en"] = $task[1];
            $_POST["initial_mean_time"] = $task[2];
            $_POST["problem_cs"] = $task[3];
            InstanceController::add_instance();
        }
    }
}

include ("conf/conf.php");  
include ("include/dbs.php");  
//include ("controller/InstanceController.php"); 

class InstanceController {
 function add_instance(){
  
    if (isset($_POST["instance_id"])){ $instance_id = $_POST["instance_id"];}else{ $instance_id=""; }
    if (isset($_POST["problem_id"])){ $problem_id = $_POST["problem_id"];}else{ $problem_id=""; }
    if (isset($_POST["active"])){ $active = $_POST["active"];}else{ $active=0; }
    if (isset($_POST["lockable"])){ $lockable = $_POST["lockable"];}else{ $lockable=0; }
    if (isset($_POST["name_cs"])){ $name_cs = $_POST["name_cs"];}else{ $name_cs=""; }
    if (isset($_POST["problem_cs"])){ $problem_cs = $_POST["problem_cs"];}else{ $problem_cs=""; }
    if (isset($_POST["solution_cs"])){ $solution_cs = $_POST["solution_cs"];}else{ $solution_cs=""; }
    if (isset($_POST["name_en"])){ $name_en = $_POST["name_en"];}else{ $name_en=""; }
    if (isset($_POST["problem_en"])){ $problem_en = $_POST["problem_en"];}else{ $problem_en=""; }
    if (isset($_POST["solution_en"])){ $solution_en = $_POST["solution_en"];}else{ $solution_en=""; }
    if (isset($_POST["initial_mean_time"])){ $initial_mean_time = $_POST["initial_mean_time"]; if($_POST["initial_mean_time"]==""){$initial_mean_time=20;} }else{ $initial_mean_time=20; }    
    if (isset($_POST["trenink"])){ $trenink = $_POST["trenink"];}else{ $trenink=0; }    

    $crude_constant = log($initial_mean_time,2);
    $sql="INSERT INTO puzzle_instance (id,type,name_cs_utf8,name_en,problem_cs_utf8,problem_en,solution_cs_utf8,solution_en,
    active,initial_mean_time,trenink,crude_constant,crude_slope,crude_randomness,lockable)
    VALUES ('','$problem_id','$name_cs','$name_en','".mysql_escape_string($problem_cs)."','".mysql_escape_string($problem_en)."',
    '$solution_cs','$solution_en','$active','$initial_mean_time','$trenink',
    '$crude_constant',-1,1,'$lockable');
    ";

    echo $sql.'<br>';
    $query=MySQL_Query($sql);
  
  }
}



?>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
<head>
<body>
<form method="post" action="?">
problem id:<input type="text" name="problem_id" value="<?=  isset($_POST['problem_id']) ? $_POST['problem_id'] : ""?>"/><br>
<textarea name="data" rows="10" cols="80" ><? /* echo isset($_POST['data']) ? $_POST['data'] : "" */ ?></textarea>
<br>
Úlohy jsou aktivní <input type="checkbox"  checked=checked name="active" value="1"/>
Úlohy jsou uzamykatelné <input type="checkbox"  checked=checked  name="lockable" value="1" />             
<input type="submit"/>
<br>
<?  isset($_POST['data']) ? processInstances($_POST['data']) : "";?>
</body>
