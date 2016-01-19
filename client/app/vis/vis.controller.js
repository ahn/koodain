'use strict';

angular.module('koodainApp')
  .controller('VisCtrl', function ($scope, VisDataSet) {

  function heh(query) {
    console.log("heh", query, devices);
    return Object.keys(devices).filter(function(id) {
      return matches(query, devices[id]);
    });

  }

  function matches(query, device) {
    if (typeof query === 'string') {
      query = Slick.parse(query);
    }
    //console.log("QUERY", query);

    if (!query) {
      return [];
    }

    var exprs = query.expressions;
    for (var i=0; i < exprs.length; i++) {
      if (matchesExpr(exprs[i], device)) {
        return true;
      }
    }
    return false;
  }

  function matchesExpr(expr, device) {
    console.log("EXPR", expr);
    for (var i=0; i < expr.length; i++) {
      if (!matchesPart(expr[i], device)) {
        return false;
      }
    }
    return true;
  }

  function matchesPart(part, device) {
    //console.log("PART", part);
    if (!matchesClasses(part.classList, device)) {
      return false;
    }
    if (part.id && !matchesId(part.id, device)) {
      return false;
    }
    return true;
  }

  function matchesId(id, device) {
    return device.id == id;
  }

  function matchesClasses(cl, device) {
    if (!cl) return true;
    for (var i=0; i < cl.length; i++) {
      if (device.classes.indexOf(cl[i]) === -1) {
        return false;
      }
    }
    return true;
  }

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



  var nodes = new VisDataSet();
  var edges = new VisDataSet();
  var ALL_NODES = {};
  function randomData() {
    var N = 25;
    var latestDeviceId = 0;
    function randomDeviceId() {
      // May not exist because deleted...
      return Math.floor(Math.random() * latestDeviceId);
    }
    function randomGroup() {
      var groups = ['playsound', 'trash', 'light', 'mic'];
      var r = Math.floor(Math.random() * groups.length);
      return groups[r];
    }

    function randomClasses() {
      var classes = ['canPlaySound', 'canMeasureTemperature'];
      return classes.filter(function() { return Math.random() < 0.5; });
    }

    function randomApps() {
      var r = Math.random();
      if (r < 0.2) {
        return ['playSound'];
      }
      else if (r < 0.4) {
        return ['measureTemperature'];
      }
      return [];
    }

    function randomDevice() {
      var classes = randomClasses();
      var id = ++latestDeviceId;
      return {
        id: id,
        name: 'Device ' + id,
        classes: classes,
        apps: randomApps(classes),
      };
    }

    function randomDevices() {
      var devices = {};
      for (var i=0; i<N; i++) {
        var d = randomDevice();
        devices[d.id] = d;
      }
      return devices;
    }

    function nodeFromDevice(device) {
      var n = {
        id: device.id,
        label: device.name,
        group: groupForDevice(device),
      };
      return n;
    }


    function createNode(id) {
      var g = randomGroup();
      var n = {
        id: id,
        label: 'N'+id,
        group: g,
      };
      n.code = groups[g].icon.code;
      nodes.add(n);
      ALL_NODES[id] = n;
    }

    function createEdge(from, to) {
      console.log("createEdge", from, to);
      edges.add({
        from: from,
        to: to,
        color :{
          highlight: 'purple',
        }
      });
    }


    function addRandomNode() {
      createNode(++latestDeviceId);
    }

    function addRandomEdge() {
      //createEdge(randomDeviceId(), randomDeviceId());
    }

    function removeRandomNode() {
      nodes.remove({id:randomDeviceId()});
    }

    for (var i=0; i<N; i++) {
      //addRandomNode();
    }

    var devices = randomDevices();
    nodes = new VisDataSet(Object.keys(devices).map(function(id) {
      var n = nodeFromDevice(devices[id]);
      console.log(n);
      return n;
    }));

    for (i=0; i<N; i++) {
      addRandomEdge();
    }
    
    return {
      devices: devices,
      data: {
        nodes: nodes,
        edges: edges
      },
      addRandomNode: addRandomNode,
      removeRandomNode: removeRandomNode,
      addRandomEdge: addRandomEdge
    };
  }

  var rd = randomData();
  var devices = rd.devices;
  $scope.graphData = rd.data;

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
        group: groupForDevice(devices[id])
      };
    }));
    nodes.update(ns.map(function(id) {
      return {
        id: id,
        group: groupForDevice(devices[id]) + ':selected'
      };
    }));
    selectedNodeIds = ns;
    $scope.selectedDevices = selectedNodeIds.map(function(id) {
      return devices[id];
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
          sel = heh(q);
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
