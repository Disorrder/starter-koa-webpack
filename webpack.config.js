'use strict';
const os = require('os');
const path = require('path');
const webpack = require('webpack');

var cfg = require('./buildconfig.json');
const npm = require('./package.json');
const bower = require('./bower.json');
const pug = require('pug');

const WebpackNotifierPlugin = require('webpack-notifier');
const CleanWebpackPlugin  = require('clean-webpack-plugin');
const CopyWebpackPlugin   = require('copy-webpack-plugin');
const HtmlWebpackPlugin   = require('html-webpack-plugin');
// const BowerWebpackPlugin = require("bower-webpack-plugin");

// env variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
function isDev() { return process.env.NODE_ENV == 'development' }
function isProd() { return process.env.NODE_ENV == 'production' }
function isMac() { return os.platform() == 'darwin' }
function isWin() { return os.platform() == 'win32' }

var flags = {
    watch: false,
    // watch: isDev(),
    clean: isProd(),
    sourcemaps: !isMac() && isDev(),
    notify: isDev(),
}

console.log(process.env.NODE_ENV, 'mode');
console.log('flags', flags);

module.exports = {
    context: path.resolve(cfg.path.app),
    debug: true,
    watch: flags.watch,
    entry: {
        vendor: `app/vendor.js`,
        app: `app/app.entry.js`,
        // vendor: Object.keys(npm.dependencies)//.concat(Object.keys(bower.dependencies || []))
    },
    output: {
        path: cfg.path.build,
        // publicPath: cfg.path.build,
        filename: '[name].js',
        library: '[name]'
    },
    devtool: flags.sourcemaps ? "cheap-source-map" : null,
    devServer: {
        port: cfg.webserver.port,
        host: cfg.webserver.host,
        inline: true,
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        },
        outputPath: cfg.path.build,
        contentBase: cfg.path.src
    },
    resolve: {
        root: path.resolve(cfg.path.app),
        // Tell webpack to look for required files in bower and node
        modulesDirectories: ['../bower_components', '../node_modules'],
        extensions: ['', '.js', '.coffee', '.json']
    },
    resolveLoader: {
        root: path.resolve('./node_modules'),
        // modulesDirectories: ['node_modules'],
        extensions: ['', '.js']
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: "babel-loader", exclude: [/node_modules/, /bower_components/], query: { presets: ['es2015', 'stage-2'] } },
            // { test: /\.coffee$/, loader: "coffee-loader" },
            { test: /\.(pug|jade)$/, loader: "pug-loader" },
            { test: /\.css$/,       loader: "style!css-loader"},
            { test: /\.styl$/,      loader: "style!css-loader!stylus" },
            { test: /\.font\.(js|json)$/, loader: "style!css!fontgen" },
            { test: /\.(jpeg|jpg|png|gif)$/i, loader: "file-loader"},
            { test: /\.(woff|svg|ttf|eot)([\?]?.*)$/, loader: "file-loader?name=[name].[ext]"},
        ],
        noParse: /\.min\.js$/
    },
    plugins: [
        flags.notify ? new WebpackNotifierPlugin({excludeWarnings: true}) : new Function(),
        flags.clean ? new CleanWebpackPlugin([cfg.path.build]) : new Function(),

        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'app/pages/main/index.html',
        }),

        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
        ),
        new webpack.DefinePlugin({
            'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),

        new CopyWebpackPlugin([
            { from: 'config.js' },
            { from: 'favicon.*' },
            { from: 'assets/', to: 'assets/' },
            // { from: '**/*.html', to: '[name].[ext]' },
            // {
            //     from: '{*,app/pages/**/*,app/errors/**/*}.pug', to: '[name].html',
            //     transform: (content, filepath) => pug.compile(content, {pretty: true})()
            // }
        ]),

        // new SplitByPathPlugin([
        //     {
        //         name: 'vendor',
        //         path: [
        //             path.resolve('./node_modules'),
        //             path.resolve('./bower_components')
        //         ]
        //     }
        // ]),

        new webpack.ProvidePlugin({
           $: 'jquery',
           jQuery: 'jquery',
           _: 'lodash',
        })
    ]
}

if (cfg.api && cfg.api.active) {
    module.exports.devServer.proxy = {
        '/api/**': { target: `http://${cfg.api.host}:${cfg.api.port}`, secure: false }
    }
}
