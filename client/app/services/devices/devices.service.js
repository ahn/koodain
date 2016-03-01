/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

/* global Slick,devicelib */
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
        // TODO: doesn't work for apps!
        return !matches(device, pseudo.value);
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
      if (part.attributes && !matchesAttrs(part.attributes, device)) {
        return false;
      }
      return true;
    }

    function matchesAttrs(attrs, device) {
      for (var i=0; i<attrs.length; i++) {
        if (!matchesAttr(attrs[i], device)) {
          return false;
        }
      }
      return true;
    }

    function matchesAttr(attr, device) {
      return attr.test(device[attr.key]);
    }

    function matchesExpr(expr, device) {
      for (var i=0; i < expr.length; i++) {
        if (!matchesPart(expr[i], device)) {
          return false;
        }
      }
      return true;
    }

    function matchesApp(app, query) {
      var exprs = query.expressions;
      for (var i=0; i < exprs.length; i++) {
        if (matchesExpr(exprs[i], app)) {
          return true;
        }
      }
      return false;
    }

    function matchesAppQuery(device, query) {
      if (typeof query === 'string') {
        query = Slick.parse(query);
      }

      if (!query) {
        return [];
      }

      var apps = device.apps;

      if (!apps) {
        return false;
      }

      for (var i=0; i<apps.length; i++) {
        if (matchesApp(apps[i], query)) {
          return true;
        }
      }
      return false;
    }

    function matchesDeviceQuery(device, query) {
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

    function matches(device, devicequery, appquery) {
      if (devicequery && !matchesDeviceQuery(device, devicequery)) {
        return false;
      }
      if (appquery && !matchesAppQuery(device, appquery)) {
        return false;
      }
      return true;
    }

    function filter(devs, devicequery, appquery) {
      if (!devicequery && !appquery) {
        return [];
      }

      return Object.keys(devs).filter(function(id) {
        return matches(devs[id], devicequery, appquery);
      });
    }

    var N = 100;
    var latestDeviceId = 0;

    function randomClasses() {
      var classes = ['canDoSomething', 'hasSomeProperty', 'isSomething'];
      var cls = classes.filter(function() { return Math.random() < 0.5; });
      cls.push('mock');
      cls.push(['development', 'production'][Math.floor(Math.random()*3)]);
      return cls;
    }

    function randomAppNames() {
      var names = [];
      if (Math.random() < 0.2) {
        names.push('playSound');
      }
      if (Math.random() < 0.2) {
        names.push('measureTemperature');
      }
      return names;
    }

    var latestAppId = 500000;
    function randomApps() {
      return randomAppNames().map(function(a) {
        return {name: a, id: ++latestAppId};
      });
    }

    function randomLocation() {
      return 'TF11' + Math.floor(Math.random()*10);
    }

    function randomDevice() {
      var classes = randomClasses();
      var id = 'mock' + (++latestDeviceId);
      return {
        id: id,
        name: id,
        classes: classes,
        apps: randomApps(classes),
        location: randomLocation(),
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
      $http({
        method: 'GET',
        url: device.url + '/app'
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

    return function (deviceManagerUrl) {
      var dm = devicelib(deviceManagerUrl);
      function queryDevices(q) {
        return dm.devices(q);
      }

      return {
        queryDevices: queryDevices,
        filter: filter,
        addMockDevicesTo: addMockDevicesTo,
      };
    };

  });
