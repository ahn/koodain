'use strict';

angular.module('koodainApp')
  .controller('VisCtrl', function ($scope, VisDataSet) {
    $scope.message = 'Hello';
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
    function randomNodeId() {
      return Math.floor(Math.random() * N);
    }
    function randomGroup() {
      var groups = ['playsound', 'trash', 'light', 'mic'];
      var r = Math.floor(Math.random() * groups.length);
      return groups[r];
    }

    function createNode() {
      var i = N++;
      var g = randomGroup();
      GROUPS[i] = g;
      nodes.add({
        id: i,
        label: 'N'+i,
        group: randomGroup(),
        color :{
          highlight: 'red',
        }
      });
    }

    function createEdge(from, to) {
      edges.add({
        from: from,
        to: to
      });

    }

    for (var i=0; i<N; i++) {
      createNode();
    }

    for (i=0; i<N; i++) {
      createEdge(randomNodeId(), randomNodeId());
    }


    function addNode() {
      createNode();
    }

    function addEdge() {
      edges.add({
        from: randomNodeId(),
        to: randomNodeId()
      });
    }

    function removeNode() {
      nodes.remove({id:randomNodeId()});
    }

    return {
      data: {
        nodes: nodes,
        edges: edges
      },
      addNode: addNode,
      removeNode: removeNode,
      addEdge: addEdge
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
          }
        },
        trash: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf1f8',
            size: 50,
          }
        },
        light: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf0eb',
            size: 50,
          }
        },
        'light-selected': {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf0eb',
            size: 100,
            color: 'purple',
          }
        },
        mic: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf130',
            size: 50,
          }
        }
      },
      //multiselect: true,
      interaction: {
        multiselect: true,

      }
    };



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
    return g.slice(i+1);
  }

  function select(ns) {
    nodes.update(ns.map(function(n) {
      console.log('g', n);
      return {
        id: n,
        group: selectedGroup(GROUPS[n]),
      };
    }));
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
        //network.selectNodes([1,2,3]);
      });
    },
    selectNode: function(params, kk) {
      console.log("selectNode", params.nodes[0], kk);
      select(params.nodes);
    }
  };

  var rd = randomData();
  $scope.graphData = rd.data;

  setInterval(function() {
    var r = Math.random();
    if(r < 0.2) {
      rd.addNode();
    }
    else if (r < 0.4) {
      rd.removeNode();
    }
    else if (r < 0.8) {
      rd.addEdge();
    }
  }, 1000);

  $scope.graphEvents = events;
  $scope.graphOptions = optionsFA;



});
