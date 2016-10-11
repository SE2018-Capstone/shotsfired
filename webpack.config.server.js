const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.config.client.js');
config.target = 'node';
config.entry = './src/server.ts';
config.output = {
  path: path.join(__dirname, 'dist'),
  filename: 'backend.js'
}
module.exports = config;
