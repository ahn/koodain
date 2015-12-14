/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

'use strict';

var path = require('path');
var readFiles = require('read-files-promise');
var _ = require('lodash');
var ejs = require('ejs');
var Project = require('./project.model');
var ProjectFile = require('./projectfile.model');
var errorHandler = require('../common').errorHandler;

// Get list of projects
exports.index = function(req, res) {
  Project.find().then(function(projects) {
    return res.status(200).json(projects);
  }).then(null, errorHandler(res));
};

// Get a single project
exports.show = function(req, res) {
  Project.findOne({name: req.params.project}).then(function(project) {
    if(!project) throw 404;
    return res.json(project);
  }).then(null, errorHandler(res));
};

// Create a new project.
// The project is initialized with template files.
exports.create = function(req, res) {
  var data = req.body;
  if (!data.name || !data.name.match(/^[a-z][a-z0-9]*$/)) {
    return res.status(400).json({error: 'project name must match [a-z][a-z0-9]*'});
  }
  data.capabilities = ['audio', 'temperature']; // TODO - this is a placeholder
  createProject(data).then(function(project) {
    return res.status(201).json(project);
  }).then(null, errorHandler(res));
};

function createProject(data) {
  var project;
  return Project.create(data).then(function(_project) {
    project = _project;
    return initProjectFiles(project);
  }).then(function() {
    return project;
  });
}
exports.createProject = createProject;

function initProjectFiles(project) {
  var files = [
    './examplepackage/agent.js',
    './examplepackage/hello.js',
    './examplepackage/package.json',
  ];
  var vars = {
    project: project,
  };
  return addProjectFiles(files, project, vars);
}

function addProjectFiles(filenames, project, vars) {
  return readFiles(filenames).then(function(files) {
    var objs = files.map(function(f, i) {
      return {
        _project: project._id,
        name: path.basename(filenames[i]),
        // The content is rendered with ejs.
        // That is filling the <%= %> etc. blanks in the files.
        content: ejs.render(f.toString(), vars),
      };
    });
    return ProjectFile.collection.insert(objs);
  });
}

