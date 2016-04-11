import React from 'react';
import Fluxible from 'fluxible';
import FluxContext from 'fluxible/lib/FluxibleContext';
import { expect } from 'chai';
import { createContext, createMarkupElement } from 'app/utils/fluxible';

describe('fluxible Utils', () => {
  describe('#createContext()', () => {
    const app = new Fluxible();
    const invalidApp = { key: 'value' };
    const state = { config: 'config' };

    it('should throw Error if cb is missing', (done) => {
      const fn = () => createContext(app);
      expect(fn).to.throw('missing cb or cb is not a function');
      done();
    });

    it('should throw Error if cb is not a function', (done) => {
      const fn = () => createContext(app, null, null, app);
      expect(fn).to.throw('missing cb or cb is not a function');
      done();
    });

    it('should return an error if the first argument is not a Fluxible instance', (done) => {
      createContext(invalidApp, null, null, (err, context) => {
        expect(err).to.be.an('Error').that.has.property('message', 'missing Fluxible instance');
        // eslint-disable-next-line no-unused-expressions
        expect(context).to.be.undefined;
        done();
      });
    });

    it('should return a FluxContext instance with state argument', (done) => {
      createContext(app, state, null, (err, context) => {
        // eslint-disable-next-line no-unused-expressions
        expect(err).to.be.null;
        expect(context).to.be.an.instanceof(FluxContext);
        done();
      });
    });

    it('should return a FluxContext instance without state argument', (done) => {
      createContext(app, null, null, (err, context) => {
        // eslint-disable-next-line no-unused-expressions
        expect(err).to.be.null;
        expect(context).to.be.an.instanceof(FluxContext);
        done();
      });
    });
  });

  describe('#createMarkupElement()', () => {
    const app = new Fluxible();
    const context = app.createContext();
    const invalidContext = {};
    const children = <div />;
    const invalidChildren = {};

    it('should throw error if the first argument is missing', (done) => {
      const fn = () => createMarkupElement();
      expect(fn).to.throw('missing FluxContext');
      done();
    });

    it('should throw error if the first argument is not a FluxContext', (done) => {
      const fn = () => createMarkupElement(invalidContext, children);
      expect(fn).to.throw('invalid context instance');
      done();
    });

    it('should throw error if the second argument is not a ReactElement', (done) => {
      const fn = () => createMarkupElement(context, invalidChildren);
      expect(fn).to.throw('missing ReactElement');
      done();
    });

    it('should return a ReactElement', (done) => {
      const element = createMarkupElement(context, children);
      // eslint-disable-next-line no-unused-expressions
      expect(React.isValidElement(element)).to.be.true;
      done();
    });
  });
});
