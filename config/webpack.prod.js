// webpack v4
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common');

const path = require('path');

const MinifyPlugin = require("babel-minify-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ManifestPlugin = require('webpack-manifest-plugin');

const envData = require("./env/prod.js");

module.exports = webpackMerge(commonConfig, {
  output: {
    filename: 'amadeus-video-player.min.[hash].js',
    path: path.resolve(__dirname, '../build')
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader", // Run post css actions
            options: {
              plugins: function() {
                // post css plugins, can be exported to postcss.config.js
                return [require("precss"), require("autoprefixer")];
              }
            }
          },
          "sass-loader"
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'amadeus-video-player.[contenthash].css'
    }),
    new MinifyPlugin({
      builtIns : false
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(envData)
    }),
    new ManifestPlugin({
      publicPath : 'https://storage.googleapis.com/travelcast/stable/',
      filter : function (fd) {
        return fd.name.indexOf('main.') > -1;
      }
    }), 
    new CopyWebpackPlugin([{
      from: 'src/loader.js',
      to: './'
    }])
  ]
});