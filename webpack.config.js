/**
 * https://webpack.js.org/concepts/
 */
const path = require('path');

module.exports = {
  mode: 'development',
  // mode: 'production',
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {test: /\.txt$/, use: 'raw-loader'}
    ]
  }
};