const webpack = require("webpack");
const webpackMerge = require("webpack-merge");
const path = require('path');


const commonConfig = require("./webpack.common");
const envData = require("./env/karma.js");
const toExclude = [ 
  path.resolve(__dirname, "../tests"),
  path.resolve(__dirname, "../build"),
  path.resolve(__dirname, "../config"),
  path.resolve(__dirname, "../dist"),
  path.resolve(__dirname, "../docs"),
  path.resolve(__dirname, "../node_modules"),
  //Add file to exclude here
  path.resolve(__dirname, "../src/locales"),
  path.resolve(__dirname, "../src/scripts/enums"),
  path.resolve(__dirname, "../src/scripts/videojs/plugins"),
  path.resolve(__dirname, "../src/tags/webplayer/templates/components/raw.tag"),
  path.resolve(__dirname, "../src/tags/webplayer/templates/components/loading.tag")
];

module.exports = webpackMerge(commonConfig, {
  mode: "development",
  node: { fs: "empty" },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use:  ['ignore-loader']
      },
      {
        test: /\.+(js|ts)$/,
        exclude: toExclude,
        enforce: 'post',
        use: {
          loader: 'istanbul-instrumenter-loader',
          options: { esModules: true }
        }
      },
      {
        test: /\.+tag$/,
        exclude: toExclude,
        enforce: 'post',
        use: {
          loader: 'istanbul-instrumenter-loader',
          options: { esModules: true }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(envData)
    })
  ]
});
