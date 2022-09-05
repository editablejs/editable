const path = require('node:path');
const replace = require('rollup-plugin-replace');

const external = [];

module.exports = (config) => {
  const { format } = config.output;

  if (format === 'umd') {
    config.external = (id) => {
      if (path.isAbsolute(id) || id.startsWith('.')) {
        return false;
      }

      if (external.includes(id)) {
        return true;
      }

      return false;
    };
  } else {
    config.external = (id) => {
      if (path.isAbsolute(id) || id.startsWith('.')) {
        return false;
      }

      return true;
    };
  }

  config.plugins.push(
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    })
  );

  return config;
};
