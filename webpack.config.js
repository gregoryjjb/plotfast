module.exports = (env, argv) => ({
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					'file-loader'
				]
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