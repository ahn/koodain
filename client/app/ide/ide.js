'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('ide', {
        url: '/ide',
        templateUrl: 'app/ide/ide.html',
        controller: 'IdeCtrl',
      });
  });
