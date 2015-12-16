'use strict';

angular.module('koodainApp')
  .controller('IdeCtrl', function ($scope) {
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
