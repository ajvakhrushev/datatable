(function(win) {
  'use strict';

  var view;

  // function initView(params) {
  //   if(view) {
  //     view.destroy();
  //   }

    var view = new win.app.views.List({
      el: win.document.querySelector('#content')
    });

    view.render();

  // }

}(window));