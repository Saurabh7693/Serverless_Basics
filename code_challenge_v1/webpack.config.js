/**
 * Webpack configuration for this service.
 * This file is used to configure webpack, which will create "compiled"
 * versions of the files in your microservice. The settings here are
 * used by the `serverless-webpack` plugin to automatically watch and rebuild
 * your project when you run `npm start`.
 * @since 5/24/18
 * @file
 */

const path = require('path');
const fp = require('lodash/fp');
const webpack = require('webpack');
const slsw = require('serverless-webpack');
const externals = require('webpack-node-externals');

const isJavaScriptFile = x => path.extname(x) === '.js';

// Fixes an issue where in some projects python files were being
// used in serverless.yml and also being referenced here which
// made webpack blow up since it doesn't handle `.py` files.
const getOnlyJavaScriptEntries = fp.pickBy(isJavaScriptFile);

module.exports = {
  entry: getOnlyJavaScriptEntries(slsw.lib.entries),
  externals: [externals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  // Keeps the console quiet (won't display verbose chunk output info).
  stats: 'minimal',
  // Adds source maps to the output for debugging
  // We'll include these in any deployed content to better trace bugs.
  // Using this in tandem with the `babel-plugin-source-map-support-for-6`
  // module, we can get accurate stack traces.
  devtool: 'source-map',
  // Setting to production mode to ensure production optimized code.
  // This will prevent omitting the bundle on any errors and ensure
  // that process.env.NODE_ENV is 'production'
  mode: 'production',
  // Uses `require` to import chunks
  target: 'node',
  // We'll be bundling the files into seperate "chunks", each with their
  // original file name. Note, `node_modules` are excluded from bundling,
  // so the output code will only be the file itself "bundled".
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
  },
  plugins: [
    new webpack.IgnorePlugin(/^.*\/aws-sdk$/),
  ],
};
