var HtmlWebpackPlugin = require( 'html-webpack-plugin' );
var webpack = require('webpack');
var sha1File = require('sha1-file');

module.exports = {
    entry: {
	app: './jsx/app.jsx'
    },
    output: {
	filename: 'build/[name].js'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.jsx$/, loader: 'jsx-loader?harmony&target=es3' }
        ]
    },
    plugins: [
	    new webpack.DefinePlugin({
		    'process.env': {
			'NODE_ENV': JSON.stringify('production')
		    }
	    }),
	    new HtmlWebpackPlugin( {
		    template: 'include.js.php.ejs',
		    filename: 'include.js.php',
		    inject: false,
		    sha1File: sha1File,
		    cache: false
	    } ),
	    new webpack.optimize.OccurrenceOrderPlugin()
    ]
};
