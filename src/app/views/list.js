(function(win) {
  'use strict';

  var Constructor = (function() {

    var extend = Object.assign;

    return function(options) {

      var self = this;

      this.el = options.el;

      this.model = new win.app.models.List();

      this.init = function() {

        // this.model.on('list:changed', this.render);
        // this.model.on('item:changed', this.render);

        // this.render();

      };

      this.render = function() {
        
        this.el.innerHTML = '<div style="height: 400px;" class="ag-fresh common-datatable"></div>';

        new win.agGrid.Grid(this.el.querySelector('.common-datatable'), this.gridOptions);
      }.bind(this);

      this.destroy = function() {
        // this.model.off('list:changed', this.render);
        // this.model.off('item:changed', this.render);
      };

      this.columnDefault = {
        // suppressMenu: true,
        unSortIcon: true,
        filterParams: {apply: true},
        width: 150,
        minWidth: 150,
        maxWidth: 150
      };

      this.columnDefs = [
        Object.assign({}, this.columnDefault, {
          field: "index",
          headerName:  "Index",
          suppressSorting: true,
          suppressFilter: true,
          width: 75,
          minWidth: 75,
          maxWidth: 75
        }),
        Object.assign({}, this.columnDefault, {
          field: "firstName",
          headerName:  "First Name"
        }),
        Object.assign({}, this.columnDefault, {
          field: "lastName",
          headerName:  "Last Name"
        }),
        Object.assign({}, this.columnDefault, {
          field: "age",
          headerName:  "Age",
          filter: 'number',
          width: 75,
          minWidth: 75,
          maxWidth: 75
        }),
        Object.assign({}, this.columnDefault, {
          field: "gender",
          headerName:  "Sex",
          width: 75,
          minWidth: 75,
          maxWidth: 75
        }),
        Object.assign({}, this.columnDefault, {
          field: "company",
          headerName:  "Company"
        }),
        Object.assign({}, this.columnDefault, {
          field: "street",
          headerName:  "Street"
        }),
        Object.assign({}, this.columnDefault, {
          field: "city",
          headerName:  "City"
        }),
        Object.assign({}, this.columnDefault, {
          field: "state",
          headerName:  "State"
        }),
        // Object.assign({}, this.columnDefault, {
        //   field: "registered",
        //   headerName:  "Registered",
        //   valueGetter: function(params) {
        //     return params.data ? new Date(params.data.registered) : null;
        //   },
        //   cellRenderer: function(params) {
        //     return params.value ? params.value.format() : '';
        //   }
        // }),
        Object.assign({}, this.columnDefault, {
          field: "married",
          headerName:  "Married"
        }),
      ];

      this.gridOptions = {
        enableServerSideFilter: true,
        enableServerSideSorting: true,
        columnDefs: this.columnDefs,
        headerHeight: 50,
        rowHeight: 30,
        // tell grid we want virtual row model type
        rowModelType: 'virtual',
        // how big each page in our page cache will be, default is 100
        paginationPageSize: 100,
        // how many extra blank rows to display to the user at the end of the dataset,
        // which sets the vertical scroll and then allows the grid to request viewing more rows of data.
        // default is 1, ie show 1 row.
        paginationOverflowSize: 2,
        // how many server side requests to send at a time. if user is scrolling lots, then the requests
        // are throttled down
        maxConcurrentDatasourceRequests: 2,
        // how many rows to initially show in the grid. having 1 shows a blank row, so it looks like
        // the grid is loading from the users perspective (as we have a spinner in the first col)
        paginationInitialRowCount: 1,
        // how many pages to store in cache. default is undefined, which allows an infinite sized cache,
        // pages are never purged. this should be set for large data to stop your browser from getting
        // full of data
        maxPagesInCache: 2,

        datasource: {
            rowCount: null,
            store: {
              filter: {
                hash: {},
                mapFilterForModel: (function() {

                  function mapItem(key, value) {
                    var data = value || {};

                    return {
                      key: key,
                      value: data.filter,
                      type: data.type
                    };
                  }

                  return function(hash) {
                    var self = this,
                        nextList = [];

                    for(var i in self.hash) {
                      if(!self.hash.hasOwnProperty(i)) {
                        continue;
                      }

                      nextList.push(hash[i] ? mapItem(i, hash[i]) : mapItem(i, {filter: undefined}));
                    }

                    for(var i in hash) {
                      if(!hash.hasOwnProperty(i)) {
                        continue;
                      }

                      if(!self.hash[i]) {
                        nextList.push(mapItem(i, hash[i]));
                      }
                    }

                    return nextList;
                  };

                }())
              },
              order: {
                list: [],
                mapOrderForModel: (function() {

                  function onFind(next) {
                    return function(entity) {
                      return next.colId === entity.colId;
                    }
                  }

                  return function(list) {
                    var self = this,
                        nextList = self.list
                                          .map(function(next) {
                                            var item = list.find(onFind(next));

                                            if(item) {
                                              next.sort = item.sort;
                                            } else {
                                              next.sort = undefined;
                                              delete next.order;
                                            }

                                            return next;
                                          }),
                        maxOrder = nextList
                                          .reduce(function(prev, next) {
                                            return next.order && next.order > prev ? next.order : prev;
                                          }, 0),
                        newItems = list
                                      .filter(function(next) {
                                        return !self.list.some(onFind(next));
                                      })
                                      .map(function(next) {
                                        maxOrder++;

                                        next.order = maxOrder;

                                        return next;
                                      });

                    return nextList
                                  .concat(newItems)
                                  .map(function(next) {
                                      return {
                                          key: next.colId,
                                          value: next.sort === 'asc' ? true : (next.sort === 'desc' ? false : undefined),
                                          order: next.order
                                      };
                                  });
                  };

                }())
              },
            },
            getRows: function(params) {
              var nextOrder = params.sortModel || [],
                  nextFilter = params.filterModel || {},
                  data = {
                      offset: params.startRow,
                      order: this.store.order.mapOrderForModel(nextOrder),
                      filter: this.store.filter.mapFilterForModel(nextFilter)
                  };

              this.store.order.list = nextOrder.map(function(next) {
                var item = data.order.find(function(entity) {
                  return next.colId === entity.key;
                });

                next.order = item.order;

                return next;
              });
              this.store.filter.hash = nextFilter;

              self.gridOptions.api.showLoadingOverlay();

              self.model.fetch(data).then(function(response) {
                  params.successCallback(response, self.model.length <= params.endRow ? self.model.length : -1);
                  self.gridOptions.api.hideOverlay();
              });
            }
        },

        onGridReady: function () {
          
        },
        onModelUpdated: function() {
          
        }
      };

      this.init();

    };

  }());

  Object.assign(Constructor.prototype, new win.Utilities.Observer());

  win.app.views.List = Constructor;

}(window));