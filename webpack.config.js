const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const path = require('path');

const baseConfig = {
    output: {
        path: path.resolve('./dist'),
        filename: '[name].bundle.js'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
};

const clientConfig = merge(baseConfig, {
    entry: {
        ['static/client']: './src/client.tsx',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: '',
            filename: 'static/index.html',
            template: './src/index.html',
            chunks: []
        }),
    ],
    target: 'web'
});

const serverConfig = merge(baseConfig, {    
    entry: {
        server: './src/server.ts',
    },
    target: 'node'
});

module.exports = [ serverConfig, clientConfig ];