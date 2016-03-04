/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

/* global devicelib */
'use strict';

angular.module('koodainApp')
  .controller('DeployCtrl', function ($scope, $http, $resource, $uibModal, Notification, VisDataSet, queryDevices, deviceManagerUrl) {

  var Project = $resource('/api/projects');
  $scope.projects = Project.query();

  $scope.deviceManagerUrl = deviceManagerUrl;
    
  var deviceManager = queryDevices(deviceManagerUrl);

  // Groups for Vis.js network
  var visGroups = {
    device: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf233',
        size: 50,
        color: 'gray',
      }
    },
    'device:selected': {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf233',
        size: 50,
        color: 'purple',
      }
    }
  };

  /// Returns a Vis.js group based on app name
  /// If the group doesn't exist, it's created in the visGroups object.
  function createGroup(name) {
    var codes = {
      playSound: '\uf028',
      measureTemperature: '\uf0e4',
    };

    if (!(name in codes)) {
      name = 'default';
    }

    if (name in visGroups) {
      return name;
    }

    var code = codes[name];
    if (!code) {
      code = '\uf059';
    }
    
    visGroups[name] = {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: code,
        size: 50,
        color: 'black',
      }
    };
    visGroups[name+':selected'] = {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: code,
        size: 50,
        color: 'purple',
      }
    };
    return name;
  }

  function groupForApp(app) {
    return createGroup(app.name);
  }

  function groupForDevice() {
    return 'device';
  }

  /// Returns a Vis.js node
  function nodeFromDevice(device) {
    var id = device.id;
    var n = {
      id: id,
      label: device.name || id,
      group: groupForDevice(),
    };
    return n;
  }

  /// Returns a Vis.js node
  function nodeFromApp(app) {
    var n = {
      id: 'app:' + app.id,
      label: app.name,
      group: groupForApp(app),
      selectable: false,
    };
    return n;

  }

  function deviceListAsObject(devs) {
    var obj = {};
    for (var i=0; i<devs.length; i++) {
      var d = devs[i];
      obj[d.id] = d;
    }
    return obj;
  }

  var allDevices = [], nodes, edges;
  function loadDevices() {
    deviceManager.queryDevices().then(function(devices) {
      allDevices = deviceListAsObject(devices);
      deviceManager.addMockDevicesTo(allDevices);

      nodes = new VisDataSet();
      edges = new VisDataSet();
      updateNodesAndEdges();

      $scope.graphData = {
        nodes: nodes,
        edges: edges,
      };

      $scope.$apply();
    });
  }

  // Initial loading of the devices
  loadDevices();

  var selectedNodeIds = [];
  function select(ns) {
    nodes.update(selectedNodeIds.map(function(id) {
      return {
        id: id,
        group: groupForDevice(allDevices[id])
      };
    }));
    nodes.update(ns.map(function(id) {
      return {
        id: id,
        group: groupForDevice(allDevices[id]) + ':selected'
      };
    }));
    selectedNodeIds = ns;
    $scope.selectedDevices = selectedNodeIds.map(function(id) {
      return allDevices[id];
    });
  }

  // The Vis.js network object, assigned at Vis.js onload.
  var network;

  function updateSelection() {
    var sel = deviceManager.filter(allDevices, $scope.devicequery, $scope.appquery);
    network.selectNodes(sel);
    select(sel);
  }

  var events = {
    onload: function(_network) {
      network = _network;
      $scope.$watch('devicequery', updateSelection);
      $scope.$watch('appquery', updateSelection);
    },
    selectNode: selectClick,
    deselectNode: selectClick,
  };

  // TODO: refactor loadDevices + reloadDevices -- DRY
  function reloadDevices() {
    deviceManager.queryDevices().then(function(devices) {

      allDevices = deviceListAsObject(devices);
      deviceManager.addMockDevicesTo(allDevices);

      updateNodesAndEdges();

      updateSelection();
      $scope.$apply();
    });
  }
  
  function updateNodesAndEdges() {
    nodes.clear();
    edges.clear();

    Object.keys(allDevices).forEach(function(id) {
      nodes.add(nodeFromDevice(allDevices[id]));
    });

    for (var i in allDevices) {
      var d = allDevices[i];
      var apps = d.apps;
      if (apps) {
        nodes.add(apps.map(nodeFromApp));
        /* jshint -W083 */
        edges.add(apps.map(function(app) {
          return {
            from: 'app:' + app.id,
            to: d.id,
          };
        }));
      }
    }
  }

  $scope.loadDevices = reloadDevices;


  var options = {
    groups: visGroups,
    interaction: {
      multiselect: true,
    }
  };


  function isAppNodeId(nodeId) {
    return nodeId.slice(0,4) === 'app:';
  }

  function isDeviceNodeId(nodeId) {
    // There are only devices and apps (for now)
    return !isAppNodeId(nodeId);
  }

  function selectClick(params) {
    var selDevices = params.nodes.filter(isDeviceNodeId);
    $scope.devicequery = selDevices.map(function(id) { return '#'+id; }).join(',');
    //$scope.appquery = selApps.map(function(id) { return '#'+id; }).join(',');
    $scope.$apply();
  }


  $scope.graphEvents = events;
  $scope.graphOptions = options;

  $scope.deployments = [];
  $scope.openManageAppsModal = function() {
    $uibModal.open({
      controller: 'ManageAppsCtrl',
      templateUrl: 'manageapps.html',
      resolve: {
        data: function() { return {
          devices: $scope.selectedDevices,
          devicequery: $scope.devicequery,
          appquery: $scope.appquery}; },
      }
    }).result.then(function(deployment) {
      $scope.deployments.push(deployment);
      // ...
    });
  };

  $scope.verifyDeployment = function() {
    $uibModal.open({
      controller: 'VerifyDeploymentCtrl',
      templateUrl: 'verifydeployment.html',
      resolve: {
        deployments: function() { return $scope.deployments; },
      }
    }).result.then(function() {
      $scope.deployments = [];
    });
  };

  $scope.discardDeployment = function() {
    $scope.deployments = [];
  };

  $scope.openLogModal = function(device, app) {
    $uibModal.open({
      controller: 'AppLogCtrl',
      templateUrl: 'applog.html',
      resolve: {
        device: device,
        app: app,
      }
    }).result.then(null, function() {
      clearInterval(app._logInterval);
    });
  };

  function devicePipeUrl(url) {
    return '/api/pipe/'  + url;
  }

  $scope.setAppStatus = function(device, app, status) {
    var url = device.url + '/app/' + app.id;
    return $http({
      url: devicePipeUrl(url),
      method: 'PUT',
      data: {status: status},
    }).then(function(response) {
      // TODO: this is a bit of quickndirty way to update app...
      app.status = response.data.status;
    });
  };

  $scope.removeApp = function(device, app) {
    var url = device.url + '/app/' + app.id;
    return $http({
      url: devicePipeUrl(url),
      method: 'DELETE',
    }).then(function() {
      var apps = device.apps;
      for (var i=0; i<apps.length; i++) {
        if(apps[i].id === app.id) {
          apps.splice(i, 1);
          return;
        }
      }
    });
  };

  $scope.selectDevicesForProject = function(project) {
    $http({
      method: 'GET',
      url: '/api/projects/' + project.name + '/files/liquidiot.json'
    }).then(function(res) {
      var json = JSON.parse(res.data.content);
      var dcs = json['device-classes'];
      if (!dcs || !dcs.length) {
        $scope.devicequery = '*';
      }
      else {
        $scope.devicequery = '.' + dcs.join('.');
      }
    });

  };


}).controller('ManageAppsCtrl', function($scope, $resource, $uibModalInstance, data) {

  $scope.devices = data.devices;
  $scope.devicequery = data.devicequery;
  $scope.appquery = data.appquery;
  var Project = $resource('/api/projects');
  $scope.projects = Project.query();

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
  $scope.done = function() {
    var deployment = {
      devicequery: data.devicequery,
      appquery: data.appquery,
      project: $scope.selectedProject,
      numApproxDevices: data.devices.length,
      n: $scope.allDevices || !$scope.numDevices ? 'all' : $scope.numDevices,
      removeOld: $scope.removeOld,
    };
    $uibModalInstance.close(deployment);
  };
}).controller('VerifyDeploymentCtrl', function($scope, $http, $resource, $uibModalInstance, Notification, deployments) {

  $scope.deployments = deployments;

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
  $scope.done = function() {
    $uibModalInstance.close();
  };

  function deployDevicePromise(device, projectName) {
    var url = device.url;
    Notification.info('Deploying ' + projectName + ' to ' + url);
    return $http({
      method: 'POST',
      url: '/api/projects/' +projectName + '/package',
      data: {deviceUrl: url},
    }).then(function() {
      // ...
    });
  }

  function deployPromise(deployment) {
    var dm = devicelib(deviceManagerUrl);
    return dm.devices(deployment.devicequery, deployment.appquery).then(function(devices) {
      deployment.devices = devices;
      return Promise.all(devices.map(function(d) {
        return deployDevicePromise(d, deployment.project);
      }));
    });
  }

  $scope.deploy = function() {
    var deps = $scope.deployments;
    if (!deps.length) {
      return;
    }

    $scope.deploying = true;

    Promise.all(deps.map(deployPromise)).then(function() {
      delete $scope.deploying;
      Notification.success('Deployment successful!');
      $uibModalInstance.close();
    },
    function(err) {
      console.log(err);
      delete $scope.deploying;
      Notification.error('Deployment failed!');
    });
  };

})
  .controller('AppLogCtrl', function($scope, $http, $uibModalInstance, device, app) {

    // TODO: refactor, this is needed in 2(?) controllers...
    function devicePipeUrl(url) {
      return '/api/pipe/'  + url;
    }


    $scope.device = device;
    $scope.app = app;
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
    app._logInterval = setInterval(function() {
      var url = device.url + '/app/' + app.id + '/log';
      $http({
        method: 'GET',
        url: devicePipeUrl(url),
      }).then(function(response) {
        $scope.log = response.data;
      });
    }, 2000);
  });

