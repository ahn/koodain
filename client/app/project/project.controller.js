/* globals ace */
'use strict';

angular.module('koodainApp')
  .controller('ProjectCtrl', function ($scope, $stateParams, $resource, Notification, Upload, project, files, resources) {

    $scope.project = project;
    $scope.files = files;
    $scope.resources = resources;

    var modelist = ace.require('ace/ext/modelist');

    var url = '/api/projects/' + $stateParams.project;

    var editor;
    $scope.fileClicked= function(file) {
      $scope.activeFile = file;
      var mode = modelist.getModeForPath(file.name);
      $scope.activeFile.mode = mode ? mode.name : null;
    };

    $scope.aceLoaded = function(_editor) {
      editor = _editor;
      editor.$blockScrolling = Infinity;
      editor.setOptions({fontSize: '11pt'});
    };

    $scope.updating = {};

    var File = $resource(url+'/files/:name', null, {
      update: {method: 'PUT' }
    });

    $scope.$watch('activeFile.content', function() {
      var f = $scope.activeFile;
      if (f) {
        var u = File.update({name: f.name}, f);
        $scope.updating[f.name] = u.$promise.$$state;
      }
    });

    function upload(file, toUrl) {
      return Upload.upload({
        url: toUrl,
        data: {file: file},
      }).then(function() {
        console.log(file);
        Notification.success('Uploaded ' + file.name);
      });
    }

    $scope.uploadFile = function(file) {
      var toUrl = url + '/files';
      upload(file, toUrl).then(function() {
        $scope.files = $resource(toUrl).get();
      });
    };

    $scope.uploadResource = function(file) {
      var toUrl = url + '/files/resources';
      upload(file, toUrl).then(function() {
        $scope.resources = $resource(toUrl).get();
      });
    };
  });
