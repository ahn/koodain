/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

'use strict';

var _ = require('lodash');
var Project = require('./project.model');
var ProjectFile = require('./projectfile.model');
var errorHandler = require('../common').errorHandler;

// Get list of files
exports.index = function(req, res) {
  Project.findOne({name: req.params.project}).then(function(project) {
    if (!project) throw 404;
    return ProjectFile.find({_project: project.id}).then(function(files) {
      res.json(files);
    });
  }).then(null, errorHandler(res));
};

// Get a single file
exports.show = function(req, res) {
  Project.findOne({name: req.params.project}).then(function(project) {
    if (!project) throw 404;
    return ProjectFile.findOne({_project: project.id, name: req.params.file}).then(function(file) {
      if (!file) throw 404;
      res.json(file);
    });
  }).then(null, errorHandler(res));
};

// Create a new file
exports.create = function(req, res) {
  var f = {
    name: req.body.name,
    content: req.body.content || '',
  };
  if (!f.name) {
    return res.status(400).json({error: 'No name given'});
  }
  Project.findOne({name: req.params.project}).then(function(project) {
    if (!project) throw 404;
    f._project = project._id;
    return ProjectFile.create(f);
  }).then(function(file) {
    return res.status(201).json(file);
  }).then(null, errorHandler(res));
};

// Updates an existing file
exports.update = function(req, res) {
  var data = req.body;
  delete data._id;
  Project.findOne({name: req.params.project}).then(function(project) {
    if (!project) throw 404;
    data._project = project._id;
    return ProjectFile.findOne({_project: project.id, name: req.params.file});
  }).then(function(file) {
    if (!file) throw 404;
    var updated = _.merge(file, data);
    return updated.save();
  }).then(function(file) {
    res.json(file);
  }).then(null, errorHandler(res));
};

// Deletes a file
exports.destroy = function(req, res) {
  Project.findOne({name: req.params.project}).then(function(project) {
    if (!project) throw 404;
    return ProjectFile.findOne({_project: project.id, name: req.params.file});
  }).then(function(file) {
    return file.remove();
  }).then(function(file) {
    res.json(file);
  }).then(null, errorHandler(res));
};

