const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => {
    return {
        entry:
            argv.mode === 'production'
                ? path.join(__dirname, 'src/index.ts')
                : path.join(__dirname, 'src/index.ts'), // Example
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: ['file-loader'],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            filename: 'plotfast.min.js',
            path: path.resolve(__dirname, 'dist', 'min'),
            library: 'Plotfast',
            libraryExport: 'default',
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'examples/index.html'),
                filename: './index.html',
                inject: 'head',
            }),
        ],
    };
};
