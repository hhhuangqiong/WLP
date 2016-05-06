import { expect } from 'chai';
import express from 'express';
import apiResponse, { parseError } from 'app/server/utils/apiResponse';
import request from 'supertest';
import { TimeoutError } from 'common-errors';
import { isArray } from 'lodash';

describe('apiResponse', () => {
  describe('#parseError', () => {
    const validTitle = 'json api error';
    const invalidTitle = { name: 'json api error' };
    const invalidCode = { code: 'invalidCode' };
    const invalidStatus = { status: 'status' };
    const numbericStatus = 500;
    const validError = new Error('json api error');
    const invalidError = { name: 'json api error', message: 'json api error' };
    const invalidOptions = { source: { name: 'source' } };
    const detailOption = { detail: 'error detail' };
    const validOptions = {
      id: 'id',
      code: 'code',
      source: {
        pointer: '/data/attributes/first-name',
      },
      title: 'title',
      detail: 'detail',
      status: '500',
    };

    it('should throw error if `error` argument is missing', done => {
      const fn = () => parseError();
      expect(fn).to.throw('invalid `error` argument');
      done();
    });

    it('should throw error if `error` argument is an Error instance', done => {
      const fn = () => parseError(invalidError);
      expect(fn).to.throw('invalid `error` argument');
      done();
    });

    it('should throw error if `options.title` argument is not a string', done => {
      const fn = () => parseError(validError, { title: invalidTitle });
      expect(fn).to.throw('invalid `title` argument');
      done();
    });

    it('should take error.name if `options.title` is not given or is undefined', done => {
      const error = parseError(validError);
      expect(error).to.have.property('title', validError.name);
      done();
    });

    it('should take if `options.title` is given', done => {
      const error = parseError(validError, { title: validTitle });
      expect(error).to.have.property('title', validTitle);
      done();
    });

    it('should throw error if `options.code` argument is not a string', done => {
      const fn = () => parseError(validError, { code: invalidCode });
      expect(fn).to.throw('invalid `options.code` argument');
      done();
    });

    it('should throw error if `options.status` argument is not a string', done => {
      const fn = () => parseError(validError, { status: invalidStatus });
      expect(fn).to.throw('invalid `options.status` argument');
      done();
    });

    it('should accept `options.status` argument with numberic value and return it as a string', done => {
      let error;
      const fn = () => { error = parseError(validError, { status: numbericStatus }) };
      expect(fn).not.to.throw(Error);
      expect(error).to.have.property('status').that.is.a('string');
      done();
    });

    it('should throw error if `options.source` contains key of neither `pointer` nor `parameter`', done => {
      const fn = () => parseError(validError, invalidOptions);
      expect(fn).to.throw('missing `pointer` or `parameter` key in `options.source`');
      done();
    });

    it('should take `error.inner_error.toString()` if `options.detail` is not given or is undefined', done => {
      const innerError = new Error('inner error');
      const error = parseError(new TimeoutError('100ms', innerError));
      expect(error).to.have.property('detail', innerError.toString());
      done();
    });

    it('should take `error.toString()` if `options.detail` is not given or is undefined', done => {
      const error = parseError(validError);
      expect(error).to.have.property('detail', validError.toString());
      done();
    });

    it('should take `error.message` if `options.detail` is given and is not undefined', done => {
      const error = parseError(validError, detailOption);
      expect(error).to.have.property('detail', detailOption.detail);
      done();
    });

    it('should merge the response with keys and value of `id`, `code`, `status`, `source`, `detail` and `title` in `options` argument', done => {
      const error = parseError(validError, validOptions);
      expect(error).to.have.property('id', validOptions.id);
      expect(error).to.have.property('code', validOptions.code);
      expect(error).to.have.property('status', validOptions.status);
      expect(error).to.have.property('detail', validOptions.detail);
      expect(error).to.have.deep.property('source.pointer', validOptions.source.pointer);
      expect(error).to.have.property('title', validOptions.title);
      done();
    });
  });

  it('should throw error if options is not an object', done => {
    const fn = () => apiResponse('invalid argument');
    expect(fn).to.throw('`options` argument is not an object');
    done();
  });

  it('should not throw error with no argument', done => {
    const fn = () => apiResponse();
    expect(fn).not.to.throw(Error);
    done();
  });

  describe('#res.apiResponse()', () => {
    const app = express();
    const payload = {
      meta: {},
      data: [],
      links: {},
      others: [],
    };
    const invalidMetaPayload = {
      meta: 'meta',
      data: [],
      links: {},
    };
    const invalidDataPayload = {
      meta: {},
      data: 'data',
      links: {},
    };
    app.use(apiResponse());
    app.get('/test/get/success', function (req, res, next) {
      res.apiResponse(200, payload);
    });
    app.get('/test/get/success/null', function (req, res, next) {
      res.apiResponse(200, { data: null });
    });
    app.get('/test/get/invalidMeta', function (req, res, next) {
      res.apiResponse(200, invalidMetaPayload);
    });
    app.get('/test/get/invalidData', function (req, res, next) {
      res.apiResponse(200, invalidDataPayload);
    });

    it('should response with status given as the first argument', done => {
      request(app)
        .get('/test/get/success')
        .expect(200)
        .end(done);
    });

    it('should response with content type of json', done => {
      request(app)
        .get('/test/get/success')
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('should accept value of `data` is null', done => {
      request(app)
        .get('/test/get/success/null')
        .expect(200)
        .end(done);
    });

    it('should response with a json object that contains keys of `success`, `status`, `meta`, `data` and `links` only', done => {
      request(app)
        .get('/test/get/success')
        .expect(res => {
          if (!('success' in res.body)) {
            throw new Error('missing `success` key');
          }

          if (!('status' in res.body)) {
            throw new Error('missing `status` key');
          }

          if (!('meta' in res.body)) {
            throw new Error('missing `meta` key');
          }

          if (!('data' in res.body)) {
            throw new Error('missing `data` key');
          }

          if (!('links' in res.body)) {
            throw new Error('missing `links` key');
          }

          if ('others' in res.body) {
            throw new Error('it should not contain key(s) other than `success`, `status`, `meta`, `data` and `links`');
          }
        })
        .end(done);
    });

    it('should not throw error but response 500 internal server error if error occurred', done => {
      request(app)
        .get('/test/get/invalidMeta')
        .expect(500, {
          success: false,
          status: 500,
          errors: [{
            title: 'Error',
            detail: 'Error: the value of `meta` is not an object',
          }],
        }, done);
    });

    it('should not throw error but response 500 internal server error if error occurred', done => {
      request(app)
        .get('/test/get/invalidData')
        .expect(500, {
          success: false,
          status: 500,
          errors: [{
            title: 'Error',
            detail: 'Error: the value of `data` is neither an object nor an array nor a null',
          }],
        }, done);
    });
  });

  describe('#res.apiError()', () => {
    const app = express();
    const error = new Error('internal server error');
    const arrayError = [error];
    const errors = [new Error('username cannot be empty'), new Error('password cannot be empty')];
    const invalidError = {};
    app.use(apiResponse());
    app.get('/test/get/error', function (req, res, next) {
      res.apiError(500, error);
    });
    app.get('/test/get/arrayError', function (req, res, next) {
      res.apiError(500, arrayError);
    });
    app.get('/test/get/errors', function (req, res, next) {
      res.apiError(500, errors);
    });
    app.get('/test/get/invalidError', function (req, res, next) {
      res.apiError(500, invalidError);
    });

    it('should response with content type of json', done => {
      request(app)
        .get('/test/get/error')
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('should take the `status` argument and set as response status', done => {
      request(app)
        .get('/test/get/error')
        .expect(500)
        .end(done);
    });

    it('should accept non array with single error', done => {
      request(app)
        .get('/test/get/error')
        .expect(500, {
          success: false,
          status: 500,
          errors: [{
            title: 'Error',
            detail: 'Error: internal server error',
          }],
        }, done);
    });

    it('should accept array of error(s)', done => {
      request(app)
        .get('/test/get/arrayError')
        .expect(500, {
          success: false,
          status: 500,
          errors: [{
            title: 'Error',
            detail: 'Error: internal server error',
          }],
        }, done);
    });

    it('should response with a json object that contains keys of `success`, `status` and `errors` only', done => {
      request(app)
        .get('/test/get/error')
        .expect(res => {
          if (!('success' in res.body)) {
            throw new Error('missing `success` key');
          }

          if (!('status' in res.body)) {
            throw new Error('missing `status` key');
          }

          if (!('errors' in res.body)) {
            throw new Error('missing `errors` key');
          }

          if (!isArray(res.body.errors)) {
            throw new Error('value of `errors` is not an array');
          }

          if (res.body.length > 3) {
            throw new Error('there are keys other than `success`, `status` and `errors` in the response payload');
          }
        })
        .end(done);
    });

    it('should be able to response with multiple errors', done => {
      request(app)
        .get('/test/get/errors')
        .expect(res => {
          if (res.body.errors.length !== errors.length) {
            throw new Error('number of errors mismatches');
          }
        })
        .end(done);
    });

    it('should not throw error but response 500 internal server error if error occurred when parsing error', done => {
      request(app)
        .get('/test/get/invalidError')
        .expect(500, {
          success: false,
          status: 500,
          errors: [{
            title: 'Error',
            detail: 'Error: internal server error',
          }],
        }, done);
    });
  });
});
