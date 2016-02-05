/* global devicelib */
'use strict';

angular.module('koodainApp')
  .controller('VisCtrl', function ($scope, $http, $resource, $uibModal, Notification, VisDataSet, queryDevices) {

  var Project = $resource('/api/projects');
  $scope.projects = Project.query();

  var groups = {
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

  function group(g) {
    var codes = {
      playSound: '\uf028',
      measureTemperature: '\uf0e4',
    };

    if (!(g in codes)) {
      g = 'default';
    }

    if (g in groups) {
      return g;
    }

    var code = codes[g];
    if (!code) {
      code = '\uf059';
    }
    
    groups[g] = {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: code,
        size: 50,
        color: 'black',
      }
    };
    groups[g+':selected'] = {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: code,
        size: 50,
        color: 'purple',
      }
    };
    return g;
  }

  function groupForApp(app) {
    return group(app.name);
  }

  function groupForDevice() {
    return 'device';
  }

  function randomEdges(nodes) {
    var ids = Object.keys(nodes);

    var edges = [];
    for (var i=0; i<50; i++) {
      edges.push({
        to: ids[Math.floor((Math.random() * ids.length))],
        from: ids[Math.floor((Math.random() * ids.length))],
        arrows: 'middle',
      });
    }
    
    return new VisDataSet(edges);
  }

  function nodeFromDevice(device) {
    var id = device.id;
    var n = {
      id: id,
      label: device.name || id,
      group: groupForDevice(),
    };
    return n;
  }

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

  var devs = [], nodes, edges;
  function loadDevices() {
    queryDevices.queryDevices().then(function(ddd) {
      devs = deviceListAsObject(ddd);
      queryDevices.addMockDevicesTo(devs);
      nodes = new VisDataSet(Object.keys(devs).map(function(id) {
        return nodeFromDevice(devs[id]);
      }));

      edges = new VisDataSet();

      for (var i in devs) {
        var d = devs[i];
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
      $scope.graphData = {
        nodes: nodes,
        edges: edges,
      };

      $scope.$apply();
    });
  }


  loadDevices();


  // TODO: refactor loadDevices + reloadDevices -- DRY
  function reloadDevices() {
    queryDevices.queryDevices().then(function(ddd) {
      devs.clear();

      devs = deviceListAsObject(ddd);
      queryDevices.addMockDevicesTo(devs);
      nodes = new VisDataSet(Object.keys(devs).map(function(id) {
        return nodeFromDevice(devs[id]);
      }));

      edges.clear();

      for (var i in devs) {
        var d = devs[i];
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

      $scope.$apply();
    });
  }

  $scope.loadDevices = reloadDevices;


  var options = {
    groups: groups,
    interaction: {
      multiselect: true,
    }
  };

  var selectedNodeIds = [];

  function select(ns) {
    nodes.update(selectedNodeIds.map(function(id) {
      return {
        id: id,
        group: groupForDevice(devs[id])
      };
    }));
    nodes.update(ns.map(function(id) {
      return {
        id: id,
        group: groupForDevice(devs[id]) + ':selected'
      };
    }));
    selectedNodeIds = ns;
    $scope.selectedDevices = selectedNodeIds.map(function(id) {
      return devs[id];
    });
  }

  function isAppNodeId(nodeId) {
    return nodeId.slice(0,4) === 'app:';
  }

  function isDeviceNodeId(nodeId) {
    // There are only devices and apps (for now)
    return !isAppNodeId(nodeId);
  }

  function selectClick(params) {
    var selDevices = params.nodes.filter(isDeviceNodeId);
    var selApps = params.nodes.filter(isAppNodeId);
    //console.log("apps", selApps);
    $scope.devicequery = selDevices.map(function(id) { return '#'+id; }).join(',');
    //$scope.appquery = selApps.map(function(id) { return '#'+id; }).join(',');
    $scope.$apply();
  }

  function updateSelection() {
    var sel = queryDevices.filter(devs, $scope.devicequery, $scope.appquery);
    network.selectNodes(sel);
    select(sel);
  }

  var network;
  var events = {
    onload: function(_network) {
      network = _network;
      $scope.$watch('devicequery', updateSelection);
      $scope.$watch('appquery', updateSelection);
    },
    selectNode: selectClick,
    deselectNode: selectClick,
  };


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

  $scope.setAppStatus = function(device, app, status) {
    var url = device.url + '/app/' + app.id;
    return $http({
      url: url,
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
      url: url,
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
    $uibModalInstance.close(123);
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
    return devicelib.devices(deployment.query).then(function(devices) {
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
    $scope.device = device;
    $scope.app = app;
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
    app._logInterval = setInterval(function() {
      var url = device.url + '/app/' + app.id + '/log';
      $http({
        method: 'GET',
        url: url,
      }).then(function(response) {
        $scope.log = response.data;
      });
    }, 2000);
  });

