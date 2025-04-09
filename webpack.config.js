const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
    entry: {
        'plugin.js': './plugin/index.ts',
        'ui.js': './ui/index.ts',
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    esModule: true
                }
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                    transpileOnly: true
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.vue'],
        alias: {
            'vue': 'vue/dist/vue.esm-bundler.js'
        }
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyPlugin({
            patterns: [{ from: "ui/index.html", to: "ui.html" }],
        }),
    ],
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name]',
    },
};
