var path = require("path");

module.exports = {
  context: __dirname,
  //entry: "./app/client.js",
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
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
