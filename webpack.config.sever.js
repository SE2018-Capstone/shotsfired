const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.config.js');
config.target = 'node';
config.entry = './src/server.ts';
config.output = {
  path: path.join(__dirname, 'dist'),
  filename: 'backend.js'
}
module.exports = config;
