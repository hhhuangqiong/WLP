import _ from 'lodash';
import CountryData from 'country-data';
import superagent from 'superagent';

import * as saUtil from '../../utils/superagent';

let debug = require('debug')('app:server/api/verificationSdk');
let genericHandler = _.partial(saUtil.genericHandler, debug);

const BY_SUCCESS_FAIL_30_DAYS = {
  from: 1440201600000,
  to: 1442880000000,
  results: [{
    segment: {
      class: "VerificationEvent",
      application_id: "all",
      carrier: "all",
      country: "all",
      os_version: "all",
      platform: "all",
      success: "true",
      type: "all"
    },
    data: [{"t":0,"v":371},{"t":1,"v":148},{"t":2,"v":161},{"t":3,"v":826},{"t":4,"v":1008},{"t":5,"v":123},{"t":6,"v":251},{"t":7,"v":453},{"t":8,"v":775},{"t":9,"v":825},{"t":10,"v":172},{"t":11,"v":471},{"t":12,"v":517},{"t":13,"v":693},{"t":14,"v":924},{"t":15,"v":853},{"t":16,"v":950},{"t":17,"v":620},{"t":18,"v":540},{"t":19,"v":1059},{"t":20,"v":360},{"t":21,"v":414},{"t":22,"v":709},{"t":23,"v":763},{"t":24,"v":733},{"t":25,"v":1045},{"t":26,"v":1005},{"t":27,"v":139},{"t":28,"v":668},{"t":29,"v":499}]
  }, {
    segment: {
      class: "VerificationEvent",
      application_id: "all",
      carrier: "all",
      country: "all",
      os_version: "all",
      platform: "all",
      success: "false",
      type: "all"
    },
    data: [{"t":0,"v":67},{"t":1,"v":23},{"t":2,"v":37},{"t":3,"v":78},{"t":4,"v":53},{"t":5,"v":81},{"t":6,"v":29},{"t":7,"v":98},{"t":8,"v":52},{"t":9,"v":94},{"t":10,"v":48},{"t":11,"v":62},{"t":12,"v":96},{"t":13,"v":52},{"t":14,"v":50},{"t":15,"v":35},{"t":16,"v":92},{"t":17,"v":8},{"t":18,"v":32},{"t":19,"v":87},{"t":20,"v":15},{"t":21,"v":75},{"t":22,"v":8},{"t":23,"v":82},{"t":24,"v":97},{"t":25,"v":20},{"t":26,"v":93},{"t":27,"v":86},{"t":28,"v":75},{"t":29,"v":77}]
  }]
};

const BY_SUCCESS_FAIL_PAST = {
  from: 1440831600000,
  to: 1442822400000,
  results: [
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "all",
        os_version: "all",
        platform: "all",
        success: "true",
        type: "all"
      },
      data: [{t: 0, v: 8},{t: 1, v: 3},{t: 2, v: 2}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "all",
        os_version: "all",
        platform: "all",
        success: "false",
        type: "all"
      },
      data: [{t: 0, v: 10},{t: 1, v: 22},{t: 2, v: 33}]
    }
  ]
};

const BY_SUCCESS_FAIL = {
  from: 1440831600000,
  to: 1442822400000,
  results: [
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "all",
        os_version: "all",
        platform: "all",
        success: "true",
        type: "all"
      },
      data: [{t: 0, v: 12},{t: 1, v: 23},{t: 2, v: 6}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "all",
        os_version: "all",
        platform: "all",
        success: "false",
        type: "all"
      },
      data: [{t: 0, v: 0},{t: 1, v: 2},{t: 2, v: 1}]
    }
  ]
};

