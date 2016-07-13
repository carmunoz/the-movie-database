var React = require('react');
var ReactDOM = require( 'react-dom' );

App = React.createClass({
	render: function() {
		return <div>
			This a test of DIV
		</div>;
	}
});

ReactDOM.render( <App/>, document.getElementById( 'app' ) );
