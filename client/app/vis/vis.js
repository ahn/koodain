'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('vis', {
        url: '/vis',
        templateUrl: 'app/vis/vis.html',
        controller: 'VisCtrl'
      });
  });
