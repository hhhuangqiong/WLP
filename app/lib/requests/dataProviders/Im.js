var logger  = require('winston');
var nconf   = require('nconf');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');
var _       = require('lodash');
var qs      = require('qs');

import {buildImSolrQueryString} from '../queryBuilder/im';
import {constructOpts, formatDateString, swapDate, composeSolrResponse, handleError} from '../helper';

const LABEL_FOR_NULL = 'N/A';

export default class ImRequest {

  constructor(baseUrl, timeout) {
    let opts = {
      type: 'dataProviderApi',
      baseUrl: baseUrl,
      timeout: timeout,
      methods: {
        IMS: {
          URL: '/api/v1/im/tdr/query',
          METHOD: 'GET'
        },
        IMSOLR: {
          URL: '/api/v1/im/tdr/rawQuery',
          METHOD: 'GET'
        }
      }
    };

    this.opts = constructOpts(opts);
  }

  /**
   * @method formatQueryData Format and Normalize query string for IM request
   * it handles only communications within a carrier
   *
   * @param params {Object} Query data received from a request
   * @param params.from {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @param params.to {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @param params.page {Int} page number
   * @param params.size {Int} total of entities in one page
   * @param params.message_type {String} message type
   * @param params.sender {String} The sender name/JID
   * @param params.recipient {String} The recipient name/JID
   * @param cb {Function} Q callback
   */
  formatQueryData(params, cb) {
    Q.nfcall(swapDate, params)
      .then((params) => {
        var format = nconf.get(util.format('%s:format:timestamp', this.opts.type)) || 'x';
        return formatDateString(params, format);
      })
      .then(normalizeData)
      .fail((err) => {
        return cb(handleError(err, 500), null);
      })
      .done((params) => {
        return cb(null, params);
      });

    function normalizeData(params) {
      var query = {};

      query.carrier     = params.carrier;
      query.from        = params.from;
      query.to          = params.to;
      query.page        = params.page || 0;
      query.size        = params.size || 20;

      query.origin      = params.origin;
      query.destination = params.destination;

      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      if (params.message_type)
        query.message_type = params.message_type;

      if (params.sender)
        query.sender = params.sender;

      if (params.recipient)
        query.recipient = params.recipient;

      return query;
    }
  }

  /**
   * @method sendRequest Send request with SuperAgent
   *
   * @param params {Object} Formatted query object
   * @param [loadBalanceIndex=0] {Number} the load balancing index which serves
   * as the index of the api endpoints array
   * @param cb {Function} Callback function from @method getImStat
   */
  sendRequest(params, loadBalanceIndex = 0, cb) {
    if (!cb && _.isFunction(loadBalanceIndex)) {
      cb = loadBalanceIndex;
      loadBalanceIndex = 0;
    }

    let baseUrl = this.opts.baseUrl;
    let baseUrlArray = baseUrl.split(',');

    if (baseUrlArray.length > 1) {
      let index = loadBalanceIndex % baseUrlArray.length;
      baseUrl = baseUrlArray[index];
    } else {
      baseUrl = _.first(baseUrlArray);
    }

    let url = util.format('%s%s', baseUrl, params.q ? this.opts.methods.IMSOLR.URL : this.opts.methods.IMS.URL);

    logger.debug(`IM request: ${url}?${qs.stringify(params)}`);

    request
      .get(url)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) return cb(handleError(err, err.status || 400));
        try {
          return this.filterData(res.body, params.rows, cb);
        } catch (error) {
          return cb(handleError(error, 500));
        }
      });
  }

  /**
   * @method filterData
   * this is to filter all unknown records from result while
   * it is claimed that only happen on testbed applications
   *
   * @param res {Object} result return from API request
   * @param cb {Function} Callback function from @method getImStat
   */
  filterData(data, pageSize, cb) {
    if (data && data.content) {
      /**
        To assign a nice looking label instead of showing 'undefined' or null
       */
      _.forEach(data.content, (im) => {
        im.destination = im.destination || LABEL_FOR_NULL;
        im.sender = im.sender || LABEL_FOR_NULL;

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        im.message_type = !im.message_type || im.message_type === 'undefined' ? LABEL_FOR_NULL : im.message_type;
      });
    }

    return cb(null, composeSolrResponse(data, pageSize));
  }

  /**
   * @method getImStat
   *
   * @param params {Object} Raw query data object
   * @param cb {Function} Callback function from API controller
   */
  getImStat(params, cb) {
    logger.debug('get im message statistic from BOSS with params', params);
    Q.ninvoke(this, 'formatQueryData', params)
      .then((params) => {
        this.sendRequest(params, cb);
      })
      .catch((err) => {
        return cb(handleError(err, err.status || 500));
      });
  }

  /**
   * @method getImSolr
   * @param params {Object} Raw query data object
   * @param cb {Function} Callback function from API controller
   */
  getImSolr(params, cb) {
    logger.debug('get IM message history from dataProvider with params', params);
    Q.nfcall(buildImSolrQueryString, params)
      .then((params) => {
        this.sendRequest(params, cb);
      })
      .catch((err) => {
        return cb(handleError(err, err.status || 500));
      }).done();
  }
}
