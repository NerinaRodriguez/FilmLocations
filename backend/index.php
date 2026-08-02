<?php
//Our backend consists of an API that receives requests from the frontend using the GET method of the HTTP protocol, request the data via an external API using the GET method too, and responds in JSON format.

header ("Content-Type: application/json");
// Allow frontends served from file:// or other origins to access this API during development
header ("Access-Control-Allow-Origin: *");
header ("Access-Control-Allow-Methods: GET, OPTIONS");
header ("Access-Control-Allow-Headers: Content-Type");

//API to access data
$url = 'https://data.sfgov.org/resource/yitu-d5am.json';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
	$filter = "";
	$select = "";

	foreach ($_GET as $key => $value) {
		if ($key == "select") { $select = $value; }
		elseif ($key == "minimum") { $filter = "release_year BETWEEN " . $value . " AND "; }
		elseif ($key == "maximum") { $filter = $filter . $value; }
		else {
			$explodedKey = explode(",", $key);
			if ($explodedKey[1] == "is") $filter = $filter . " AND " . "LOWER(" . $explodedKey[0] . ") = LOWER('" . $value . "')";
			elseif ($explodedKey[1] == "starts") $filter = $filter . " AND LOWER(" . $explodedKey[0] . ") LIKE LOWER('" . $value . "%')";
			else $filter = $filter . " AND LOWER(" . $explodedKey[0] . ") LIKE LOWER('%" . $value . "%')";
		}
	}

	if ($select) $params = ['$select' => "DISTINCT " . $select, '$where' => $filter];
	else $params = ['$where' => $filter];
	
	//generates a URL query string from the $params array to send the GET request
	$query = http_build_query($params);

	$full_url = $url . '?' . $query;
	
	//The API responds in JSON format
	$response = file_get_contents($full_url);
	
	if($response) {
		echo $response;
	} else {
		echo "error";
	}
} else {
	echo "Método indefinido";
}
?>