const BY_TYPE = {
  from: 1440831600000,
  to: 1442822400000,
  results: [
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "all",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "SMS"
      },
      data: [{t: 0, v: 12},{t: 1, v: 23},{t: 2, v: 6}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "all",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "MobileOriginated"
      },
      data: [{t: 0, v: 12},{t: 1, v: 0},{t: 2, v: 8}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "all",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "IVR"
      },
      data: [{t: 0, v: 1},{t: 1, v: 23},{t: 2, v: 8}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "all",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "MobileTerminated"
      },
      data: [{t: 0, v: 77},{t: 1, v: 2},{t: 2, v: 6}]
    }
  ]
};

const BY_OS = {
  from: 1440831600000,
  to: 1442822400000,
  results: [
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "all",
        os_version: "all",
        platform: "ios",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 0},{t: 1, v: 2},{t: 2, v: 6}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "all",
        os_version: "all",
        platform: "android",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 0},{t: 1, v: 41},{t: 2, v: 6}]
    }
  ]
};

const BY_COUNTRY = {
  from: 1440831600000,
  to: 1442822400000,
  results: [
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "HK",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 0},{t: 1, v: 43},{t: 2, v: 0},{t: 3, v: 1},{t: 4, v: 0},{t: 5, v: 0},{t: 6, v: 0},{t: 7, v: 7},{t: 8, v: 0}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "SG",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 0},{t: 1, v: 3},{t: 2, v: 0},{t: 3, v: 1},{t: 4, v: 0},{t: 5, v: 0},{t: 6, v: 0},{t: 7, v: 7},{t: 8, v: 0}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "ES",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 0},{t: 1, v: 43},{t: 2, v: 0},{t: 3, v: 99},{t: 4, v: 0},{t: 5, v: 64},{t: 6, v: 58},{t: 7, v: 7},{t: 8, v: 0}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "RU",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 9},{t: 1, v: 43},{t: 2, v: 6},{t: 3, v: 8},{t: 4, v: 9},{t: 5, v: 5},{t: 6, v: 6},{t: 7, v: 7},{t: 8, v: 0}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "VN",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 9},{t: 1, v: 43},{t: 2, v: 6},{t: 3, v: 8},{t: 4, v: 9},{t: 5, v: 5},{t: 6, v: 6},{t: 7, v: 7},{t: 8, v: 0}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "KR",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 9},{t: 1, v: 3},{t: 2, v: 6},{t: 3, v: 8},{t: 4, v: 9},{t: 5, v: 5},{t: 6, v: 6},{t: 7, v: 7},{t: 8, v: 0}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "CH",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 9},{t: 1, v: 5},{t: 2, v: 9},{t: 3, v: 8},{t: 4, v: 9},{t: 5, v: 5},{t: 6, v: 6},{t: 7, v: 7},{t: 8, v: 0}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "BR",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 9},{t: 1, v: 0},{t: 2, v: 1},{t: 3, v: 8},{t: 4, v: 9},{t: 5, v: 5},{t: 6, v: 6},{t: 7, v: 7},{t: 8, v: 0}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "CL",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 9},{t: 1, v: 53},{t: 2, v: 6},{t: 3, v: 8},{t: 4, v: 9},{t: 5, v: 5},{t: 6, v: 6},{t: 7, v: 7},{t: 8, v: 0}]
    },
    {
      segment: {
        class: "VerificationEvent",
        application_id: "all",
        carrier: "all",
        country: "FI",
        os_version: "all",
        platform: "all",
        success: "all",
        type: "all"
      },
      data: [{t: 0, v: 9},{t: 1, v: 143},{t: 2, v: 6},{t: 3, v: 8},{t: 4, v: 9},{t: 5, v: 5},{t: 6, v: 6},{t: 7, v: 7},{t: 8, v: 0}]
    }
  ]
};

function accumulateValues(total, data) {
  total.v = parseInt(total.v) + parseInt(data.v);
  return total;
}

