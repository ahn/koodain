/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */
/* globals ace */
'use strict';

angular.module('koodainApp')

  /**
   * Controller for the view for editing project sources.
   */
  .controller('ProjectCtrl', function ($scope, $stateParams, $resource, Notification, Upload, project, files, resources) {

    // project, files, and resources are resolved in project.js

    // The project to be edited
    $scope.project = project;

    // The source files of the project
    $scope.files = files;

    // The resource files of the project
    $scope.resources = resources;

    // Ace editor modes
    var modelist = ace.require('ace/ext/modelist');

    var projectUrl = '/api/projects/' + $stateParams.project;

    // Open file for editing
    $scope.openFile = function(file) {
      $scope.activeFile = file;
      var mode = modelist.getModeForPath(file.name);
      $scope.activeFile.mode = mode ? mode.name : null;
    };

    // If there is main.js file, open it automatically at start
    var mainJss = files.files.filter(function(f) { return f.name === 'main.js'; });
    if (mainJss.length > 0) {
      $scope.openFile(mainJss[0]);
    }

    // Get the editor instance on ace load
    var editor;
    $scope.aceLoaded = function(_editor) {
      editor = _editor;
      editor.$blockScrolling = Infinity;
      editor.setOptions({fontSize: '11pt'});
    };

    // Files that are currently updated, to show a spinner on the view
    $scope.updating = {};

    var File = $resource(projectUrl+'/files/:name', null, {
      update: {method: 'PUT' }
    });

    // Watch modifications to the edited file,
    // and save the file to the backend on every modification.
    // The "eagerness" of the saving can be controlled with the 'debounce'
    // attribute in the view.
    $scope.$watch('activeFile.content', function() {
      var f = $scope.activeFile;
      if (f) {
        var u = File.update({name: f.name}, f);
        $scope.updating[f.name] = u.$promise.$$state;
      }
    });

    // Upload a source file or resource file to the given backend url
    function upload(file, toUrl) {
      return Upload.upload({
        url: toUrl,
        data: {file: file},
      }).then(function() {
        Notification.success('Uploaded ' + file.name);
      });
    }

    // Upload a source file
    $scope.uploadFile = function(file) {
      var toUrl = projectUrl + '/files';
      upload(file, toUrl).then(function() {
        $scope.files = $resource(toUrl).get();
      });
    };

    // Upload a resource file
    $scope.uploadResource = function(file) {
      var toUrl = projectUrl + '/files/resources';
      upload(file, toUrl).then(function() {
        $scope.resources = $resource(toUrl).get();
      });
    };
  });
