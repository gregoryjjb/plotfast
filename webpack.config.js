const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => ({
	entry: path.join(__dirname, 'examples/index.js'),
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
			//{
			//	test: /\.html?$/,
			//	loader: "file-loader?name=[name].[ext]"
			//},
		]
	},
	output: {
		library: 'Plotfast',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'examples/index.html'),
			filename: './index.html',
		}),
	],
	//devServer: {
	//	historyApiFallback: {
	//		index: 'index.html'
	//	}
	//}
})