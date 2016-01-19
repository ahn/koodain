'use strict';

angular.module('koodainApp')
  .controller('VisCtrl', function ($scope, VisDataSet) {

  var groups = {
    playsound: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf028',
        size: 50,
        color: 'gray',
      }
    },
    'playsound:selected': {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf028',
        size: 50,
        color: 'purple',
      }
    },
    trash: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf1f8',
        size: 50,
        color: 'gray',
      }
    },
    'trash:selected': {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf1f8',
        size: 50,
        color: 'purple',
      }
    },
    light: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf0eb',
        size: 50,
        color: 'gray',
      }
    },
    'light:selected': {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf0eb',
        size: 50,
        color: 'purple',
      }
    },
    mic: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf130',
        size: 50,
        color: 'gray',
      }
    },
    'mic:selected': {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf130',
        size: 50,
        color: 'purple',
      }
    }
  };

  var nodes = new VisDataSet();
  var edges = new VisDataSet();
  var ALL_NODES = {};
  function randomData() {
    var N = 25;
    var latestNodeId = 0;
    function randomNodeId() {
      // May not exist because deleted...
      return Math.floor(Math.random() * latestNodeId);
    }
    function randomGroup() {
      var groups = ['playsound', 'trash', 'light', 'mic'];
      var r = Math.floor(Math.random() * groups.length);
      return groups[r];
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
      edges.add({
        from: from,
        to: to,
        color :{
          highlight: 'purple',
        }
      });
    }


    function addRandomNode() {
      createNode(++latestNodeId);
    }

    function addRandomEdge() {
      createEdge(randomNodeId(), randomNodeId());
    }

    function removeRandomNode() {
      nodes.remove({id:randomNodeId()});
    }

    for (var i=0; i<N; i++) {
      addRandomNode();
    }

    for (i=0; i<N; i++) {
      addRandomEdge();
    }
    
    return {
      data: {
        nodes: nodes,
        edges: edges
      },
      addRandomNode: addRandomNode,
      removeRandomNode: removeRandomNode,
      addRandomEdge: addRandomEdge
    };
  }

  var options = {
    groups: groups,
    interaction: {
      multiselect: true,
    }
  };

  var selectedNodeIds = [];

  function select(ns) {
    nodes.update(selectedNodeIds.map(function(n) {
      return {
        id: n,
        group: ALL_NODES[n].group
      };
    }));
    nodes.update(ns.map(function(n) {
      return {
        id: n,
        group: ALL_NODES[n].group + ':selected'
      };
    }));
    selectedNodeIds = ns;
    console.log(selectedNodeIds, $scope.devices);
    $scope.devices = selectedNodeIds.map(function(id) {
      return ALL_NODES[id];
    });
  }


  var network;
  var events = {
    onload: function(_network) {
      network = _network;
      $scope.$watch('devicequery', function() {
        network.selectNodes([1,2,3]);
        select([1,2,3]);
      });
    },
    selectNode: function(params, kk) {
      select(params.nodes);
      $scope.$apply();
    },
    deselectNode: function(params, kk) {
      select(params.nodes);
      $scope.$apply();
    }
  };

  var rd = randomData();
  $scope.graphData = rd.data;

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
