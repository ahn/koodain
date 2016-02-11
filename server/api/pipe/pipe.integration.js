'use strict';

var app = require('../..');
import request from 'supertest';

describe('Pipe API:', function() {

  describe('GET /api/pipe', function() {
    var pipes;

    beforeEach(function(done) {
      request(app)
        .get('/api/pipe')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          pipes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      pipes.should.be.instanceOf(Array);
    });

  });

});
