/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

'use strict';

var fs = require('fs');
var readFile = require('fs-readfile-promise');
var npm = require('npm');
var path = require('path');
var tmp = require('tmp');
var fsp = require('fs-promise');
var rp = require('request-promise');
var _ = require('lodash');
var Project = require('./project.model');
var ProjectFile = require('./projectfile.model');
var Package = require('./package.model');
var errorHandler = require('../common').errorHandler;



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

// npm pack always creates the tgz at the working dir.
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
  var files, dir;
  return ProjectFile.find({_project: project._id}).then(function(_files) {
    files = _files;
    return tmpDirPromise();
  }).then(function(_dir) {
    dir = _dir;
    return writeFiles(dir, files, 0);
  }).then(function() {
    return npmPackPromise(dir);
  });
}

function writeFiles(dir, files, startFrom) {
  if (startFrom < files.length) {
    var f = files[startFrom];
    var fn = path.join(dir, f.name);
    return fsp.writeFile(fn, f.content).then(function() {
      return writeFiles(dir, files, startFrom+1);
    });
  }
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
  }).then(readFile).then(function(pkgBuffer) {
    return sendPackage(pkgBuffer, url);
  }).then(function(pkgBuffer) {
    res.status(201).json();
  }).then(null, errorHandler(res));
};

