const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => ({
    entry: path.join(__dirname, 'src/index.ts'),
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            /*{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			},*/
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader'],
            },
            //{
            //    test: /\.html?$/,
            //    loader: 'file-loader?name=[name].[ext]',
            //},
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'umd'),
        library: 'Plotfast',
        libraryTarget: 'umd',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'index.html'),
            filename: './index.html',
        }),
    ],
    //devServer: {
    //	historyApiFallback: {
    //		index: 'index.html'
    //	}
    //}
});
