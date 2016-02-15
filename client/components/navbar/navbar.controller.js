'use strict';

angular.module('koodainApp')
  .controller('NavbarCtrl', function ($scope, $location, $state, Auth) {
    $scope.$state = $state;

    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    },
    {
      'title': 'Edit',
      'link': '/project'
    },
    {
      'title': 'Deploy',
      'link': '/deploy'
    },
    {
      'title': 'APIs',
      'link': '/api-descr'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return ($location.path()+'/').startsWith(route+'/');
    };
  });
