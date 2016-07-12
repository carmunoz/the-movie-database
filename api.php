<?php

require_once( __DIR__ . '/vendor/autoload.php' );

// API Key for https://mysterious-beach-72002.herokuapp.com/
//$apikey = "6ddf2ff10893429464a2ad9230699501";

// API Key for GPS
$apikey = "4813cfa463e06f405c9829adc7e239e2";

$token = new  \Tmdb\ApiToken( $apikey );
$client = new \Tmdb\Client( $token );

$app = new Silex\Application();
$app['debug'] = true;

// API to get the list of actors whose name is {name}
$app->get('/actor/{name}', function($name)  use ($app, $client) {

	$searchApi = $client->getSearchApi();
	$peopleApi = $client->getPeopleApi();
	//$moviesApi = $client->getMoviesApi();

	$persons = $searchApi->searchPersons( $name );

//	error_log( print_r( $persons, true ) );

	$result = array(
		'total_results' => $persons['total_results'],
		'actors' => array()
	);
	// for each person found, construct a list of his/her movies.
	foreach( $persons['results'] as $person ) {
		// query movies for the person.
		$movieCredits = $peopleApi->getMovieCredits( $person['id'] );

		// TODO: for each movie, get all data, then add it to the result
		// UPDATE: to get all data from all movies, it is too slow to be usable in realtime.
		/*
		foreach( $movieCredits['cast'] as $movieCredit ) {
			$movieId = $movieCredit['id'];
			$movie = $moviesApi->getMovie( $movieId );
			$movieCredit['movie'] = $movie;
		}
		*/
		$person['movies'] = $movieCredits;
		$result['actors'] []= $person;
	}

	return $app->json( $result );
});

// API to get the detail of a movie with given ID
$app->get('/movie/{id}', function($id) use ($app, $client) {
	$moviesApi = $client->getMoviesApi();
	$movie = $moviesApi->getMovie( $id );
	return $app->json( $movie );

} );

/*
$app->get('/', function() use ($app) {
	return $app->redirect('../index.php');
});


$app->get('', function() use ($app) {
	return $app->redirect('index.php');
});
*/

$app->run();
