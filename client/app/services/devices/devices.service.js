/* global Slick */
'use strict';

angular.module('koodainApp')
  .service('devices', function ($http) {


    function matchesId(id, device) {
      return device.id == id;
    }

    function matchesClasses(cl, device) {
      if (!cl) { return true; }
      for (var i=0; i < cl.length; i++) {
        if (device.classes.indexOf(cl[i]) === -1) {
          return false;
        }
      }
      return true;
    }


    function matchesPseudo(pseudo, device) {
      if (pseudo.key === 'not') {
        return !matches(pseudo.value, device);
      }
      return true;
    }

    function matchesPseudos(pseudos, device) {
      if (!pseudos) { return true; }
      for (var i=0; i<pseudos.length; i++) {
        if (!matchesPseudo(pseudos[i], device)) {
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
      if (!matchesPseudos(part.pseudos, device)) {
        return false;
      }
      return true;
    }

    function matchesExpr(expr, device) {
      //console.log("EXPR", expr);
      for (var i=0; i < expr.length; i++) {
        if (!matchesPart(expr[i], device)) {
          return false;
        }
      }
      return true;
    }

    function matches(query, device) {
      //console.log("MATCHES", query, device);
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

    function filter(query) {
      return Object.keys(devices).filter(function(id) {
        return matches(query, devices[id]);
      });
    }

    var N = 25;
    var latestDeviceId = 0;
    function randomDeviceId() {
      // May not exist because deleted...
      return Math.floor(Math.random() * latestDeviceId);
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
      var id = 'mock' + (++latestDeviceId);
      return {
        id: id,
        name: id,
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

    var devices = randomDevices();

    function queryDevices(q) {
      var manUrl = 'http://130.230.142.101:3000';
      return $http({
        method: 'GET',
        url: manUrl,
        params: {q: q}
      }).then(function(res) {
        console.log(res);
        devices = {};
        for (var i=0; i<res.data.length; i++) {
          devices[res.data[i].id] = res.data[i];
        }
        var rand = randomDevices();
        for (i in rand) {
          devices[i] = rand[i];
        }
        console.log(devices);
        return devices;
      });


    }

    return {
      queryDevices: queryDevices,
      getDevices: function() { return devices; },
      filter: filter,
    };

  });
