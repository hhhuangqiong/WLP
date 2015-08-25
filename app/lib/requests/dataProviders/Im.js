var logger  = require('winston');
var nconf   = require('nconf');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');
var _       = require('lodash');

import BaseRequest from '../Base';

export default class ImRequest extends BaseRequest {

  constructor(baseUrl, timeout) {
    let opts = {
      type: 'dataProviderApi',
      baseUrl: baseUrl,
      timeout: timeout,
      methods: {
        IMS: {
          URL: '/api/v1/im/tdr/query',
          METHOD: 'GET'
        }
      }
    };

    super(opts);
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
    Q.ninvoke(this, 'swapDate', params)
      .then((params) => {
        var format = nconf.get(util.format('%s:format:timestamp', this.opts.type)) || 'x';
        return this.formatDateString(params, format)
      })
      .then(normalizeData)
      .fail((err) => {
        return cb(this.handleError(err, 500), null);
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
   * @param cb {Function} Callback function from @method getImStat
   */
  sendRequest(params, cb) {
    var base = this.opts.baseUrl;
    var url = this.opts.methods.IMS.URL;

    request
      .get(util.format('%s%s', base, url))
      .query(_.omit(params, 'carrierId'))
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) return cb(this.handleError(err, err.status || 400));
        return this.filterData(res.body, cb);
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
  filterData(data, cb) {
    if (data && data.content) {
      data.content = _.filter(data.content, (im) => {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        return (im.sender !== null && im.message_type !== 'undefined')
      });
    }

    return cb(null, this.composeResponse(data));
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
        return cb(this.handleError(err, err.status || 500));
      });
  }
}
