require('es5-shim');
require('es5-shim/es5-sham');
require('console-polyfill');
require('es6-promise').polyfill();

var React = require('react');
var ReactDOM = require( 'react-dom' );
var axios = require('axios');

// bootstrap components...
var Button         = require( 'react-bootstrap/lib/Button' );
var ControlLabel   = require( 'react-bootstrap/lib/ControlLabel' );
var Form           = require( 'react-bootstrap/lib/Form' );
var FormControl    = require( 'react-bootstrap/lib/FormControl' );
var FormGroup      = require( 'react-bootstrap/lib/FormGroup' );
var ListGroup      = require( 'react-bootstrap/lib/ListGroup' );
var ListGroupItem  = require( 'react-bootstrap/lib/ListGroupItem' );
var PageHeader     = require( 'react-bootstrap/lib/PageHeader' );
var Panel          = require( 'react-bootstrap/lib/Panel' );

// TODO: declare "results", "noresults" and "actorresult" in CSS
// in general, use CSS in all components.

// TODO: show a message when the total result is greater than current list (limited to 20 for performance reasons). 
// Something like 'there are XXX more results...'
// this should happen when the user search for "John" or other common name.
// The proper way is to use or create a pagination component.

// TODO: show a clock indicator, a fade panel or another animation, when there is an Ajax call in progress.

// TODO: apply "trim" on inputs.

// TODO: show an error to the user when the Ajax call fails.

// TODO: highlight matched words in filtered movies 

class Progress extends React.Component {

	render() {
		return <p>Please wait while loading results...</p>;
	}
}

class Photo extends React.Component {
	render() {
		if( ! this.props.url  ) {
			return <div>No photo available</div>;
		}
		else {
			return <div>
				<image src={this.props.url} width="120px" />
			</div>;
		}
	}
}

class MovieCast extends React.Component {
	render() {
		if( this.isValidForFilter( this.props.filter, this.props.cast ) ) {
			return <div style={{ paddingLeft: "15px", border: "1px solid black" }}>
				<p style={{ fontWeight: "bold" }} >{ this.props.cast.original_title }</p>
				<Photo url={ this.props.cast.poster_url }/>
				<p>Release date: { this.props.cast.release_date }</p>
				<p>Character name: { this.props.cast.character }</p>
			</div>;
		}
		else {
			return <div/>;
		}
	}

	isValidForFilter( filter, cast ) {
		if( !filter || filter == '' ) {
			return true;
		}

		if( cast.original_title && cast.original_title.toLowerCase().includes( filter.toLowerCase() ) ) {
			return true;
		}
		if( cast.release_date && cast.release_date.includes( filter ) ) {
			return true;
		}
		if( cast.character && cast.character.toLowerCase().includes( filter.toLowerCase() ) ) {
			return true;
		}

		return false;
	}

}

class MovieList extends React.Component {
	state = {
		filter: ''
	}

	render() {
		if( this.props.movies ) {
			if( this.props.movies.cast.length == 0 ) {
				return <div>The actor has no credit in any movies</div>;
			}
			else {
				return <div>
					<p>The actor has a role in the movie(s):</p>
					<Form inline>
						<FormGroup>
							<ControlLabel>Filter... </ControlLabel>
							<FormControl
								type="text" 
								ref="filter" 
								placeholder="Enter keyword here to search in actors movie list" 
								onChange={ this.handleChangeFilter }
								size="60" /> 
						</FormGroup>
					</Form>
					{
						this.props.movies.cast.map( (movieCast) => {
							return <MovieCast key={movieCast.credit_id} cast={movieCast} filter={ this.state.filter }/>;
						} )
					}
				</div>;
			}
		}
		else {
			return <div>There is not information about actor's movies</div>;
		}
	}

	componentDidMount() {
		// on first render of movie list, set focus on filter
		if( this.refs.filter ) {
			this.refs.filter.focus();
		}
	}

