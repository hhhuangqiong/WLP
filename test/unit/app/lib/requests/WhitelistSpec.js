import { expect } from 'chai';
import nock from 'nock';
import sinon from 'sinon';

// to be spied
import request from 'superagent';

import { OPERATION_TYPE_ADD, WhitelistRequest } from 'app/lib/requests/Whitelist';

describe('Whitelist Request', function() {
  let wl        = null;
  let hostPart  = 'http://localhost';
  let carrierId = 'carrierId';
  let path      = `/1.0/carriers/${carrierId}/whitelist`;
  let usernames = ['username1'];
  let opts      =
    {baseUrl: hostPart};

  let requestPath = `${hostPart}${path}`;

  describe('constructor', () =>

    it('should throw Error if no baseUrl is passed', function() {
      let regex = /baseurl/i;

      expect(() => new WhitelistRequest())
      .to.throw(Error, regex);

      return expect(() => new WhitelistRequest({baseUrl: '/whatever'}))
      .to.not.throw(Error, regex);
    })
  );

  describe('#add', function() {
    let addPayload = {
      operationType: OPERATION_TYPE_ADD,
      usernames
    };

    beforeEach(function() {
      wl = new WhitelistRequest(opts);
      return;
    });

    it('should throw Error on missing required arguments', function() {
      expect(function() {
        wl.add();
        return wl.add(carrierId);
      })
      .to.throw(Error, /required/i);

      expect(function() {
        wl.add(carrierId, usernames);
        return wl.add(carrierId, usernames, {});
      })
      .to.throw(Error, /function/i);

      expect(() => wl.add(carrierId, usernames, function() {}))
      .to.not.throw(Error);
    });

    it('should request with correct method, url, & payload', function(done) {
      let usernamesApplied = ['john'];
      nock(hostPart)
        .put(path, addPayload)
        .reply(200, {
          carrierId,
          usernamesApplied,
          usernamesNotApplied: []
        });

      let spy = sinon.spy(request, 'put');

      return wl.add(carrierId, usernames, function(err, applied, notApplied) {
        expect( spy.firstCall.args[0] )
          .to.match(new RegExp(requestPath));

        expect( applied ).to.eql(usernamesApplied);
        expect( notApplied ).to.be.empty;

        spy.reset();
        return done();
      });
    });

    it('should handle error correctly', function(done) {
      nock(hostPart)
        .put(path, addPayload)
        .reply(400, {
          error: {
            status:  500,
            code:    30000,
            message: "Internal Server Error"
          }
        });

      return wl.add(carrierId, usernames, function(err){
        expect( err ).to.not.be.undefined;
        return done();
      });
    });
  });

  describe('#get', function() {
    let getOpts = {
      from: 0,
      to:   4
    };

    it('should throw Error on missing required parameters', () =>
      expect(function() {
        wl.get();
        return wl.get(carrierId);
      })
      .to.throw(Error, /required/i)
    );

    it('should allow for optional parameters', () =>
      expect(function() {
        wl.get(carrierId, function() {});
        return wl.get(carrierId, getOpts, function() {});
      })
      .to.not.throw(Error)
    );

    it('should not send optional parameter if not present', function() {
      return nock(hostPart)
        // could i do this better?
        .get(`${path}?from=#{getOpts.from}&to=#{getOpts.to}`)
        .reply(200, {
          "carrierId": carrierId,
          "userCount": 5,
          "indexRange": {
            "from": getOpts.from,
            "to": getOpts.to,
            "pageNumberIndex": 0
          },
          "whitelist": [
            "+85291111111",
            "+85291111112",
            "+85291111113",
            "+85291111114",
            "+85291111115"]
        });

        let spy = sinon.spy(request, 'get');

        // NB: no need to check querystring for nock won't reply
        // with the corresponding payload if querystring not match
        return wl.get(carrierId, getOpts, function(err, result) {
          expect( spy.firstCall.args[0] )
            .to.match(new RegExp(requestPath));

          // to make sure not mistakenly getting another payload
          expect( result.userCount ).to.eql(5);
          let found = result.whitelist;
          expect(found).to.be.not.empty;
          expect(found).to.have.length.of(5);

          spy.reset();
        });
    });
  });
});
