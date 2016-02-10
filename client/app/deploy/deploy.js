'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('deploy', {
        url: '/deploy',
        templateUrl: 'app/deploy/deploy.html',
        controller: 'DeployCtrl'
      });
  });
