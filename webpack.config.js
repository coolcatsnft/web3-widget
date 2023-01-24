const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const package = require('./package.json');

module.exports = (env) => {
  const isDevBuild = !(env && env.prod);

  const entry = {
    main: path.resolve(__dirname, '/src/index.js')
  };

  entry['main-' + package.version] = path.resolve(__dirname, '/src/index.js');

  return {
    mode: isDevBuild ? 'development' : 'production',
    entry: entry,
    output: {
      filename: '[name].js',
      path: isDevBuild ? path.resolve(__dirname, 'demo') : path.resolve(__dirname, 'build')
    },
    devtool: isDevBuild ? 'source-map': false,
    devServer: {
      static: {
        directory: path.join(__dirname, 'demo')
      },
      https: true
    },
    module: {
      rules: [
        { test: /\.html$/i, use: 'html-loader' },
        { test: /\.svg$/i, use: 'raw-loader' },
        { test: /\.css$/i, use: ['style-loader', 'css-loader' + (isDevBuild ? '' : '?minimize')] },

      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/assets'),
            to: isDevBuild ? path.resolve(__dirname, 'demo/assets') : path.resolve(__dirname, 'build/assets')
          }
        ]
      })
    ],
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    resolve: {
      fallback: {
        url: require.resolve('url'),
        fs: require.resolve('fs'),
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        'process/browser': require.resolve('process/browser')
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx']

    }
  };
};
