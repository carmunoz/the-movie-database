var React = require('react');
var ReactDOM = require( 'react-dom' );
var axios = require('axios');

// TODO: declare "results", "noresults" and "actorresult" in CSS
// in general, use CSS in all components.

// TODO: show a message when the total result is greater than current list (limited to 20 for performance reasons). 
// Something like 'there are XXX more results...'
// this should happen when the user search for "John" or other common name.
// The proper way is to use or create a pagination component.

// TODO: show a clock indicator when there is an Ajax call in progress.

// TODO: apply "trim" on inputs.

// TODO: sort movie credits by release date.

// TODO: after the initial render o state update, show a hint to the user indicating that he can
// click over an actor to view his movies.

Photo = React.createClass({
	render: function() {
		// TODO: use CSS instead of fixed layout
		if( ! this.props.url  ) {
			return <div>No photo available</div>;
		}
		else {
			return <div>
				<image src={this.props.url} width="120px" />
			</div>;
		}
	}
});

MovieCast = React.createClass({
	render: function() {
		// TODO: use CSS to style this...
		if( this.isValidForFilter() ) {
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
	},

	isValidForFilter: function() {
		if( !this.props.filter || this.props.filter == '' ) {
			return true;
		}

		if( this.props.cast.original_title && this.props.cast.original_title.toLowerCase().includes( this.props.filter.toLowerCase() ) ) {
			return true;
		}
		if( this.props.cast.release_date && this.props.cast.release_date.includes( this.props.filter ) ) {
			return true;
		}
		if( this.props.cast.character && this.props.cast.character.toLowerCase().includes( this.props.filter.toLowerCase() ) ) {
			return true;
		}

		return false;
	}

});

CrewCast = React.createClass({
	render: function() {
		// TODO: use CSS to style this...
		if( this.isValidForFilter() ) {
			return <div style={{ paddingLeft: "15px", border: "1px solid black" }}>
				<p style={{ fontWeight: "bold" }} >{ this.props.cast.original_title }</p>
				<Photo url={ this.props.cast.poster_url }/>
				<p>Release date: { this.props.cast.release_date }</p>
				<p>Job: { this.props.cast.job }</p>
			</div>;
		}
		else {
			return <div/>;
		}
	},

	isValidForFilter: function() {
		if( !this.props.filter || this.props.filter == '' ) {
			return true;
		}

		if( this.props.cast.original_title && this.props.cast.original_title.toLowerCase().includes( this.props.filter.toLowerCase() ) ) {
			return true;
		}
		if( this.props.cast.release_date && this.props.cast.release_date.includes( this.props.filter ) ) {
			return true;
		}
		if( this.props.cast.job && this.props.cast.job.toLowerCase().includes( this.props.filter.toLowerCase() ) ) {
			return true;
		}

		return false;
	}

});

MovieList = React.createClass({
	getInitialState: function() {
		return {
			filter: ''
		}
	},

	render: function() {
		if( this.props.movies ) {
			if( this.props.movies.cast.length == 0 && this.props.movies.crew.length == 0 ) {
				return <div>The actor has no credit in any movies</div>;
			}
			else {
				var component = this;
				var movieCasts = this.props.movies.cast.map( function(movieCast) {
					return <MovieCast key={movieCast.credit_id} cast={movieCast} filter={ component.state.filter }/>;
				} );

				var crewCasts = this.props.movies.crew.map( function(crewCast){
					return <CrewCast key={crewCast.credit_id} cast={crewCast} filter={ component.state.filter }/>;
				});

				return <div>
					<p>The actor has a role in the movie(s):</p>
					<p>Filter... 
						<input 
							type="text" 
							ref="filter" 
							placeholder="Enter keyword here to search in actors movie list" 
							onChange={ this.handleChangeFilter }
							size="60" /> 
					</p>
					{
						movieCasts
					}
					{
						crewCasts
					}
				</div>;
			}
		}
		else {
			return <div>There is not information about actor's movies</div>;
		}
	},

	handleChangeFilter: function() {
		if( this.refs.filter.value && this.refs.filter.value != '' ) {
			this.setState({ filter: this.refs.filter.value.trim() });
		}
		else {
			this.setState({ filter: '' });
		}
	}
});

Actor = React.createClass({
	getInitialState: function() {
		return {
			movieListVisible: false
		};
	},

	render: function(){
		return <div className="actorresult" style={{ padding: "15px" }} onClick={ this.handleClick }>
			<div>{this.props.actor.name}</div>
			<Photo url={this.props.actor.photo_url}/> 
			{ this.state.movieListVisible ? <MovieList movies={ this.props.actor.movies} /> : '' }
		</div>;
	},

	handleClick: function() {
		this.setState({ movieListVisible: true });
	}
});

ActorList = React.createClass({

	render: function() {
		if( this.props.actors && this.props.actors.length > 0 ) {
			return <div className="results">{
				this.props.actors.map(function(actor) {
					return <Actor key={""+actor.id} actor={actor}/>;
				})
			}</div>;
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

});

App = React.createClass({
	getInitialState: function() {
		return {
			actors: [],
			actorName: ''
		}
	},

	render: function() {
		return <div>
			<p>This a a simple app to search actor's movies.</p>
			<form onSubmit={this.search}>
				<p>Actor's name ?</p>
				<input type="text" ref="actor_name" />
				<input type="button" value="Search" onClick={this.search}/>
			</form>
			<ActorList actors={this.state.actors} actorName={this.state.actorName}/>
		</div>;
	},

	search: function(e) {
		e.preventDefault();
		var actorName = this.refs.actor_name.value;
		if( !actorName || actorName == "" ) {
			// clear the form and internal state
			this.setState({ actors: [], actorName: ''});
			return;
		}

		console.log( "searching..." + actorName );
		var url = "api.php/actor/" + encodeURIComponent(actorName);
		var component = this;

		axios.get( url )
		.then(function(response){
			console.log("response");
			console.log(response);
			//var nMatches = response.data;
			var actors = response.data.actors;
			console.log( actors );
			// update state to refresh list
			component.setState({ actors: actors, actorName: actorName });
		})
		.catch(function(error){
			console.log("error");
			console.log(error);
			// TODO: show an error to the user.
		});
	}
});

ReactDOM.render( <App/>, document.getElementById( 'app' ) );
