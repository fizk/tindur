const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: './src/client/index.tsx',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'client')
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Tindur',
            template: './src/client/index.html',
            publicPath: '/tindur/',
            scriptLoading: 'defer',
            minify: true,
            hash: true,
            xhtml: true,
        }),
        new MiniCssExtractPlugin({filename: 'app.css'}),
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.png$/i,
                type: 'asset/resource',
                generator: {
                // keep original filenames
                    filename: 'images/[name][ext]', 
                },
            },
            {
                test: /\.jpg$/i,
                type: 'asset/resource',
                generator: {
                // keep original filenames
                    filename: 'images/[name][ext]', 
                },
            },
            {
                test: /\.otf$/i,
                type: 'asset/resource',
                generator: {
                // keep original filenames
                    filename: 'fonts/[name][ext]', 
                },
            },
            {
                test: /\.svg$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'icons/[name][ext]', 
                },
            },
            {
                test: /\.woff$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext]', 
                },
            },
        ]
    },
    devtool: 'eval-source-map',
};
