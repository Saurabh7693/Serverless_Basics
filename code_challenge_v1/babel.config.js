module.exports = {
  retainLines: true,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '8.10.0',
        },
      },
    ],
  ],
  plugins: [
    'source-map-support',
    'transform-promise-to-bluebird',
  ],
};
