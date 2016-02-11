'use strict';

var request = require('request');


// Gets a list of Pipes
export function all(req, res) {
  console.log("reqUrl " + req.url);
  var url = "http://localhost:" +  req.url;
  console.log(url);
  return req.pipe(request(url)).pipe(res);
}
