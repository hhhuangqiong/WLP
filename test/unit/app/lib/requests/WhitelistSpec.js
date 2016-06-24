/* eslint-disable prefer-arrow-callback, func-names */

import { expect } from 'chai';
import nock from 'nock';
import sinon from 'sinon';

// to be spied
import request from 'superagent';

import { OPERATION_TYPE_ADD, WhitelistRequest } from 'app/lib/requests/Whitelist';

describe('Whitelist Request', function () {
  let wl = null;
  const hostPart = 'http://localhost';
  const timeout = 3000;
  const carrierId = 'carrierId';
  const path = `/1.0/carriers/${carrierId}/users/whitelist`;
  const usernames = ['username1'];

  const requestPath = `${hostPart}${path}`;

  describe('constructor', () =>

    it('should throw Error if no baseUrl or timeout is passed', function () {
      const baseUrlRegex = /baseurl/i;
      const timeoutRegex = /timeout/i;

      expect(() => new WhitelistRequest())
      .to.throw(Error, baseUrlRegex);

      expect(() => new WhitelistRequest(hostPart))
        .to.throw(Error, timeoutRegex);

      return expect(() => new WhitelistRequest(hostPart, timeout))
      .to.not.throw(Error);
    })
  );

  describe('#add', function () {
    const addPayload = {
      operationType: OPERATION_TYPE_ADD,
      usernames,
    };

    beforeEach(function () {
      wl = new WhitelistRequest(hostPart, timeout);
      return;
    });

    it('should throw Error on missing required arguments', function () {
      expect(function () {
        wl.add();
        return wl.add(carrierId);
      })
      .to.throw(Error, /required/i);

      expect(function () {
        wl.add(carrierId, usernames);
        return wl.add(carrierId, usernames, {});
      })
      .to.throw(Error, /function/i);

      expect(() => wl.add(carrierId, usernames, function () {}))
      .to.not.throw(Error);
    });

    it('should request with correct method, url, & payload', function (done) {
      const usernamesApplied = ['john'];
      nock(hostPart)
        .put(path, addPayload)
        .reply(200, {
          carrierId,
          usernamesApplied,
          usernamesNotApplied: [],
        });

      const spy = sinon.spy(request, 'put');

      return wl.add(carrierId, usernames, function (err, applied, notApplied) {
        expect(spy.firstCall.args[0]).to.match(new RegExp(requestPath));
        expect(applied).to.be.an('array');
        expect(applied).to.have.lengthOf(usernamesApplied.length);
        expect(applied[0]).to.equal(usernamesApplied[0]);
        // eslint-disable-next-line no-unused-expressions
        expect(notApplied).to.be.empty;

        spy.reset();
        return done();
      });
    });

    it('should handle error correctly', function (done) {
      nock(hostPart)
        .put(path, addPayload)
        .reply(400, {
          error: {
            status: 500,
            code: 30000,
            message: 'Internal Server Error',
          },
        });

      return wl.add(carrierId, usernames, function (err) {
        // eslint-disable-next-line no-unused-expressions
        expect(err).to.not.be.undefined;
        return done();
      });
    });
  });

  describe('#get', function () {
    const getOpts = {
      from: 0,
      to: 4,
    };

    it('should throw Error on missing required parameters', () =>
      expect(function () {
        wl.get();
        return wl.get(carrierId);
      })
      .to.throw(Error, /required/i)
    );

    it('should allow for optional parameters', () =>
      expect(function () {
        wl.get(carrierId, function () {});
        return wl.get(carrierId, getOpts, function () {});
      })
      .to.not.throw(Error)
    );

    it('should not send optional parameter if not present', function () {
      nock(hostPart)
        // could i do this better?
        .get(`${path}?from=#{getOpts.from}&to=#{getOpts.to}`)
        .reply(200, {
          carrierId,
          userCount: 5,
          indexRange: {
            from: getOpts.from,
            to: getOpts.to,
            pageNumberIndex: 0,
          },
          whitelist: [
            '+85291111111',
            '+85291111112',
            '+85291111113',
            '+85291111114',
            '+85291111115',
          ],
        });

      const spy = sinon.spy(request, 'get');

      // NB: no need to check querystring for nock won't reply
      // with the corresponding payload if querystring not match
      return wl.get(carrierId, getOpts, function (err, result) {
        expect(spy.firstCall.args[0])
          .to.match(new RegExp(requestPath));

        // to make sure not mistakenly getting another payload
        expect(result.userCount).to.eql(5);
        const found = result.whitelist;
        // eslint-disable-next-line no-unused-expressions
        expect(found).to.be.not.empty;
        expect(found).to.have.length.of(5);

        spy.reset();
      });
    });
  });
});

/* eslint-enable prefer-arrow-callback, func-names */
