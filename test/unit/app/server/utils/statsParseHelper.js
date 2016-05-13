import { expect } from 'chai';
import { getSegmentsByProperties, getTotalFromSegmentData } from 'app/server/utils/statsParseHelper';

describe('statsParseHelper', () => {
  describe('#getSegmentsByProperties', () => {
    const validResults = [
      { segment: { nature: 'sticker', country: 'us' }, data: [] },
      { segment: { nature: 'voice_sticker', country: 'uk' }, data: []},
      { segment: { nature: 'remote', country: 'uk' }, data: []},
    ];
    const invalidResults = 'result';
    const validStringProperties = { nature: 'voice_sticker' };
    const validUppercaseStringPropperties = { nature: 'VOICE_STICKER' };
    const validArrayProperties = { nature: ['voice_sticker', 'remote'] };
    const validMultipleProperties = { nature: 'voice_sticker', country: 'us' };
    const invalidProperties = 'properties';
    const invalidValueProperties = { nature: { value: 'remote' } };

    it('should throw error if `properties` argument is not an object', done => {
      const fn = () => getSegmentsByProperties(validResults, invalidProperties);
      expect(fn).to.throw('`properties` is not an object');
      done();
    });

    // eslint-disable-next-line max-len
    it('should throw error if `properties` argument is not an object with Array or String values', done => {
      const fn = () => getSegmentsByProperties(validResults, invalidValueProperties);
      expect(fn).to.throw('`properties` is not an object with Array or String values');
      done();
    });

    it('should return an empty array with invalid `results` argument', done => {
      let results;
      const fn = () => {
        results = getSegmentsByProperties(invalidResults, validStringProperties);
      };
      expect(fn).not.to.throw(Error);
      // eslint-disable-next-line no-unused-expressions
      expect(results).to.be.a('array').that.is.empty;
      done();
    });

    // eslint-disable-next-line max-len
    it('should return matched array of objects with `properties` object with string value', done => {
      const results = getSegmentsByProperties(validResults, validStringProperties);
      expect(results).to.be.a('array').that.have.lengthOf(1);
      done();
    });

    // eslint-disable-next-line max-len
    it('should not be case sensitive with array of objects with `properties` object with string value', done => {
      const results = getSegmentsByProperties(validResults, validUppercaseStringPropperties);
      expect(results).to.be.a('array').that.have.lengthOf(1);
      done();
    });

    it('should return matched array of objects with `properties` object with array value', done => {
      const results = getSegmentsByProperties(validResults, validArrayProperties);
      expect(results).to.be.a('array').that.have.lengthOf(2);
      done();
    });

    // eslint-disable-next-line max-len
    it('should return array of objects that only with all key and value pairs in `properties` object', done => {
      const results = getSegmentsByProperties(validResults, validMultipleProperties);
      // eslint-disable-next-line no-unused-expressions
      expect(results).to.be.a('array').that.is.empty;
      done();
    });
  });

  describe('#getTotalFromSegmentData', () => {
    const invalidData = 1;
    const validData = [{ t: 0, v: 1 }, { t: 1, v: 2 }];
    const validStringData = [{ t: 0, v: '1' }, { t: 1, v: '2' }];
    const invalidValueData = [{ t: 0, v: 1 }, { t: 1, v: 2 }, { t: 2, v: { value: 3 } }];
    const expectedTotal = 3;

    it('should throw error if `data` argument is not an array', done => {
      const fn = () => getTotalFromSegmentData(invalidData);
      expect(fn).to.throw('`data` is not an array');
      done();
    });

    it('should return a number with objects with numeric value', done => {
      const total = getTotalFromSegmentData(validData);
      expect(total).to.be.a('number').that.equals(expectedTotal);
      done();
    });

    it('should return a number with objects with string value', done => {
      const total = getTotalFromSegmentData(validStringData);
      expect(total).to.be.a('number').that.equals(expectedTotal);
      done();
    });

    it('should not throw error and skip it if the value property is not a string or a number', done => {
      let total;
      const fn = () => {
        total = getTotalFromSegmentData(invalidValueData);
      };
      expect(fn).not.to.throw(Error);
      expect(total).to.be.a('number').that.equals(expectedTotal);
      done();
    });
  });
});