function parseAttemptResponse(response) {
  let result = {
    from: response.from,
    to: response.to,
    totalAttempts: [],
    successAttempts: [],
    successRates: []
  };

  // assuming only 2 results are in a by-success response
  // no `===` to match both string form and boolean form of false
  let successSetIndex = (response.results[0].segment.success == "false" ? 1 : 0);
  let successSet      = response.results[successSetIndex].data;
  let failureSet      = response.results[1 - successSetIndex].data;

  let accumulatedAttempts = 0;
  let accumulatedSuccess  = 0;
  let accumulatedFailure  = 0;
  let averageSuccessRate  = 0;

  // assume the data come in sequence
  for (let i = 0, len = successSet.length; i < len; i++) {
    let success = successSet[i].v;
    let failure = failureSet[i].v;
    let total   = success + failure;

    accumulatedAttempts += total;
    accumulatedSuccess  += success;
    accumulatedFailure  += failure;

    result.totalAttempts.push(total);
    result.successAttempts.push(success);
    result.successRates.push(success / total * 100);
  }

  averageSuccessRate = accumulatedSuccess / accumulatedAttempts * 100;

  _.merge(result, {
    accumulatedAttempts,
    accumulatedSuccess,
    accumulatedFailure,
    averageSuccessRate
  });

  return result;
};

function parseByMethodApiResponse(response) {
  let mapMethodName = (type) => {
    switch (type) {
      case 'MobileTerminated':
        return 'Call-in';
      case 'MobileOriginated':
        return 'Call-out';
      default:
        return type;
    }
  };

  let result = {
    from: response.from,
    to: response.to
  };

  let total = 0;

  let dataArray = response.results.map(function (stat) {
    let sum = stat.data.reduce(function (acc, timeslot) {
      return acc + timeslot.v;
    }, 0);

    total += sum;

    return {
      name: mapMethodName(stat.segment.type),
      value: sum
    };
  });

  result.data = dataArray;

  return result;
};

function parseByOsApiResponse(response) {
  let mapOsName = (platform) => {
    switch (platform) {
      case 'ios': return 'IOS';
      default: return _.capitalize(platform);
    }
  };

  let result = {
    from: response.from,
    to: response.to
  };

  let total = 0;

  let dataArray = response.results.map(function (stat) {
    let sum = stat.data.reduce(function (acc, timeslot) {
      return acc + timeslot.v;
    }, 0);

    total += sum;

    return {
      name: mapOsName(stat.segment.platform),
      value: sum
    };
  });

  result.data = dataArray;

  return result;
};

function parseCountiesAttempts(response) {
  let countries = _.indexBy(response.results, (result) => result.segment.country);

  let countriesWithValues = _.reduce(countries, (result, country, name) => {
    let accumulatedValues = _.reduce(country.data, (total, data) => {
      total.v = parseInt(total.v) + parseInt(data.v);
      return total;
    });

    result[name] = {};
    result[name].code = name;
    result[name].value = accumulatedValues.v;
    result[name].name = CountryData.countries[name].name;

    return result;
  }, {});

  return _.values(countriesWithValues);
}

export default function(apiPrefix = '') {
  return {
    getVerificationAttempts(params, cb) {
      let result = parseAttemptResponse(BY_SUCCESS_FAIL_30_DAYS);
      cb(null, result);
    },

    // TODO: Will be merged to getVerificationAttempts
    getVerificationPastAttempts(params, cb) {
      let result = parseAttemptResponse(BY_SUCCESS_FAIL_PAST);

      cb(null, {
        pastAccumulatedAttempts: result.accumulatedAttempts,
        pastAccumulatedFailure: result.accumulatedFailure,
        pastAccumulatedSuccess: result.accumulatedSuccess,
        pastAverageSuccessRate: result.averageSuccessRate
      });
    },

    getVerificationByCountry(params, cb) {
      cb(null, parseCountiesAttempts(BY_COUNTRY));
    },

    getVerificaitonByMethod(params, cb) {
      cb(null, parseByMethodApiResponse(BY_TYPE));
    },

    getVerificationByOsType(params, cb) {
      cb(null, parseByOsApiResponse(BY_OS));
    }
  }
}
