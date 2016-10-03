(function(win) {
  'use strict';

  var Constructor = (function() {

    return function(options) {
      var data = options || {};

      this.list = [];
      this.item = null;
      this.length = data.length || 0;
      this.limit = data.limit || 100;
      this.offset = data.offset || 0;
      
      this.order = new win.app.models.OrderModel(data.order || []);
      this.filter = new win.app.models.FilterModel(data.filter || []);
      this.rest = new win.app.models.RestModel({
        url: win.app.config.endpoint + '/list',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      this.fetch = function(data, options) {
        var self = this,
            params = {
              "limit": this.limit,
              "offset": data.offset || 0,
              "order": this.order.preUpdate(data.order),
              "filter": this.filter.preUpdate(data.order)
            };

        return this.rest.fetch(params, options).then(function(response) {
            self.offset = params.offset;
            self.list = response.list;
            // self.list = response.list.map(function(next, index) {
            //   next.index = params.offset + index;

            //   return next;
            // });

            if(params.offset === 0) {
              self.length = response.length;
            }

            self.order.set(params.order);
            self.filter.set(params.filter);

            return self.list;
        });
      };

      this.setItem = function(id) {
        var self = this,
            item = self.list.find(function(next) {
              return next.id === id;
            });

        self.rest.read({id: id}).then(function(data) {
          Object.assign(item, data);

          self.trigger('item:changed');
        });
      };

      

      return this;

    }

  }());

  Object.assign(Constructor.prototype, new win.Utilities.Observer());

  win.app.models.List = Constructor;

}(window));