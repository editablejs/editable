const withTM = require("next-transpile-modules")(["@editablejs/selection"]);

module.exports = withTM({
  reactStrictMode: true,
});
