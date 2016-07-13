var React = require('react');
var ReactDOM = require( 'react-dom' );
var axios = require('axios');

// TODO: declare "results", "noresults" and "actorresult" in CSS

Actor = React.createClass({
	render: function(){
		// TODO: create component to render movie list for the actor
		// TODO: create component to render the image profile properly

		return <div className="actorresult">
			<div>{this.props.actor.name}</div>
			<div>{this.props.actor.profile_path}</div> 
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
