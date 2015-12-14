/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

'use strict';

angular.module('koodainApp')
  .controller('DeployCtrl', function ($scope, $location, $http, $resource) {
    var projects = $resource('/api/projects').query();

    // If project in query params, select it when projects loaded.
    var proj = $location.search().project;
    if (proj) {
      projects.$promise.then(function() {
        for (var i=0; i<projects.length; i++) {
          if (proj === projects[i].name) {
            $scope.activeProject = projects[i];
            break;
          }
        }
      });
    }

    $scope.projects = projects;

    function randomPlaceholderCaps() {
      var foo = ['audio', 'temperature', 'camera'];
      var caps = [];
      for(var i=0; i<foo.length; i++) {
        if (Math.random() < 0.5) {
          caps.push(foo[i]);
        }
      }
      return caps;
    }

    function appendTransform(defaults, transform) {
      defaults = angular.isArray(defaults) ? defaults : [defaults];
      return defaults.concat(transform);
    }


    // Reloads the apps from device and updates its .apps attribute.
    function updateAppsOf(device) {
      delete device.error;
      $http({
        url: device.url + '/app', 
        transformResponse: appendTransform($http.defaults.transformResponse,
          function(apps) {
            if (!apps) { return apps; }
            // Add the .device for each app
            for (var a=0; a<apps.length; a++) {
              apps[a].device = device;
              var instances = apps[a].instances;
              // ... and the .app for each instance
              for (var i=0; i<instances.length; i++) {
                instances[i].app = apps[a];
              }
            }
            return apps;
          })
      }).then(function(res) {
        device.apps = res.data;
      },
      function() {
        device.apps = [];
        device.error = 'Could not load apps';
      });
    }

    // Reloads the instances of app and updates its .instances attribute.
    function updateInstancesOf(app) {
      delete app.error;
      var url = app.device.url + '/app/'+app.id+'/instance';
      return $http({
        url: url,
        transformResponse: appendTransform($http.defaults.transformResponse,
          function(instances) {
            if (!instances) { return instances; }
            // Add the .app for each instance
            for (var i=0; i<instances.length; i++) {
              instances[i].app = app;
            }
            return instances;
          })
      }).then(function(res) {
        app.instances = res.data;
      },function() {
        app.instances = [];
        app.error = 'Could not load instances';
      });
    }

    var devices = [1,2,3,4,5,6,7,8,9].map(function(k) {
      return {
        name: 'Device '+k,
        url: 'http://'+k+'.example.com',
        capabilities: randomPlaceholderCaps(),
      };
    });

    var rpi = {
      name: 'Farshad\'s Raspberry',
      url: 'http://130.230.144.111:8000',
      capabilities: ['audio', 'temperature'],
    };
    updateAppsOf(rpi);
    devices.push(rpi);
    $scope.devices = devices;

    $scope.projectClicked = function(project) {
      $scope.activeProject = project;
      delete $scope.activeDevice;
      deactivateApp();
    };

    $scope.deviceClicked = function(device) {
      if (!device.compatible) {
        return;
      }
      $scope.activeDevice = device;
      deactivateApp();
    };

    function deactivateApp() {
      var app = $scope.activeApp;
      if (!app) {
        return;
      }
      if (app._interval) {
        clearInterval(app._interval);
      }
      delete $scope.activeApp;
    }

    $scope.appClicked = function(app) {
      $scope.activeApp = app;
      app._interval = setInterval(function() { updateInstancesOf(app); }, 2500);
    };

    $scope.newApp = function() {
      var device = $scope.activeDevice;
      var project = $scope.activeProject;
      $http({
        method: 'POST',
        url: '/api/projects/' +project.name + '/package',
        data: {deviceUrl: device.url},
      }).then(function() {
        delete device.error;
        updateAppsOf(device);
      }, function() {
        device.error = 'Could not push app';
      });
    };

    $scope.newInstance = function() {
      var device = $scope.activeDevice;
      var app = $scope.activeApp;
      var url = device.url + '/app/' + app.id + '/instance';
      $http({
        method: 'POST',
        url: url,
        data: {deviceUrl: device.url},
      }).then(function() {
        updateInstancesOf(app);
      });
    };

    $scope.setInstanceStatus = function(instance, status) {
      var url = instance.app.device.url + '/app/' + instance.app.id + '/instance/' + instance.id;
      return $http({
        url: url,
        method: 'PUT',
        data: {status: status},
      });
    };

    $scope.removeInstance = function(instance) {
      var url = instance.app.device.url + '/app/' + instance.app.id + '/instance/' + instance.id;
      return $http({
        url: url,
        method: 'DELETE',
      });
    };

    function sameApp(a1, a2) {
      return a1.id === a2.id && a1.device.id === a2.device.id;
    }

    $scope.removeApp = function(app) {
      var url = app.device.url + '/app/' + app.id;
      return $http({
        url: url,
        method: 'DELETE',
      }).then(function() {
        if (sameApp(app, $scope.activeApp)) {
          deactivateApp();
          updateAppsOf($scope.activeDevice);
        }
      });
    };
  })

  .filter('compatibleDevices', function() {
    function hasAll(device, caps) {
      for (var c=0; c<caps.length; c++) {
        if (device.capabilities.indexOf(caps[c]) === -1) {
          return false;
        }
      }
      return true;
    }

    return function(devices, project) {
      for (var d=0; d<devices.length; d++) {
        devices[d].compatible = project && hasAll(devices[d], project.capabilities);
      }
      return devices;
    };
  });
