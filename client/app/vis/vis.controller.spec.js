'use strict';

describe('Controller: VisCtrl', function () {

  // load the controller's module
  beforeEach(module('koodainApp'));

  var VisCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VisCtrl = $controller('VisCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
