module.exports = (env, argv) => ({
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			}
		]
	},
	output: {
		library: 'Plotfast',
	},
	devServer: {
		historyApiFallback: {
			index: 'index.html'
		}
	}
})