/* global devicelib */
'use strict';

angular.module('koodainApp')
  .controller('VisCtrl', function ($scope, $http, $uibModal, Notification, VisDataSet, queryDevices) {


  var groups = {};

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

    var code = codes[g], color;
    if (code) {
      color = 'black';
    } else {
      code = '\uf233';
      color = 'gray';
    }
    

    groups[g] = {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: code,
        size: 50,
        color: color,
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

  function groupOfApp(app) {
    return group(app.name);
  }

  function groupForDevice(device) {
    if (!device.apps || device.apps.length === 0) {
      return group('default');
    }
    return groupOfApp(device.apps[0]);
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
      group: groupForDevice(device),
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
  queryDevices.queryDevices().then(function(ddd) {
    devs = deviceListAsObject(ddd);
    queryDevices.addMockDevicesTo(devs);
    nodes = new VisDataSet(Object.keys(devs).map(function(id) {
      return nodeFromDevice(devs[id]);
    }));

    edges = randomEdges(devs);

    $scope.graphData = {
      nodes: nodes,
      edges: edges,
    };
  });


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


  function selectClick(params) {
    $scope.devicequery = params.nodes.map(function(id) { return '#'+id; }).join(',');
    $scope.$apply();
  }

  var network;
  var events = {
    onload: function(_network) {
      network = _network;
      $scope.$watch('devicequery', function(q) {
        var sel;
        if (!q) {
          sel = [];
        }
        else {
          sel = queryDevices.filter(q, devs);
        }
        network.selectNodes(sel);
        select(sel);

      });
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
        data: function() { return {devices: $scope.selectedDevices, query: $scope.devicequery}; },
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


  /*
  setInterval(function() {
    var r = Math.random();
    if(r < 0.2) {
      rd.addRandomNode();
    }
    else if (r < 0.4) {
      rd.removeRandomNode();
    }
    else if (r < 0.8) {
      rd.addRandomEdge();
    }
  }, 1000);
  */




}).controller('ManageAppsCtrl', function($scope, $resource, $uibModalInstance, data) {

  $scope.devices = data.devices;
  $scope.query = data.query;
  var Project = $resource('/api/projects');
  $scope.projects = Project.query();

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
  $scope.done = function() {
    var deployment = {
      query: data.query,
      project: $scope.selectedProject,
      numApproxDevices: data.devices.length,
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
    var url = device.data.url;
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

});

