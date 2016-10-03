(function(win) {
  'use strict';

  var Constructor = (function() {

    return function () {

      return {

        createGUID: (function() {

          function onReplaceGUID(c) {
            var r = Math.random()*16|0,
                v = c == 'x' ? r : (r&0x3|0x8);

            return v.toString(16);
          }

          return function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, onReplaceGUID);
          }

        }()),

        inherit: function (Child, Parent) {
            Child.prototype = Object.create(Parent.prototype);
            Child.prototype.constructor = Child;
        },

        getMaxInteger: function() {
            return Number.MAX_SAFE_INTEGER || MAX_INTEGER;
        },

        rgbToHex: (function() {

          function convertToHex(c) {
            return ('0' + c.toString(16)).slice(-2);
          }

          return function (r, g, b) {
            return "#" + convertToHex(r) + convertToHex(g) + convertToHex(b);
          };

        }()),

        hexToRgb: (function() {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
                matchRegex =  /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

            function shorthandToFull(hex) {
              return hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
              });
            }

            return function (hex) {
              var result = matchRegex.exec(shorthandToFull(hex));

              return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
              } : null;
            };

        }())

      };
      
    };

  }());

  win.Utilities.base = new Constructor();

}(window));