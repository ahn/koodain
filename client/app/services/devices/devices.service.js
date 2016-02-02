/* global Slick */
'use strict';

angular.module('koodainApp')
  .service('queryDevices', function ($http) {


    function matchesId(id, device) {
      return device.id == id;
    }

    function matchesTag(tag, device) {
      return device.type == tag;
    }

    function matchesClasses(cl, device) {
      if (!cl) { return true; }
      for (var i=0; i < cl.length; i++) {
        if (!device.classes || device.classes.indexOf(cl[i]) === -1) {
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
      if (part.tag && part.tag!=='*' && !matchesTag(part.tag, device)) {
        return false;
      }
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
      for (var i=0; i < expr.length; i++) {
        if (!matchesPart(expr[i], device)) {
          return false;
        }
      }
      return true;
    }

    function matches(query, device) {
      if (typeof query === 'string') {
        query = Slick.parse(query);
      }

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

    function filter(query, devs) {
      return Object.keys(devs).filter(function(id) {
        return matches(query, devs[id]);
      });
    }

    var N = 100;
    var latestDeviceId = 0;

    function randomClasses() {
      var classes = ['canDoSomething', 'hasSomeProperty', "isSomething"];
      var cls = classes.filter(function() { return Math.random() < 0.5; });
      cls.push('mock');
      cls.push(['development', 'production'][Math.floor(Math.random()*3)]);
      return cls;
    }

    function randomAppNames() {
      var r = Math.random();
      if (r < 0.2) {
        return ['playSound'];
      }
      else if (r < 0.4) {
        return ['measureTemperature'];
      }
      return [];
    }

    function randomApps() {
      return randomAppNames().map(function(a) {
        return {name: a};
      });
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

    function fetchApps(device) {
      var d = device.data;
      $http({
        method: 'GET',
        url: d.url + '/app'
      }).then(function(res) {
        device.apps = res.data;
      });
    }

    var devices = {};

    function addMockDevicesTo(devs) {
      var rand = randomDevices();
      for (var i in rand) {
        devs[i] = rand[i];
      }
      return devs;
    }

    function queryDevices(q) {
      return devicelib.devices(q);
      
      /*
      .then(function(devs) {
        for (var i=0; i<devs.length; i++) {
          var d = devs[i];
          devices[d.id] = d;
          if (d.data.host) {
            fetchApps(d);
          }
        }
        var rand = randomDevices();
        for (i in rand) {
          devices[i] = rand[i];
        }
        return devices;
      });
      */


      /*
      var manUrl = 'http://130.230.142.101:3000';
      return $http({
        method: 'GET',
        url: manUrl,
        params: {q: q}
      }).then(function(res) {
        console.log(res);
        devices = {};
        for (var i=0; i<res.data.length; i++) {
          var d = res.data[i];
          d.id = d._id; // ???
          d.name = d.name || d.id; // ?
          devices[d.id] = d;

          if (d.host) {
            fetchApps(d);
          }

        }
        var rand = randomDevices();
        for (i in rand) {
          devices[i] = rand[i];
        }
        console.log(devices);
        return devices;
      });
        */


    }

    return {
      queryDevices: queryDevices,
      getDevices: function() { return devices; },
      filter: filter,
      addMockDevicesTo: addMockDevicesTo,
    };

  });
