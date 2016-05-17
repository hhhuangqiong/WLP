import { expect } from 'chai';

import VsfStatsRequest from '../../../../../../app/lib/requests/mvs/VsfStatsRequest';

/* eslint-disable max-len,quotes */
const SUMMARY_STATS_CURRENT_MONTH = `{"from":1456761600000,"to":1462032000000,"results":[{"segment":{"class":"MVSSegment","paymentType":"all","itemType":"all","itemIdentifier":"all","itemCategory":"sticker","platform":"all","socialType":"all","carrier":"all","currency":"all","country":"all"},"data":[{"t":0,"v":195},{"t":1,"v":292},{"t":2,"v":345},{"t":3,"v":350},{"t":4,"v":418},{"t":5,"v":616},{"t":6,"v":459},{"t":7,"v":636},{"t":8,"v":404},{"t":9,"v":373},{"t":10,"v":488},{"t":11,"v":381},{"t":12,"v":373},{"t":13,"v":341},{"t":14,"v":271},{"t":15,"v":210},{"t":16,"v":199},{"t":17,"v":282},{"t":18,"v":272},{"t":19,"v":265},{"t":20,"v":176},{"t":21,"v":194},{"t":22,"v":237},{"t":23,"v":240},{"t":24,"v":236},{"t":25,"v":202},{"t":26,"v":187},{"t":27,"v":198},{"t":28,"v":198},{"t":29,"v":205},{"t":30,"v":169},{"t":31,"v":160},{"t":32,"v":170},{"t":33,"v":224},{"t":34,"v":196},{"t":35,"v":247},{"t":36,"v":323},{"t":37,"v":287},{"t":38,"v":572},{"t":39,"v":496},{"t":40,"v":374},{"t":41,"v":232},{"t":42,"v":108},{"t":43,"v":145},{"t":44,"v":151},{"t":45,"v":170},{"t":46,"v":220},{"t":47,"v":111},{"t":48,"v":143},{"t":49,"v":173},{"t":50,"v":202},{"t":51,"v":207},{"t":52,"v":161},{"t":53,"v":195},{"t":54,"v":197},{"t":55,"v":193},{"t":56,"v":231},{"t":57,"v":135},{"t":58,"v":132},{"t":59,"v":142},{"t":60,"v":131}]},{"segment":{"class":"MVSSegment","paymentType":"all","itemType":"all","itemIdentifier":"all","itemCategory":"animation","platform":"all","socialType":"all","carrier":"all","currency":"all","country":"all"},"data":[{"t":0,"v":53},{"t":1,"v":58},{"t":2,"v":47},{"t":3,"v":45},{"t":4,"v":51},{"t":5,"v":59},{"t":6,"v":53},{"t":7,"v":65},{"t":8,"v":50},{"t":9,"v":45},{"t":10,"v":55},{"t":11,"v":42},{"t":12,"v":67},{"t":13,"v":53},{"t":14,"v":62},{"t":15,"v":34},{"t":16,"v":51},{"t":17,"v":58},{"t":18,"v":46},{"t":19,"v":46},{"t":20,"v":40},{"t":21,"v":34},{"t":22,"v":45},{"t":23,"v":65},{"t":24,"v":42},{"t":25,"v":44},{"t":26,"v":53},{"t":27,"v":41},{"t":28,"v":40},{"t":29,"v":51},{"t":30,"v":38},{"t":31,"v":40},{"t":32,"v":56},{"t":33,"v":54},{"t":34,"v":58},{"t":35,"v":48},{"t":36,"v":51},{"t":37,"v":60},{"t":38,"v":83},{"t":39,"v":50},{"t":40,"v":48},{"t":41,"v":56},{"t":42,"v":36},{"t":43,"v":45},{"t":44,"v":31},{"t":45,"v":41},{"t":46,"v":51},{"t":47,"v":42},{"t":48,"v":38},{"t":49,"v":38},{"t":50,"v":54},{"t":51,"v":78},{"t":52,"v":39},{"t":53,"v":42},{"t":54,"v":54},{"t":55,"v":75},{"t":56,"v":56},{"t":57,"v":45},{"t":58,"v":38},{"t":59,"v":67},{"t":60,"v":38}]},{"segment":{"class":"MVSSegment","paymentType":"all","itemType":"all","itemIdentifier":"all","itemCategory":"credit","platform":"all","socialType":"all","carrier":"all","currency":"all","country":"all"},"data":[{"t":0,"v":19},{"t":1,"v":18},{"t":2,"v":23},{"t":3,"v":19},{"t":4,"v":26},{"t":5,"v":17},{"t":6,"v":23},{"t":7,"v":19},{"t":8,"v":23},{"t":9,"v":13},{"t":10,"v":24},{"t":11,"v":23},{"t":12,"v":15},{"t":13,"v":14},{"t":14,"v":10},{"t":15,"v":18},{"t":16,"v":21},{"t":17,"v":17},{"t":18,"v":19},{"t":19,"v":22},{"t":20,"v":18},{"t":21,"v":27},{"t":22,"v":16},{"t":23,"v":14},{"t":24,"v":20},{"t":25,"v":17},{"t":26,"v":16},{"t":27,"v":17},{"t":28,"v":21},{"t":29,"v":21},{"t":30,"v":11},{"t":31,"v":20},{"t":32,"v":23},{"t":33,"v":19},{"t":34,"v":13},{"t":35,"v":12},{"t":36,"v":18},{"t":37,"v":24},{"t":38,"v":18},{"t":39,"v":25},{"t":40,"v":14},{"t":41,"v":14},{"t":42,"v":12},{"t":43,"v":17},{"t":44,"v":24},{"t":45,"v":19},{"t":46,"v":20},{"t":47,"v":23},{"t":48,"v":15},{"t":49,"v":21},{"t":50,"v":17},{"t":51,"v":22},{"t":52,"v":23},{"t":53,"v":24},{"t":54,"v":21},{"t":55,"v":19},{"t":56,"v":21},{"t":57,"v":14},{"t":58,"v":18},{"t":59,"v":22},{"t":60,"v":18}]},{"segment":{"class":"MVSSegment","paymentType":"all","itemType":"all","itemIdentifier":"all","itemCategory":"voice_sticker","platform":"all","socialType":"all","carrier":"all","currency":"all","country":"all"},"data":[{"t":0,"v":57},{"t":1,"v":51},{"t":2,"v":83},{"t":3,"v":72},{"t":4,"v":89},{"t":5,"v":114},{"t":6,"v":88},{"t":7,"v":97},{"t":8,"v":105},{"t":9,"v":76},{"t":10,"v":102},{"t":11,"v":83},{"t":12,"v":78},{"t":13,"v":55},{"t":14,"v":56},{"t":15,"v":63},{"t":16,"v":48},{"t":17,"v":72},{"t":18,"v":56},{"t":19,"v":63},{"t":20,"v":36},{"t":21,"v":46},{"t":22,"v":62},{"t":23,"v":52},{"t":24,"v":51},{"t":25,"v":52},{"t":26,"v":59},{"t":27,"v":62},{"t":28,"v":60},{"t":29,"v":58},{"t":30,"v":48},{"t":31,"v":35},{"t":32,"v":51},{"t":33,"v":51},{"t":34,"v":54},{"t":35,"v":59},{"t":36,"v":58},{"t":37,"v":67},{"t":38,"v":130},{"t":39,"v":118},{"t":40,"v":79},{"t":41,"v":56},{"t":42,"v":36},{"t":43,"v":47},{"t":44,"v":47},{"t":45,"v":31},{"t":46,"v":66},{"t":47,"v":35},{"t":48,"v":46},{"t":49,"v":50},{"t":50,"v":62},{"t":51,"v":64},{"t":52,"v":64},{"t":53,"v":55},{"t":54,"v":60},{"t":55,"v":60},{"t":56,"v":49},{"t":57,"v":36},{"t":58,"v":50},{"t":59,"v":51},{"t":60,"v":46}]}]}`;
const SUMMARY_STATS_LAST_MONTH = `{"from":1454256000000,"to":1459440000000,"results":[{"segment":{"class":"MVSSegment","paymentType":"all","itemType":"all","itemIdentifier":"all","itemCategory":"sticker","platform":"all","socialType":"all","carrier":"all","currency":"all","country":"all"},"data":[{"t":0,"v":180},{"t":1,"v":193},{"t":2,"v":139},{"t":3,"v":142},{"t":4,"v":262},{"t":5,"v":297},{"t":6,"v":216},{"t":7,"v":176},{"t":8,"v":212},{"t":9,"v":199},{"t":10,"v":245},{"t":11,"v":208},{"t":12,"v":238},{"t":13,"v":228},{"t":14,"v":286},{"t":15,"v":247},{"t":16,"v":210},{"t":17,"v":308},{"t":18,"v":497},{"t":19,"v":682},{"t":20,"v":159},{"t":21,"v":438},{"t":22,"v":375},{"t":23,"v":350},{"t":24,"v":393},{"t":25,"v":283},{"t":26,"v":252},{"t":27,"v":332},{"t":28,"v":241},{"t":29,"v":195},{"t":30,"v":292},{"t":31,"v":345},{"t":32,"v":350},{"t":33,"v":418},{"t":34,"v":616},{"t":35,"v":459},{"t":36,"v":636},{"t":37,"v":404},{"t":38,"v":373},{"t":39,"v":488},{"t":40,"v":381},{"t":41,"v":373},{"t":42,"v":341},{"t":43,"v":271},{"t":44,"v":210},{"t":45,"v":199},{"t":46,"v":282},{"t":47,"v":272},{"t":48,"v":265},{"t":49,"v":176},{"t":50,"v":194},{"t":51,"v":237},{"t":52,"v":240},{"t":53,"v":236},{"t":54,"v":202},{"t":55,"v":187},{"t":56,"v":198},{"t":57,"v":198},{"t":58,"v":205},{"t":59,"v":169}]},{"segment":{"class":"MVSSegment","paymentType":"all","itemType":"all","itemIdentifier":"all","itemCategory":"animation","platform":"all","socialType":"all","carrier":"all","currency":"all","country":"all"},"data":[{"t":0,"v":45},{"t":1,"v":47},{"t":2,"v":30},{"t":3,"v":32},{"t":4,"v":51},{"t":5,"v":60},{"t":6,"v":46},{"t":7,"v":47},{"t":8,"v":48},{"t":9,"v":40},{"t":10,"v":54},{"t":11,"v":41},{"t":12,"v":51},{"t":13,"v":42},{"t":14,"v":55},{"t":15,"v":44},{"t":16,"v":48},{"t":17,"v":52},{"t":18,"v":52},{"t":19,"v":68},{"t":20,"v":59},{"t":21,"v":60},{"t":22,"v":55},{"t":23,"v":57},{"t":24,"v":48},{"t":25,"v":50},{"t":26,"v":61},{"t":27,"v":60},{"t":28,"v":50},{"t":29,"v":53},{"t":30,"v":58},{"t":31,"v":47},{"t":32,"v":45},{"t":33,"v":51},{"t":34,"v":59},{"t":35,"v":53},{"t":36,"v":65},{"t":37,"v":50},{"t":38,"v":45},{"t":39,"v":55},{"t":40,"v":42},{"t":41,"v":67},{"t":42,"v":53},{"t":43,"v":62},{"t":44,"v":34},{"t":45,"v":51},{"t":46,"v":58},{"t":47,"v":46},{"t":48,"v":46},{"t":49,"v":40},{"t":50,"v":34},{"t":51,"v":45},{"t":52,"v":65},{"t":53,"v":42},{"t":54,"v":44},{"t":55,"v":53},{"t":56,"v":41},{"t":57,"v":40},{"t":58,"v":51},{"t":59,"v":38}]},{"segment":{"class":"MVSSegment","paymentType":"all","itemType":"all","itemIdentifier":"all","itemCategory":"credit","platform":"all","socialType":"all","carrier":"all","currency":"all","country":"all"},"data":[{"t":0,"v":25},{"t":1,"v":24},{"t":2,"v":22},{"t":3,"v":14},{"t":4,"v":19},{"t":5,"v":15},{"t":6,"v":17},{"t":7,"v":17},{"t":8,"v":20},{"t":9,"v":15},{"t":10,"v":21},{"t":11,"v":20},{"t":12,"v":26},{"t":13,"v":16},{"t":14,"v":19},{"t":15,"v":15},{"t":16,"v":29},{"t":17,"v":28},{"t":18,"v":31},{"t":19,"v":25},{"t":20,"v":14},{"t":21,"v":17},{"t":22,"v":18},{"t":23,"v":16},{"t":24,"v":16},{"t":25,"v":21},{"t":26,"v":23},{"t":27,"v":24},{"t":28,"v":18},{"t":29,"v":19},{"t":30,"v":18},{"t":31,"v":23},{"t":32,"v":19},{"t":33,"v":26},{"t":34,"v":17},{"t":35,"v":23},{"t":36,"v":19},{"t":37,"v":23},{"t":38,"v":13},{"t":39,"v":24},{"t":40,"v":23},{"t":41,"v":15},{"t":42,"v":14},{"t":43,"v":10},{"t":44,"v":18},{"t":45,"v":21},{"t":46,"v":17},{"t":47,"v":19},{"t":48,"v":22},{"t":49,"v":18},{"t":50,"v":27},{"t":51,"v":16},{"t":52,"v":14},{"t":53,"v":20},{"t":54,"v":17},{"t":55,"v":16},{"t":56,"v":17},{"t":57,"v":21},{"t":58,"v":21},{"t":59,"v":11}]},{"segment":{"class":"MVSSegment","paymentType":"all","itemType":"all","itemIdentifier":"all","itemCategory":"voice_sticker","platform":"all","socialType":"all","carrier":"all","currency":"all","country":"all"},"data":[{"t":0,"v":80},{"t":1,"v":46},{"t":2,"v":47},{"t":3,"v":32},{"t":4,"v":61},{"t":5,"v":67},{"t":6,"v":53},{"t":7,"v":57},{"t":8,"v":58},{"t":9,"v":55},{"t":10,"v":56},{"t":11,"v":62},{"t":12,"v":68},{"t":13,"v":63},{"t":14,"v":61},{"t":15,"v":49},{"t":16,"v":54},{"t":17,"v":63},{"t":18,"v":116},{"t":19,"v":133},{"t":20,"v":60},{"t":21,"v":109},{"t":22,"v":89},{"t":23,"v":81},{"t":24,"v":87},{"t":25,"v":67},{"t":26,"v":58},{"t":27,"v":73},{"t":28,"v":67},{"t":29,"v":57},{"t":30,"v":51},{"t":31,"v":83},{"t":32,"v":72},{"t":33,"v":89},{"t":34,"v":114},{"t":35,"v":88},{"t":36,"v":97},{"t":37,"v":105},{"t":38,"v":76},{"t":39,"v":102},{"t":40,"v":83},{"t":41,"v":78},{"t":42,"v":55},{"t":43,"v":56},{"t":44,"v":63},{"t":45,"v":48},{"t":46,"v":72},{"t":47,"v":56},{"t":48,"v":63},{"t":49,"v":36},{"t":50,"v":46},{"t":51,"v":62},{"t":52,"v":52},{"t":53,"v":51},{"t":54,"v":52},{"t":55,"v":59},{"t":56,"v":62},{"t":57,"v":60},{"t":58,"v":58},{"t":59,"v":48}]}]}`;
/* eslint-enable */

