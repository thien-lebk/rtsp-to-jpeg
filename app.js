// ./app.js

'use strict';

import http from 'http';
import _ from 'lodash';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import config from './config.json' assert { type: 'json' };
import routes from './routes.js';

function _reformatArray(array, suppressApostrophes){
  if (!array) { return null };
  var apostrophe = (suppressApostrophes) ? '' : '\'';
  if (array.length == 1 ) {return apostrophe+array+apostrophe};
  var i;
  var formatted = '';
  var num = array.length;
  for (i=0; i<num-1; i++){
    formatted = formatted + apostrophe+array[i]+apostrophe;
    if (i<num-2) {formatted = formatted + ', '};
  };
  formatted = formatted + ' and ' + apostrophe + array[num-1] + apostrophe;
  return formatted;
};



// Create our express application
var app = express();

app.use(compression()); // use compression, with defaults, for all requests
app.use(helmet());      // use helmet to secure the server - see https://github.com/helmetjs/helmet

// define routes
routes(app, config);
// create a http and https servers, with a WebSocket over TLS server also listening on :443
var httpServer = http.createServer(app).listen(3005, function(err){
  if (err){
  } else {
  }; // if
}); // var httpServer
