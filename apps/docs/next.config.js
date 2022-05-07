const withTM = require("next-transpile-modules")(["@editablejs/core"]);

module.exports = withTM({
  reactStrictMode: true,
  css: ['@/src/pages/*.less'],
});
