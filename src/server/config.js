const path = require('path');

module.exports = function() {
  var root = path.resolve(__dirname, '../../'),
    src = root + '/src';

  return {
    path: {
      root: root,
      src: src,
      app: src + '/app',
      assets: src + '/assets',
      fixture: src + '/fixture'
    }
  };
}();
