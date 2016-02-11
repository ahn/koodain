'use strict';

var express = require('express');


var request = require('request');


var router = express.Router();

//var controller = require('./pipe.controller');
var controller = 2;

router.all('*', function(req, res) {
  var url = req.originalUrl.slice('/api/pipe/'.length);
  console.log('bbb', req.body);
  // Is there an easy way to reroute the exact request with body etc. (but without cookies etc.)?
  // This is close enough for now:
  var req2 = request({
    method: req.method,
    url: url,
    body: req.body,
    json: true,
  });
  return req.pipe(req2).pipe(res);

});

module.exports = router;
