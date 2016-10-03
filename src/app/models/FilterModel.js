(function(win) {
  'use strict';

  var Constructor = (function() {

    var Constructor = function() {

      this.list = [];
    
    };

    function update() {
      var list = arguments[0] || [],
          nextList = arguments[1] || [];

      nextList.forEach(function(next) {
        var index = list.findIndex(function(entity) {
          return next.key === entity.key;
        });

        if(next.value === undefined) {
          // delete EXISTING item
          list.splice(index, 1);
        } else if(index >= 0) {
          // replace EXISTING item
          list.splice(index, 1, next);
        } else {
          // add NEW item
          list.splice(-1, 0, next);
        }
      });

      return list;
    }

    Constructor.prototype.set = function(data) {
      if(!data) {
        return;
      }

      this.list = data;
    };

    Constructor.prototype.reset = function() {
      this.list = [];
    };

    Constructor.prototype.preUpdate = function(list) {
      return update(this.list.slice(), list);
    };

    // Constructor.prototype.update = function(list) {
    //   update(this.list, list);
    // };

    return Constructor;
      
  }());

  Object.assign(Constructor.prototype, new win.Utilities.Observer());

  win.app.models.FilterModel = Constructor;

}(window));