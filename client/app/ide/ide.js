'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('ide', {
        url: '/ide',
        templateUrl: 'app/ide/main.html',
        controller: 'IdeCtrl'
      });
  });
