'use strict';

angular.module('koodainApp')
  .controller('VisCtrl', function ($scope, VisDataSet) {
/*
    var dataGroups = new VisDataSet();
    dataGroups.add({});
    var dataItems = new VisDataSet();
    dataItems.add([{}]);
    $scope.graphData = {
        items: dataItems,
      groups: dataGroups
    };
*/


  var nodes = new VisDataSet();
  var edges = new VisDataSet();
  var GROUPS = {};
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
      GROUPS[id] = g;
      console.log("create " + id + ' ' + g);
      nodes.add({
        id: id,
        label: 'N'+id,
        group: g,
      });
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
    
    console.log("gg", GROUPS);
    console.log("nn", nodes);

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


  var optionsFA = {
      groups: {
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
      },
      //multiselect: true,
      interaction: {
        multiselect: true,

      }
    };

  var selectedNodeIds = [];

  function unselectedGroup(g) {
    var i = g.lastIndexOf('-');
    if (i === -1) {
      return g;
    }
    return g.slice(0, i+1);
  }
  
  function selectedGroup(g) {
    var i = g.lastIndexOf('-');
    if (i !== -1) {
      return g;
    }
    return g + ':selected';
  }

  function select(ns) {
    nodes.update(selectedNodeIds.map(function(n) {
      console.log('uuu', n, GROUPS[n], unselectedGroup(GROUPS[n]));
      console.log(nodes[n]);
      return {
        id: n,
        group: GROUPS[n]
      };
    }));
    nodes.update(ns.map(function(n) {
      console.log('sel', n, GROUPS[n], selectedGroup(GROUPS[n]));
      return {
        id: n,
        group: GROUPS[n] + ':selected'
      };
    }));
    selectedNodeIds = ns;
  }

  function deselect(ns) {
    nodes.update(ns.map(function(n) {
      return {
        id: ns.id,
        group: unselectedGroup(n.group),
      };
    }));
  }



  var network;
  var events = {
    onload: function(_network) {
      network = _network;
      $scope.$watch('devicequery', function() {
        //console.log($scope.network);
        network.selectNodes([1,2,3]);
        select([1,2,3]);
      });
    },
    selectNode: function(params, kk) {
      console.log("selectNode", params.nodes[0], kk);
      select(params.nodes);
    },
    deselectNode: function(params, kk) {
      console.log("unselectNode", params.nodes[0], kk);
      select(params.nodes);
    }
  };

  var rd = randomData();
  $scope.graphData = rd.data;

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

  $scope.graphEvents = events;
  $scope.graphOptions = optionsFA;



});
