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
    'transform-promise-to-bluebird',
  ],
};
