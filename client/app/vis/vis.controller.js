'use strict';

angular.module('koodainApp')
  .controller('VisCtrl', function ($scope, VisDataSet, devices) {


  var groups = {};

  function group(g) {
    if (g in groups) {
      return g;
    }

    var codes = {
      playSound: '\uf028',
      measureTemperature: '\uf0e4',
    };
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
    return group(app);
  }

  function groupForDevice(device) {
    if (device.apps.length === 0) {
      return group('default');
    }
    return groupOfApp(device.apps[0]);
  }

  function nodeFromDevice(device) {
    var n = {
      id: device.id,
      label: device.name,
      group: groupForDevice(device),
    };
    return n;
  }

  var devs = [], nodes, edges;
  devices.queryDevices().then(function(devices) {
    console.log("QQQDD", devices);
    devs = devices;
    nodes = new VisDataSet(Object.keys(devs).map(function(id) {
      return nodeFromDevice(devs[id]);
    }));
    edges = new VisDataSet();

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
          sel = devices.filter(q);
        }
        network.selectNodes(sel);
        select(sel);

      });
    },
    selectNode: selectClick,
    deselectNode: selectClick,
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

  $scope.graphEvents = events;
  $scope.graphOptions = options;



});
