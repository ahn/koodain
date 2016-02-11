'use strict';

var express = require('express');


var request = require('request');


var router = express.Router();

//var controller = require('./pipe.controller');
var controller = 2;

router.all('*', function(req, res) {
  console.log("reqUrl " + req.query, req.body);
  //var url = "http://localhost:9000" +  req.url;
  var url = decodeURIComponent(req.params.url);
  console.log(url);
  return req.pipe(request(url)).pipe(res);

});

module.exports = router;
