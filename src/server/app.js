const express = require('express');
const config = require('./config');

const PORT = process.env.PORT || 3000;

const app = express();

app.use('/node_modules',  express.static(config.path.root + '/node_modules'));
app.use('/Utilities',  express.static(config.path.root + '/Utilities'));
app.use('/app', express.static(config.path.app));
app.use('/assets', express.static(config.path.assets));
app.use('/fixture', express.static(config.path.fixture));

app.get(/^.*$/, function (req, res) {
  res.sendFile(config.path.app + '/index.html');
});

app.listen(PORT, function () {
  console.log('API Server running on port ' + PORT);
});