	handleChangeFilter = (e) => {
		if( e.target.value && e.target.value != '' ) {
			this.setState({ filter: e.target.value });
		}
		else {
			this.setState({ filter: '' });
		}
	}
}

class Actor extends React.Component {
	state = {
		movieListVisible: false
	}

	render() {
		return <Panel onClick={ this.handleClick } header={ this.props.actor.name } bsStyle="info">
			<Photo url={this.props.actor.photo_url}/> 
			{ this.state.movieListVisible ? <MovieList movies={ this.props.actor.movies} /> : '' }
		</Panel>;
	}

	handleClick = () => {
		this.setState({ movieListVisible: true });
	}
}

class ActorList extends React.Component {

	render() {
		if( this.props.actors && this.props.actors.length > 0 ) {
			return <div className="results">
				<p>Click on the actor's name or photo to see more details</p>
				{
					this.props.actors.map( (actor) => {
						return <Actor key={""+actor.id} actor={actor}/>;
					})
				}
			</div>;
		}
		else {
			if( ! this.props.actorName || this.props.actorName == "" ) {
				return <div />
			}
			else {
				return <div className="noresults">No results found for {this.props.actorName}.</div>
			}
		}
	}
}

class App extends React.Component {
	state = {
		actors: [],
		entry: '',
		keyword: '',
		loading: false
	};

	render() {
		return <div>
			<PageHeader>The movie database<br/><small>A simple app to search actors' movies</small></PageHeader>
			<Form onSubmit={this.search} inline>
				<FormGroup controlId="actor_name">
					<ControlLabel>Actor's name ?</ControlLabel>
					{' '}
					<FormControl
						type="text"
						ref="actor_name"
						value={this.state.entry}
						onChange={this.handleChange} />
					{' '}
					<Button
						type="submit"
						bsStyle="primary"
						bsSize="small"
						onClick={this.search}
						disabled={this.state.loading}
						>
						{ this.state.loading ? 'Searching...' : 'Search' }
					</Button>
				</FormGroup>
			</Form>
			{
				this.state.loading ?
					<Progress/>
				:
					<ActorList actors={this.state.actors} actorName={this.state.keyword}/>
			}
		</div>;
	}

	componentDidMount() {
		// on first render, set the focus on actor search field.
/*
		this.refs.actor_name.focus();
*/
	}

	handleChange = (e) => {
		this.setState({ entry: e.target.value });
	}

	search = (e) => {
		e.preventDefault();
		var actorName = this.state.entry;
		if( !actorName || actorName == "" ) {
			// clear the form and internal state
			this.setState({ actors: [], entry: '', keyword: '' });
			return;
		}

		// first clear de actor list and show a message of "loading..."

		this.setState({ loading: true });

		console.log( `searching ${actorName}...` );
		var url = "api.php/actor/" + encodeURIComponent(actorName);

		axios.get( url )
		.then( (response) => {
			this.setState({ loading: false });
			console.log("response");
			console.log(response);
			//var nMatches = response.data;
			var actors = response.data.actors;
			this.sortActorsAndMovies( actors );
			console.log( actors );
			// update state to refresh list
			this.setState({ actors: actors, keyword: actorName });
		})
		.catch( (error) => {
			this.setState({ loading: false });
			console.log("error");
			console.log(error);
		});
	}

	sortActorsAndMovies( actors ) {
		actors.sort( (a,b) => {
			if( a.name < b.name ) {
				return -1;
			}
			else if( a.name > b.name ) {
				return 1;
			}
			else {
				return 0;
			}
		} );
		for( var i=0; i<actors.length; i++ ) {
			var movies = actors[i].movies.cast;
			movies.sort( (a,b) => {
				if( ! a.release_date ) {
					return 1;
				}
				if( ! b.release_date ) {
					return -1;
				}
				if( a.release_date < b.release_date ) {
					return -1;
				}
				else if( a.release_date > b.release_date ) {
					return 1;
				}
				else {
					return 0;
				}
			} );
		}
	}
}

ReactDOM.render( <App/>, document.getElementById( 'app' ) );
