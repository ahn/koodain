'use strict';

var express = require('express');

var request = require('request');

var router = express.Router();

/**
 * Pipe the HTTP request to the URL given.
 *
 * Eg. '/api/pipe/http://example.com
 * will be piped to http://example.com
 */
// TODO: Security issue: it's not a good idea to reroute anything without any checks...
router.all('*', function(req, res) {
  var url = req.originalUrl.slice('/api/pipe/'.length);
  // Is there an easy way to reroute the exact request with body etc. (but without cookies etc.)?
  // This is close enough for now:
  var req2 = request({
    method: req.method,
    url: url,
    body: req.body,
    json: true,
  });
  req2.pipe(res);
});

module.exports = router;
