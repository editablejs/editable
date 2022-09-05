const path = require('node:path');
const replace = require('rollup-plugin-replace');

const external = [
  'react',
  'react-dom',
  '@editablejs/editable-breaker',
  '@editablejs/editable-editor',
];

module.exports = (config) => {
  config.external = (id) => {
    if (path.isAbsolute(id) || id.startsWith('./')) {
      return false;
    }

    if (external.includes(id)) {
      return true;
    }

    return false;
  };

  config.output.globals['react'] = 'React';
  config.output.globals['react-dom'] = 'ReactDOM';
  config.output.globals['@editablejs/editable-breaker'] = 'EditableBreaker';
  config.output.globals['@editablejs/editable-editor'] = 'EditableEditor';

  config.plugins.push(
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    })
  );

  return config;
};
