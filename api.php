<?php

require_once( __DIR__ . '/vendor/autoload.php' );
require_once( 'apikey.php' );

$token = new  \Tmdb\ApiToken( $apikey );
$client = new \Tmdb\Client( $token );

$app = new Silex\Application();
$app['debug'] = true;

// API to get the list of actors whose name is {name}
$app->get('/actor/{name}', function($name)  use ($app, $client) {

	$searchApi = $client->getSearchApi();
	$peopleApi = $client->getPeopleApi();

	$persons = $searchApi->searchPersons( $name );

	$result = array(
		'total_results' => $persons['total_results'],
		'actors' => array()
	);

	// for each person found, construct a list of his/her movies.
	foreach( $persons['results'] as $person ) {
		// create URL for photo:
		$configRepository = new \Tmdb\Repository\ConfigurationRepository($client);
		$config = $configRepository->load();

		$imageHelper = new \Tmdb\Helper\ImageHelper($config);

		$image = $person['profile_path'];
		if( ! is_null( $image ) ) {
			$photoUrl = $imageHelper->getUrl($image);
			$person['photo_url'] = $photoUrl;
		}

		// query movies for the person.
		$movieCredits = $peopleApi->getMovieCredits( $person['id'] );

		// TODO: for each movie, get all data, then add it to the result
		// UPDATE: to get all data from all movies, it is too slow to be usable in realtime.
		
		foreach( $movieCredits['cast'] as &$movieCredit ) {
			$posterImg = $movieCredit['poster_path'];
			if( ! is_null( $posterImg ) ) {
				$posterUrl = $imageHelper->getUrl($posterImg);
				$movieCredit['poster_url'] = $posterUrl;
			}
		}
		
		foreach( $movieCredits['crew'] as &$movieCredit ) {
			$posterImg = $movieCredit['poster_path'];
			if( ! is_null( $posterImg ) ) {
				$posterUrl = $imageHelper->getUrl($posterImg);
				$movieCredit['poster_url'] = $posterUrl;
			}
		}
		
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

// TODO: all other URL should return 404

/*
$app->get('/', function() use ($app) {
	return $app->redirect('../index.php');
});


$app->get('', function() use ($app) {
	return $app->redirect('index.php');
});
*/

$app->run();
