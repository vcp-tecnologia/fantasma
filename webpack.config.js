var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

// Manually add the native Phantom JS modules used in the project
nodeModules['webpage'] = 'commonjs webpage';

module.exports = {
  target: 'node',

  entry: [
    './src/main'
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'scraper.js'
  },

  externals: nodeModules,

  node: {
    __dirname: true
  },

  module: {
    loaders: [
      {
        loader: 'babel',

        test: /\.js$/,

        exclude: [
          /node_modules/,
        ],

        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'stage-0'],
        },
      },

      {
        loader: 'json',
        
        test: /\.json$/, 
      },
    ]
  },

  resolve: {
    extensions: ['', '.js', '.json']
  }
}