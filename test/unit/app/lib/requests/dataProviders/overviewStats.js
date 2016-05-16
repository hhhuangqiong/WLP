import moment from 'moment';
import { expect } from 'chai';

import OverviewStatsRequest from '../../../../../../app/lib/requests/dataProviders/OverviewStats';

/* eslint-disable max-len,quotes */
const COUNTRY_RESPONSE_BODY = `{"from":1463241600000,"to":1463414400000,"results":[{"segment":{"class":"UserStats","carrier":"all","country":"ky","platform":"all","status":"all"},"data":[{"t":0,"v":1},{"t":1,"v":1}]},{"segment":{"class":"UserStats","carrier":"all","country":"id","platform":"all","status":"all"},"data":[{"t":0,"v":38915},{"t":1,"v":38987}]},{"segment":{"class":"UserStats","carrier":"all","country":"pf","platform":"all","status":"all"},"data":[{"t":0,"v":2},{"t":1,"v":2}]}]}`;
const ACCUMULATED_RESPONSE_BODY = `{"from":1463241600000,"to":1463414400000,"results":[{"segment":{"class":"UserStats","carrier":"all","country":"all","platform":"android","status":"all"},"data":[{"t":0,"v":35421},{"t":1,"v":35477}]},{"segment":{"class":"UserStats","carrier":"all","country":"all","platform":"ios","status":"all"},"data":[{"t":0,"v":3497},{"t":1,"v":3513}]}]}`;
const VERIFIED_RESPONSE_BODY = `{"from":1463414400000,"to":1463414400000,"results":{"android":[{"timestamp":1463414400000,"value":35563}],"ios":[{"timestamp":1463414400000,"value":3536}]}}`;
/* eslint-enable */

describe('OverviewStats', () => {
  const baseUrl = 'http://example.com';
  const timeout = 150000;

  const from = moment().subtract(1, 'day').format('x');
  const to = moment().format('x');
  const timescale = 'day';
  const carriers = 'bolter.maaii.com';

  let overviewStatsRequest;

  describe('Detail Stats', () => {
    beforeEach(() => {
      overviewStatsRequest = new OverviewStatsRequest(
        baseUrl,
        timeout
      );
    });

    it('should display error response for missing argument "from"', () => (
      overviewStatsRequest
        .getDetailStats({ to, timescale, carriers })
        .catch(error => {
          expect(error.message)
            .to
            .equal('child "from" fails because ["from" is required]');
        })
    ));

    it('should display error response for missing argument "to"', () => (
      overviewStatsRequest
        .getDetailStats({ from, timescale, carriers })
        .catch(error => {
          expect(error.message)
            .to
            .equal('child "to" fails because ["to" is required]');
        })
    ));

    it('should display error response for missing argument "timescale"', () => (
      overviewStatsRequest
        .getDetailStats({ to, from, carriers })
        .catch(error => {
          expect(error.message)
            .to
            .equal('child "timescale" fails because ["timescale" is required]');
        })
    ));

    it('should display error response for missing argument "carriers"', () => (
      overviewStatsRequest
        .getDetailStats({ to, timescale, from })
        .catch(error => {
          expect(error.message)
            .to
            .equal('child "carriers" fails because ["carriers" is required]');
        })
    ));

    it('should show correct data structure of parseCountryDataResponse', () => {
      const body = JSON.parse(COUNTRY_RESPONSE_BODY);
      const parsedData = overviewStatsRequest.parseCountryDataResponse(body);

      expect(parsedData).to.have.property('ky', 1);
      expect(parsedData).to.have.property('id', 38987);
      expect(parsedData).to.have.property('pf', 2);
    });
  });

  describe('Summary Stats', () => {
    const breakdown = 'platform';

    beforeEach(() => {
      overviewStatsRequest = new OverviewStatsRequest(
        baseUrl,
        timeout
      );
    });

    it('should display error response for missing argument "from"', () => (
      overviewStatsRequest
        .getSummaryStats({ breakdown, to, timescale, carriers })
        .catch(error => {
          expect(error.message)
            .to
            .equal('child "from" fails because ["from" is required]');
        })
    ));

    it('should display error response for missing argument "to"', () => (
      overviewStatsRequest
        .getSummaryStats({ breakdown, from, timescale, carriers })
        .catch(error => {
          expect(error.message)
            .to
            .equal('child "to" fails because ["to" is required]');
        })
    ));

    it('should display error response for missing argument "breakdown"', () => (
      overviewStatsRequest
        .getSummaryStats({ from, to, timescale, carriers })
        .catch(error => {
          expect(error.message)
            .to
            .equal('child "breakdown" fails because ["breakdown" is required]');
        })
    ));

    it('should display error response for missing argument "timescale"', () => (
      overviewStatsRequest
        .getSummaryStats({ breakdown, to, from, carriers })
        .catch(error => {
          expect(error.message)
            .to
            .equal('child "timescale" fails because ["timescale" is required]');
        })
    ));

    it('should display error response for missing argument "carriers"', () => (
      overviewStatsRequest
        .getSummaryStats({ breakdown, to, timescale, from })
        .catch(error => {
          expect(error.message)
            .to
            .equal('child "carriers" fails because ["carriers" is required]');
        })
    ));

    it('should show correct data structure of parseAccumulatedSummaryResponse', () => {
      const body = JSON.parse(ACCUMULATED_RESPONSE_BODY);
      const parsedData = overviewStatsRequest.parseAccumulatedSummaryResponse(body);

      expect(parsedData).to.have.property('android', 35477);
      expect(parsedData).to.have.property('ios', 3513);
    });

    it('should show correct data structure of parseVerifiedSummaryResponse', () => {
      const body = JSON.parse(VERIFIED_RESPONSE_BODY);
      const parsedData = overviewStatsRequest.parseVerifiedSummaryResponse(body);

      expect(parsedData).to.have.property('android', 35563);
      expect(parsedData).to.have.property('ios', 3536);
    });
  });
});
