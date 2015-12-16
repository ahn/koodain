'use strict';

angular.module('koodainApp')
  .controller('IdeCtrl', function ($scope) {

    $scope.menu = [];

    $scope.sidebar = {
      items: [
        {
          title: 'Moi',
          icon: 'dashboard',
          sref: 'ide.keke',

        },
        {
          title: 'Moi',
          icon: 'dashboard',
          sref: 'ide.keke',

        },
      ],
    };
  });
