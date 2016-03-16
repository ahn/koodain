/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

'use strict';

/**
 * API for managing project files.
 *
 * The files are stored on the disk in the directory defined
 * in the server/config/environment/XXX.js file.
 */

var _ = require('lodash');
var path = require('path');
var fsp = require('fs-extra-promise');
var ejs = require('ejs');
var series = require('middleware-flow').series;
var multer = require('multer');
var Project = require('./project.model');
var errorHandler = require('../common').errorHandler;

var env = require('../../config/environment');

var GITDIR = env.git.projects;


var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    var dir = req.params.dir || '.';
    var d = path.resolve(GITDIR, req.params.project, dir);
    cb(null, d);
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({storage: storage});


function readDirContents(d) {
  return fsp.readdirAsync(d).then(function(files) {
    var noDot = _.filter(files, function(f) { return !f.startsWith('.'); })
    var ps = _.map(noDot, function(f) {
      return readFileOrDir(path.resolve(d,f));
    });
    return Promise.all(ps);
  },
  function (err) {
    throw 404;
  });
}

function readFileOrDir(filename) {
  return fsp.statAsync(filename).then(function(stat) {
    if (stat.isDirectory()) {
      return readDir(filename);
    }
    else if (stat.size > 50*1024) { // TODO: better control when to load (big) file contents
      // File too big.
      return {
        name: path.basename(filename),
        isDirectory: false,
        content: '',
        isTooBig: true,
      }
    }
    else {
      return readFile(filename);
    }
  });
}

function readDir(filename) {
  return readDirContents(filename).then(function(files) {
    return {
      name: path.basename(filename),
      isDirectory: true,
      files: files,
    };
  });

}

function readFile(filename) {
  return fsp.readFileAsync(filename).then(function(data) {
    return {
      name: path.basename(filename),
      content: data.toString(),
      isDirectory: false,
    };
  });
}


// Get a single file
exports.show = function(req, res) {
  var filename = req.params.file || '.';
  var p = path.resolve(GITDIR, req.params.project, filename);
  readFileOrDir(p).then(function(file) {
    res.json(file);
  },
  function(err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR' || err.code === 'EISDIR') {
      res.status(404).json({error: "No such file"});
    }
    else {
      console.log(err);
      res.status(500).json({error: "File error"});
    }
  }).then(null, errorHandler(res));
};

function createFile(filename, content) {
  content = content || '';
  return fsp.writeFileAsync(filename, content, {flag: 'wx'}).then(null, function(err) {
    if (err.code === 'EEXIST') {
      throw 409;
    }
    throw err;
  });
}

function writeFile(filename, content) {
  content = content || '';
  return fsp.writeFileAsync(filename, content, {flag: 'w'});
}

exports.create = series(upload.single('file'), function(req, res) {
  if (req.file) {
    // File already saved by multer, nothing more to do.
    return res.status(201).send();
  }
  if (!req.body.name) {
    return res.status(400).json({error: 'No name given'});
  }
  var dir = req.params.dir || '.';
  var p = path.resolve(GITDIR, req.params.project, req.params.dir, req.body.name);
  createFile(p, req.body.content).then(function() {
    res.status(201).send();
  }).then(null, errorHandler(res));
});

exports.update = function(req, res) {
  var p = path.resolve(GITDIR, req.params.project, req.params.file);
  writeFile(p, req.body.content).then(function() {
    res.send();
  }).then(null, errorHandler(res));
};

exports.destroy = function(req, res) {
  var p = path.resolve(GITDIR, req.params.project, req.params.file);
  fsp.unlinkAsync(p).then(function() {
    res.send();
  },
  function(err) {
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
      throw 404;
    }
    throw err;
  }).then(null, errorHandler(res));
};

/**
 * Copies files to the given project.
 *
 * The file contents are filtered with the EJS engine.
 * http://www.embeddedjs.com/
 * You can give vars object to define the variables used by EJS.
 *
 * Params:
 * - filenames: the files to be copied
 * - project: the project
 * - var: EJS vars
 *
 */
function addProjectFiles(filenames, project, vars) {

  var projectDir = path.resolve(GITDIR, project.name);

  var ps = filenames.map(function(f) {
    return fsp.readFileAsync(f).then(function(data) {
      return {
        name: f,
        data: data,
      };
    }).then(function (f) {
      var to = path.resolve(projectDir, path.basename(f.name));
      var content = ejs.render(f.data.toString(), vars);
      return writeFile(to, content);
    });
  });

  var d = path.resolve(projectDir, 'resources');
  return fsp.mkdirsAsync(d).then(function() {
    return Promise.all(ps);
  });
}

exports.addProjectFiles = addProjectFiles;

