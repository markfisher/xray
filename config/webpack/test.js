module.exports = {
  devtool: 'eval',
  entry: {
    spec: `./spec/spec.js`
  },
  plugins: null,
  resolve: {
    alias: {
      'lodash.thottle': `${__dirname}/../../spec/support/mock_throttle.js`
    }
  },
  quiet: true,
  watch: true
};