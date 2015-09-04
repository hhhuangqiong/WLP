import _ from 'lodash';
import moment from 'moment';

import config from '../../../config';
import mockData from '../mockVerifications';

var debug = require('debug')('app:verification/actions/fetchVerifications');

let { inputDateFormat: DATE_FORMAT } = require('./../../../main/config');

export default function (context, params, done) {
  context.dispatch('FETCH_VERIFICATION_START');

  const PAGE_SIZE = params.pageSize || config.PAGES.VERIFICATIONS.PAGE_SIZE;
  let appId = params.appId;
  let startIndex = params.page * PAGE_SIZE;
  let data = mockData[appId] || [];

  let filteredData = _.filter(data, function (item) {
    // mock data dependent date format
    return moment(item.time, 'YYYY-MM-DD HH:mm:ss').isBetween(moment(params.startDate, DATE_FORMAT), moment(params.endDate, DATE_FORMAT));
  });

  let pageData = filteredData.slice(startIndex, startIndex + PAGE_SIZE);

  // timeout to simulate RTT
  setTimeout(function () {
    context.dispatch('FETCH_VERIFICATION_SUCCESS', {
      items: pageData,
      count: filteredData.length,
      page: params.page,
      pageSize: PAGE_SIZE
    });
    done();
  }, 600);
};
