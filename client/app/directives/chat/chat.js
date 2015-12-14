'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('koodainApp')
	.directive('chat',function(){
		return {
        templateUrl:'app/directives/chat/chat.html',
        restrict: 'E',
        replace: true,
    	}
	});


