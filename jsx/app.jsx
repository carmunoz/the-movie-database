var React = require('react');
var ReactDOM = require( 'react-dom' );
var axios = require('axios');

// TODO: declare "results", "noresults" and "actorresult" in CSS

// TODO: show a message when the total result is greater than current list (limited to 20 for performance reasons). 
// Something like 'there are XXX more results...'
// this should happen when the user search for "John" or other common name.
// The proper way is to use or create a pagination component.

// TODO: show a clock indicator when there is an Ajax call in progress.

// TODO: add click handler for actors to show the actor's movie list

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

Actor = React.createClass({
	render: function(){
		// TODO: create component to render movie list for the actor

		return <div className="actorresult">
			<div>{this.props.actor.name}</div>
			<Photo url={this.props.actor.photo_url}/> 
		</div>;
	}
});

ActorList = React.createClass({
	render: function() {
		if( this.props.actors && this.props.actors.length > 0 ) {
			return <div className="results">{
				this.props.actors.map(function(actor) {
					return <Actor actor={actor}/>;
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
