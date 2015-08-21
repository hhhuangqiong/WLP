var expect = require('chai').expect;
var StringFormatter = require('app/server/utils/StringFormatter');

/**
 * Design for a more readable test case
 *
 * @param second - numebr of seconds
 */
function toMilliseconds(second) {
  return second*1000;
}

describe('To test different format parser', function() {
  var parseDuration = StringFormatter.parseDuration;

  describe('#durationForHuman', function() {

    it('should return 0s if there is no duration', function() {
      expect(parseDuration(0)).to.equal('0s');
    });

    it('should return 0s if the millisecond is less than 1000', function() {
      expect(parseDuration(1)).to.equal('0s');
      expect(parseDuration(500)).to.equal('0s');
      expect(parseDuration(999)).to.equal('0s');

      expect(parseDuration(1000)).to.not.equal('0s');
    });

    it('should return 1s', function() {
      expect(parseDuration(1000)).to.equal('1s');
      expect(parseDuration(1001)).to.equal('1s');
      expect(parseDuration(1999)).to.equal('1s');
      expect(parseDuration(2000)).to.equal('2s');
    });

    it('should return in seconds', function() {
      expect(parseDuration(toMilliseconds(59))).to.equal('59s');

      expect(parseDuration(toMilliseconds(60))).to.not.equal('60s');
      expect(parseDuration(toMilliseconds(61))).to.not.equal('61s');
    });

    it('should return in minutes', function() {
      expect(parseDuration(toMilliseconds(60))).to.equal('1m');
      expect(parseDuration(toMilliseconds(120))).to.equal('2m');

      expect(parseDuration(toMilliseconds(61))).to.not.equal('1m');
      expect(parseDuration(toMilliseconds(6000))).to.not.equal('100m');
    });

    it('should return in minutes with seconds', function() {
      expect(parseDuration(toMilliseconds(61))).to.equal('1m 1s');
      expect(parseDuration(toMilliseconds(62))).to.equal('1m 2s');
      expect(parseDuration(toMilliseconds(121))).to.equal('2m 1s');
      expect(parseDuration(toMilliseconds(122))).to.equal('2m 2s');
      expect(parseDuration(toMilliseconds(600))).to.equal('10m');
      expect(parseDuration(toMilliseconds(601))).to.equal('10m 1s');

      expect(parseDuration(toMilliseconds(3599))).to.not.contain('h');
      expect(parseDuration(toMilliseconds(3601))).to.not.equal('1h');
    });

    it('should return in hours', function() {
      expect(parseDuration(toMilliseconds(3600))).to.equal('1h');
      expect(parseDuration(toMilliseconds(7200))).to.equal('2h');
    });

    it('should return in hours with seconds', function() {
      expect(parseDuration(toMilliseconds(3601))).to.equal('1h 1s');
    });

    it('should return in hours with mintues', function() {
      expect(parseDuration(toMilliseconds(3660))).to.equal('1h 1m');
    });

    it('should return in hours with mintues and/or seconds', function() {
      expect(parseDuration(toMilliseconds(3659))).to.not.contain('m');
      expect(parseDuration(toMilliseconds(3661))).to.equal('1h 1m 1s');
    });

  });

});
