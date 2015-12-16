'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('ide.project', {
        url: '/edit/:project',
        templateUrl: 'app/project/project.html',
        controller: 'ProjectCtrl',
        resolve: {
          project: /* ngInject */ function($stateParams, $resource) {
            console.log("STATATA", $stateParams);
            return $resource('/api/projects/'+$stateParams.project).get().$promise;
          },
          files: /* ngInject */ function($stateParams, $resource) {
            return $resource('/api/projects/'+$stateParams.project+'/files').get().$promise;
          },
          resources: /* ngInject */ function($stateParams, $resource) {
            return $resource('/api/projects/'+$stateParams.project+'/files/resources').get().$promise;
          },
        }
      });
  });
