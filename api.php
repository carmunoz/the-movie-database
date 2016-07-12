<?php

require_once( __DIR__ . '/vendor/autoload.php' );

require_once( 'tmdb_v3-PHP-API/tmdb-api.php' );
// API Key for https://mysterious-beach-72002.herokuapp.com/
$apiKey = "6ddf2ff10893429464a2ad9230699501";

$app = new Silex\Application();
$app['debug'] = true;

$app->get('/actor/{name}', function($name)  use ($app) {
	//$app['monolog']->addDebug('api');
	//error_log( 'Actor: ' . $name );
	//return '<pre>Hello '. $app->escape($name) .'</pre>';
	$tmdb = new TMDB( $apikey, 'en', true );
	$persons = $tmdb->searchPerson( $name );	

	$movieList = array( "The Schindler's list" );
	//return $app->json(array( 'actor' => $name, 'movies' => $movieList ));
	return $app->json( $persons );
});

/*
$app->get('/', function() use ($app) {
	return $app->redirect('../index.php');
});


$app->get('', function() use ($app) {
	return $app->redirect('index.php');
});
*/

$app->run();
