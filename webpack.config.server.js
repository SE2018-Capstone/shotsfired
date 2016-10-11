const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

var config = require('./webpack.config.client.js');

config = Object.assign({}, config, {
  target: 'node',
  node: { __dirname: false, __filename: false },
  entry: './src/server.ts',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'backend.js'
  },
  externals: [nodeExternals()],
});
module.exports = config;
