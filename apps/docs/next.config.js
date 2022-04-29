const withTM = require("next-transpile-modules")(["@editablejs/core"]);

module.exports = withTM({
  reactStrictMode: true,
  ssr: false,
  css: ['@/src/pages/*.less'],
});
