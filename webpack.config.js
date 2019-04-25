var libConfig = {
    entry: {
      library: './lib/all.ts'
	  },
    target: 'node',
    mode: 'development',
    output: {
        library: 'jsondb',
        libraryTarget: 'umd',
        path: __dirname + '/dist',
        filename: 'jsondb.js'
    },

    // Enable source maps
    devtool: "source-map",

	externals: {
    "@terrencecrowley/util": "commonjs @terrencecrowley/util",
    "@terrencecrowley/context": "commonjs @terrencecrowley/context",
    "@terrencecrowley/dbabstract": "commonjs @terrencecrowley/dbabstract",
    "@terrencecrowley/log": "commonjs @terrencecrowley/log",
    "@terrencecrowley/fsm": "commonjs @terrencecrowley/fsm",
    "@terrencecrowley/storage": "commonjs @terrencecrowley/storage"
	},
		

    module: {
		rules: [
			{ test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
			{ test: /\.json$/, loader: 'json-loader' },
			{ test: /\.js$/, enforce: "pre", loader: "source-map-loader" }
		]
    },

    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    }

};

module.exports = [ libConfig ];
