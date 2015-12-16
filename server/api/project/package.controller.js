/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

'use strict';

var fsp = require('fs-extra-promise');
var npm = require('npm');
var path = require('path');
var tmp = require('tmp');
var rp = require('request-promise');
var _ = require('lodash');
var Project = require('./project.model');
var errorHandler = require('../common').errorHandler;

var env = require('../../config/environment');
var GITDIR = env.git.projects;


function tmpDirPromise() {
  return new Promise(function(resolve, reject) {
    tmp.dir(function(err, path) {
      if (err) {
        reject(err);
      }
      else {
        resolve(path);
      }
    });
  });
}

// https://github.com/npm/npm/issues/4074
function npmPackPromise(dir) {
  return new Promise(function(resolve, reject) {
    npm.load({}, function(err) {
      if (err) {
        return reject(err);
      }
      npm.commands.cache.add(dir, null, false, null, function(err, data) {
        if (err) {
          return reject(err);
        }
        var cached, from, to;
        cached = path.resolve(npm.cache, data.name, data.version, "package.tgz");
        resolve(cached);
        /*
        from = fs.createReadStream(cached);

        var pkg = path.join(dir, data.name + '-' + data.version + '.tgz');
        to = fs.createWriteStream(pkg);

        from.on("error", reject);
        to.on("error", reject);
        to.on("close", function() {
          resolve(pkg);
        });

        from.pipe(to);
        */
      });
    });
  });
}

// npm pack, used here, always creates the tgz at the working dir.
// Using the above function instead.
function npmPackPromise2(fromDir) {
  return new Promise(function(resolve, reject) {
    npm.load({}, function(err) {
      if (err) {
        return reject(err);
      }
      npm.commands.pack([fromDir], function() {
        resolve();
      });
    });
  });
}

function createPackage(project) {
  var d = path.resolve(GITDIR, project.name);
  return npmPackPromise(d);
}

function sendPackage(pkgBuffer, url) {
  var formData = {
    'filekey': {
      value: pkgBuffer,
      options: {
        filename: 'package.tgz',
        knownLength: pkgBuffer.length,
      }
    }
  };
  return rp.post({url: url, formData: formData});
}

// Create package, i.e. deploy to device.
exports.create = function(req, res) {
  var url = req.body.deviceUrl + '/app';
  Project.findOne({name: req.params.project}).then(function(project) {
    if (!project) throw 404;
    return createPackage(project);
  }).then(function(pkgFilename) {
    return fsp.readFileAsync(pkgFilename);
  }).then(function(pkgBuffer) {
    return sendPackage(pkgBuffer, url);
  }).then(function(pkgBuffer) {
    res.status(201).json();
  }).then(null, errorHandler(res));
};

