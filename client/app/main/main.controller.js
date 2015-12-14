/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

'use strict';

angular.module('koodainApp')
  .controller('MainCtrl', function ($scope, $http, $resource, $uibModal, Notification) {

    var Project = $resource('/api/projects');
    $scope.projects = Project.query();

    $scope.openNewProjectModal = function() {
      $uibModal.open({
        controller: 'NewProjectCtrl',
        templateUrl: 'newproject.html'
      }).result.then(function(name) {
        console.log(name);
        var r = new Project({name: name});
        r.$save().then(function() {
          $scope.projects = Project.query();
        },function(res) {
          Notification.error(res.data.error);
        });
      });
    };

  })

  .controller('NewProjectCtrl', function ($scope, $uibModalInstance) {
    $scope.ok = function() {
      console.log($scope.newproject.name);
      $uibModalInstance.close($scope.newproject.name);
    };
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });

