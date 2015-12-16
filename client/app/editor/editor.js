'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('editor', {
        url: '/editor',
        templateUrl: 'app/editor/editor.html',
        controller: 'EditorCtrl'
      });
  });
