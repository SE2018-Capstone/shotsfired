const nodemon = require('nodemon');
const serverConfig = require('./webpack.config.server.js');
const express = require('express');
const path = require('path');
const webpack = require('webpack');


//var app = express();
//const clientConfig = require('./webpack.config.client.js');
//var clientCompiler = webpack(clientConfig);
//app.use(require('webpack-dev-middleware')(clientCompiler, {
//  noInfo: true,
//  publicPath: clientConfig.output.publicPath
//}));
//app.use(express.static(__dirname));
//
//app.use(require('webpack-hot-middleware')(clientCompiler));
//app.get('*', function(req, res) {
//  res.sendFile(path.resolve(__dirname, './index.html'));
//});
//
//app.listen(8080, 'localhost', function(err) {
//  if (err) {
//    console.log(err);
//    return;
//  }
//
//  console.log('Listening at http://localhost:8080');
//});
//





var serverCompiler = webpack(serverConfig);
serverCompiler.watch({
  aggregateTimeout: 300,
}, (err, stats) => {
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
