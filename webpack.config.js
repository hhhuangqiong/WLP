var path = require("path");

module.exports = {
  devtool: "eval",
  context: __dirname,
  //entry: "./app/client.js",
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel?cacheDirectory=true" },
      { test: /\.json$/, loader: "json" }
    ]
  },
  // necessary? even `gulp.dest` exists
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js"
  },
  node: {
    "net": "empty",
    "dns": "empty"
  }
};
