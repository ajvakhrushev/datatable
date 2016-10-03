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

// var data1 = JSON.parse(fs.readFileSync(config.path.fixture + '/clients.1.min.json', 'utf8'));
// var data2 = JSON.parse(fs.readFileSync(config.path.fixture + '/clients.2.min.json', 'utf8'));

var data = {
  // stable: data1.concat(data2),
  stable: JSON.parse(fs.readFileSync(config.path.fixture + '/clients.min.json', 'utf8')),
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

    const makeOnSomeChanges = (next) => (entity) => next.key === entity.key && next.value === entity.value;
    const makeOnSomeRemoving = (next) => (entity) => next.key === entity.key;

    return function(data) {
      return  (data.limit !== this.limit) ||
              !(data.filter.every((next) => this.filter.some(makeOnSomeChanges(next))) && this.filter.every((next) => data.filter.some(makeOnSomeRemoving(next)))) ||
              !(data.order.every((next) => this.order.some(makeOnSomeChanges(next))) && this.order.every((next) => data.order.some(makeOnSomeRemoving(next))));
    };

  }())
};

function fetchData() {
  return JSON.parse(fs.readFileSync(config.path.fixture + '/data.json', 'utf8'));
  // return JSON.parse(fs.readFileSync(config.path.fixture + '/olympicWinners.json', 'utf8'));
  // return JSON.parse(fs.readFileSync(config.path.fixture + '/clients.json', 'utf8'));
}

function makeMultiplyFilterFn(list) {
   return function(next) {
      return true;
   };
}

function makeMultiplySortFn(list) {
   var length = list.length;

   list.sort((prev, next) => prev.order > next.order ? 1 : -1);
   // console.log(JSON.stringify(list));

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

app.listen(3000, function () {
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

api.listen(9000, function () {
  console.log('API Server running on port 9000');
});

// *********************************************************
