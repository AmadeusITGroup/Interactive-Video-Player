// webpack v4
const webpack = require("webpack");
const webpackMerge = require("webpack-merge");
const commonConfig = require("./webpack.common");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const envData = require("./env/dev.js");

module.exports = webpackMerge(commonConfig, {
  mode: "development",
  output: {
    filename: "amadeus-video-player.js"
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
      filename: "amadeus-video-player.css"
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(envData)
    })
  ]
});
