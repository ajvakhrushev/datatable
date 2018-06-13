const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require( 'body-parser' );
const jsonMinify = require( 'node-json-minify' );

const config = (function() {

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

}());

var data = {
  stable: fetchData(),
  cache: null
};

var request = {
  filter: [],
  order: [],
  limit: 0,
  set: function(data) {
    this.filter = data.filter || [];
    this.order = data.order || [];
    this.limit = data.limit || 0;
  },
  isChanged: (function() {

    const makeOnSomeChanges = (next) => (entity) => next.key === entity.key && next.value === entity.value && next.type === entity.type;
    const makeOnSomeRemoving = (next) => (entity) => next.key === entity.key;

    return function(data) {
      return  (data.limit !== this.limit) ||
              !(data.filter.every((next) => this.filter.some(makeOnSomeChanges(next))) && this.filter.every((next) => data.filter.some(makeOnSomeRemoving(next)))) ||
              !(data.order.every((next) => this.order.some(makeOnSomeChanges(next))) && this.order.every((next) => data.order.some(makeOnSomeRemoving(next))));
    };

  }())
};

function fetchData() {
  // test for 1 000 000 entities
  // var data1 = JSON.parse(fs.readFileSync(config.path.fixture + '/clients.1.min.json', 'utf8'));
  // var data2 = JSON.parse(fs.readFileSync(config.path.fixture + '/clients.2.min.json', 'utf8'));
  // var data = data1.concat(data2);
  // test for 100 000 entities
  var data = JSON.parse(fs.readFileSync(config.path.fixture + '/clients.min.json', 'utf8'));

  return data;
}

function makeMultiplyFilterFn(list) {
  var length = list.length,
      strategies = list.map((next) => {
        var strategy = filterStrategies.define(next);

        next.method = strategy ? strategy.method : undefined;

        return next;
      });

  return function(next) {
    for(i = 0; i < length; i++) {
      var item = strategies[i],
					value = item.category === 'string' ? next[item.key].toLowerCase() : next[item.key];

      if(!item.method(value, item.value)) {
        return false;
      }
    }

    return true;
  };
}

function makeMultiplySortFn(list) {
   var length = list.length;

   list.sort((prev, next) => prev.order > next.order ? 1 : -1);

   return function(prev, next) {
      var a, b, item, reverse, result, i;

      for(i = 0; i < length; i++) {
        result = 0;
        item = list[i];

        a = prev[item.key];
        b = next[item.key];

        reverse = item.value ? -1 : 1;

        if (a < b) {
          result = reverse * -1;
        }

        if (a > b) {
          result = reverse * 1;
        }

        if(result !== 0) {
          return result;
        }
      }

      return result;
   };
}

// application server
const app = express();

app.use('/node_modules',  express.static(config.path.root + '/node_modules'));
app.use('/Utilities',  express.static(config.path.root + '/Utilities'));
app.use('/app', express.static(config.path.app));
app.use('/assets', express.static(config.path.assets));
app.use('/fixture', express.static(config.path.fixture));

app.get(/^.*$/, function (req, res) {
  res.sendFile(config.path.app + '/index.html');
});

app.listen(process.env.PORT || 3000, function () {
  console.log('App Server running on port 3000');
});

// api server
const api = express();

api.use(bodyParser.json());

api.use(( req, res, next ) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Accept', 'application/json');
  res.header('Content-Type', 'application/json');

  next();
});

api.post('/list', function (req, res) {
  if(!!request.isChanged(req.body)) {
    data.cache = data.stable.slice();
    request.set(req.body);

    if(req.body.filter.length > 0) {
      // console.log(JSON.stringify(req.body.filter));
      data.cache = data.cache.filter(makeMultiplyFilterFn(req.body.filter));
    }

    if(req.body.order.length > 0) {
      // console.log(JSON.stringify(req.body.order));
      data.cache.sort(makeMultiplySortFn(req.body.order));
    }
  }

  return res.json({
    list: data.cache.slice(req.body.offset, req.body.offset + req.body.limit),
    length: data.cache.length
  });
});

api.get('/list/:id', function (req, res) {
  var data = fetchData(),
      response = data.find((next) => next.id === req.params.id);

  res.json(response);
});

api.listen(process.env.PORT || 9000, function () {
  console.log('API Server running on port 9000');
});

// *********************************************************

var filterStrategies = (function() {

  var list = [
    {
      category: 'common',
      type: 'equals',
      method: (value, search) => value === search
    },
    {
      category: 'common',
      type: 'notEqual',
      method: (value, search) => value !== search
    },
    {
      category: 'number',
      type: 'lessThan',
      method: (value, search) => value < search
    },
    {
      category: 'number',
      type: 'lessThanOrEqual',
      method: (value, search) => value <= search
    },
    {
      category: 'number',
      type: 'greaterThan',
      method: (value, search) => value > search
    },
    {
      category: 'number',
      type: 'greaterThanOrEqual',
      method: (value, search) => value >= search
    },
    {
      category: 'string',
      type: 'contains',
      method: (value, search) => value.indexOf(search) !== -1
    },
    {
      category: 'string',
      type: 'startsWith',
      method: (value, search) => value.startsWith(search)
    },
    {
      category: 'string',
      type: 'endsWith',
      method: (value, search) => value.endsWith(search)
    },
  ];

  return {
    list: list,
    define: function() {
      var data = arguments[0] || {};

      return list .filter((next) => next.category === 'common' || next.category === data.category)
                  .find((next) => next.type === data.type);
    }
  };

}());
