'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('koodainApp')
	.directive('timeline',function() {
    return {
        templateUrl:'app/directives/timeline/timeline.html',
        restrict: 'E',
        replace: true,
    }
  });
