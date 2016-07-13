var React = require('react');
var ReactDOM = require( 'react-dom' );
var axios = require('axios');

App = React.createClass({
	render: function() {
		return <div>
			<p>This a a simple app to search actor's movies.</p>
			<form onSubmit={this.search}>
				<p>Actor's name ?</p>
				<input type="text" ref="actor_name" />
				<input type="button" value="Search" onClick={this.search}/>
			</form>
		</div>;
	},

	search: function(e) {
		e.preventDefault();
		var actorName = this.refs.actor_name.value;
		if( !actorName || actorName == "" ) {
			// do nothing if the entry is empty.
			return;
		}

		console.log( "searching..." + actorName );
		var url = "api.php/actor/" + encodeURIComponent(actorName);
		axios.get( url )
		.then(function(response){
			console.log("response");
			console.log(response);
			//var nMatches = response.data;
			var actors = response.data.actors;
			console.log( actors );
			
		})
		.catch(function(error){
			console.log("error");
			console.log(error);
		});
		console.log(axios);
	}


});

ReactDOM.render( <App/>, document.getElementById( 'app' ) );
