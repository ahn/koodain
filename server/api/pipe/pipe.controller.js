'use strict';

var request = require('request');


// TODO: Security issue: it's not a good idea to reroute anything without any checks...
export function all(req, res) {
  console.log("reqUrl " + req.url);
  var url = "http://localhost:" +  req.url;
  console.log(url);
  return req.pipe(request(url)).pipe(res);
}
