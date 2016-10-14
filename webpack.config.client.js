const path = require('path');

var phaserModule = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
var pixi = path.join(phaserModule, 'build/custom/pixi.js');
var p2 = path.join(phaserModule, 'build/custom/p2.js');

module.exports = {
  entry: [
    './src/client/index.tsx',
  ],
  output: {
    filename: './dist/bundle.js',
    path: path.resolve(__dirname, ''),
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  module: {
    loaders: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /pixi\.js/, loader: 'expose?PIXI' },
      { test: /phaser-split\.js$/, loader: 'expose?Phaser' },
      { test: /p2\.js/, loader: 'expose?p2' },
      { test: /\.tsx?$/, loaders: ['ts-loader'] },
      { test: /\.json?$/, loader: 'json-loader' },
    ],

    preLoaders: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: 'source-map-loader' },
    ]
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.json'],
    alias: {
      'phaser': phaser,
      'pixi': pixi,
      'p2': p2,
    },
  },

//  externals: [nodeExternals()],
};
