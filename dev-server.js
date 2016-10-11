const nodemon = require('nodemon');
const express = require('express');
const path = require('path');
const webpack = require('webpack');

const clientConfig = require('./webpack.config.client.js');
var clientCompiler = webpack(clientConfig);
clientCompiler.watch({
  aggregateTimeout: 300,
}, (err, stats) => {
  if (err)
    console.error(err);
});

const serverConfig = require('./webpack.config.server.js');
var serverCompiler = webpack(serverConfig);
serverCompiler.watch({
  aggregateTimeout: 300,
}, (err, stats) => {
  if (err)
    console.error(err);
});

nodemon({
  script: './dist/backend.js'
});

nodemon.on('start', function () {
  console.log('App has started');
}).on('quit', function () {
  console.log('App has quit');
}).on('restart', function (files) {
  console.log('App restarted due to: ', files);
});
