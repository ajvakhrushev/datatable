(function(win) {
  'use strict';

  const url = window.location;

  win.app.config = {
    endpoint: url.protocol + '//' + url.hostname + ':9000'
  };

}(window));