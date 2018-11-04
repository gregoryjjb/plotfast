const HtmlWebpackPlugin = require('html-webpack-plugin');

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
			},
			{
				test: /\.html?$/,
				loader: "file-loader?name=[name].[ext]"
			},
		]
	},
	output: {
		library: 'Plotfast',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.html',
			filename: './dist/index.html',
		}),
	],
	//devServer: {
	//	historyApiFallback: {
	//		index: 'index.html'
	//	}
	//}
})