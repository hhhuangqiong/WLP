import { expect } from 'chai';

import VsfStatsRequest from 'app/lib/requests/mvs/VsfStatsRequest';

describe('VsfStats', () => {
  const baseUrl = 'http://192.168.56.127:9998';
  const timeout = 15000;
  let vsfStatsRequest;

  beforeEach(() => {
    vsfStatsRequest = new VsfStatsRequest(
      baseUrl,
      timeout
    );
  });

  it('should display error when argument is missing', () => (
    new VsfStatsRequest()
      .getMonthlyStats()
      .catch(error => {
        expect(error).to.be.an.instanceof(Error);
      })
  ));

  it.skip('should display summary data correctly', () => {
    const from = 1456761600000;
    const to = 1462032000000;
    const timescale = 'day';
    const breakdown = 'itemCategory';

    return vsfStatsRequest
      .getSummaryStats({ breakdown, from, to, timescale })
      .then(stats => {
        expect(stats).to.have.property('sticker');
        expect(stats).to.have.property('credit');
        expect(stats).to.have.property('animation');
        expect(stats).to.have.property('voiceSticker');
      });
  });

  it.skip('should display monthly data correctly', () => {
    const from = 1456761600000;
    const to = 1462032000000;
    const timescale = 'day';

    return vsfStatsRequest
      .getMonthlyStats({ from, to, timescale })
      .then(stats => {
        expect(stats).to.have.property('total');
      });
  });
});
