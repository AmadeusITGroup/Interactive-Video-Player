// webpack v4
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common');

const MinifyPlugin = require("babel-minify-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const envData = require("./env/prod.js");

const mode = process.env.mode || 'production';

let configuration = webpackMerge(commonConfig, {
  output: {
    filename: 'amadeus-video-player.min.js'    
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
      filename: 'amadeus-video-player.css'
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(envData)
    })
  ]
});

if (mode === 'production') {
  console.log('Adding MinifyPlugin');
  configuration = webpackMerge(configuration, {
    plugins: [
      new MinifyPlugin({
        builtIns : false
      })
    ]
  });
}

module.exports = configuration;