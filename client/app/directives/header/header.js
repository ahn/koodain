'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('koodainApp')
	.directive('header',function(){
		return {
            templateUrl:'app/directives/header/header.html',
            restrict: 'E',
            replace: true,
            scope: {
              sidebar: '='
            }
    	};
	});