describe('VsfStats', () => {
  it('should display error when argument is missing', () => (
    new VsfStatsRequest()
      .getMonthlyStats()
      .catch(error => {
        expect(error).to.be.an.instanceof(Error);
      })
  ));

  describe('SummaryStats', () => {
    const baseUrl = 'http://example.com';
    const timeout = 15000;
    let vsfStatsRequest;

    beforeEach(() => {
      vsfStatsRequest = new VsfStatsRequest(
        baseUrl,
        timeout
      );
    });

    it('should show correct data structure of parseSummaryStatsResponses', () => {
      const currentMonthBody = JSON.parse(SUMMARY_STATS_CURRENT_MONTH);
      const parsedData = vsfStatsRequest.parseSummaryStatsResponses(currentMonthBody);

      expect(parsedData).to.have.property('sticker', 15840);
      expect(parsedData).to.have.property('credit', 1151);
      expect(parsedData).to.have.property('animation', 3045);
      expect(parsedData).to.have.property('voiceSticker', 3807);
    });

    it('should show correct data structure of parseSummaryStatsResponses', () => {
      const currentMonthBody = JSON.parse(SUMMARY_STATS_CURRENT_MONTH);
      const currentMonthTotal = vsfStatsRequest.parseSummaryStatsResponses(currentMonthBody);

      const lastMonthBody = JSON.parse(SUMMARY_STATS_LAST_MONTH);
      const lastMonthTotal = vsfStatsRequest.parseSummaryStatsResponses(lastMonthBody);

      const parsedData = vsfStatsRequest.compareSummaryStatsData(currentMonthTotal, lastMonthTotal);

      expect(parsedData).to.have.deep.property('sticker.total', 15840);
      expect(parsedData).to.have.deep.property('sticker.change', -1560);
      expect(parsedData).to.have.deep.property('sticker.percent', -9);
      expect(parsedData).to.have.deep.property('sticker.direction', 'down');

      expect(parsedData).to.have.deep.property('credit.total', 1151);
      expect(parsedData).to.have.deep.property('credit.change', -15);
      expect(parsedData).to.have.deep.property('credit.percent', -1);
      expect(parsedData).to.have.deep.property('credit.direction', 'down');

      expect(parsedData).to.have.deep.property('animation.total', 3045);
      expect(parsedData).to.have.deep.property('animation.change', 59);
      expect(parsedData).to.have.deep.property('animation.percent', 2);
      expect(parsedData).to.have.deep.property('animation.direction', 'up');

      expect(parsedData).to.have.deep.property('voiceSticker.total', 3807);
      expect(parsedData).to.have.deep.property('voiceSticker.change', -259);
      expect(parsedData).to.have.deep.property('voiceSticker.percent', -6);
      expect(parsedData).to.have.deep.property('voiceSticker.direction', 'down');
    });
  });
});
