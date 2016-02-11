'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var pipeCtrlStub = {
  index: 'pipeCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var pipeIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './pipe.controller': pipeCtrlStub
});

describe('Pipe API Router:', function() {

  it('should return an express router instance', function() {
    pipeIndex.should.equal(routerStub);
  });

  describe('GET /api/pipe', function() {

    it('should route to pipe.controller.index', function() {
      routerStub.get
        .withArgs('/', 'pipeCtrl.index')
        .should.have.been.calledOnce;
    });

  });

});
