(function(win) {
  'use strict';

  var Constructor = (function() {

    function onSuccess(response) {
      return response.json();
    }

    var Constructor = function(options) {

      var data = options || {},
          url = data.url || '',
          headers = data.headers || {};

      this.fetch = function (data, options) {
        var params = Object.assign({
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data || {})
        }, options);

        return win.fetch(url, params).then(onSuccess);
      };

      this.read = function (data, options) {
        var params = Object.assign({
          method: 'GET',
          headers: headers
        }, options);

        return win.fetch(url + '/' + data.id, params).then(onSuccess);
      };

      this.create = function (data, options) {
        var params = Object.assign({
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data || {})
        }, options);

        return win.fetch(url, params).then(onSuccess);
      };

      this.update = function (data) {
        var params = Object.assign({
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(data || {})
        }, options);

        return win.fetch(url + '/' + data.id, params).then(onSuccess);
      };

      this.delete = function (data, options) {
        var params = Object.assign({
          method: 'DELETE',
          headers: headers
        }, options);

        return win.fetch(url + '/' + data.id, params).then(onSuccess);
      };
    
    };

    return Constructor;
      
  }());

  Object.assign(Constructor.prototype, new win.Utilities.Observer());

  win.app.models.RestModel = Constructor;

}(window));