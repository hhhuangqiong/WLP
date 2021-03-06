import SolrQueryBuilder from 'solr-query-builder';
import moment from 'moment';
import { ALL_TYPES_EXCEPT_TESTING } from '../constants/call';

const DEFAULT_SORT_ORDER = 'start_time desc';

/**
 * Function to generate solr query for CallRequest
 * For reference on how this function is built see:
 * @see {@link https://github.com/maxcnunes/solr-query-builder}
 *
 * @param params {Object}
 * @param params.caller_carrier {String} carrier ID
 * @param params.from {Number} From time in timestamp
 * @param params.to {Number} To time in timestamp
 * @param params.caller {String} caller ID
 * @param params.callee {String} callee ID
 * @param params.caller_country {String} country alpha2 code
 * @param params.callee_country {String} country alpha2 code
 * @param params.size {Number} size per page
 * @param params.page {Number} page number
 * @param cb {Function}
 */
export function buildCallSolrQueryString(params) {
  const qb = new SolrQueryBuilder();

  qb
    .begin()
    .where('caller_carrier', params.caller_carrier)
    .or()
    .where('callee_carrier', params.caller_carrier)
    .end();

  qb
    .where('start_time')
    .between(
      moment(params.from, 'x').toJSON(),
      moment(params.to, 'x').toJSON()
    );

  if (params.caller) {
    qb.any({
      caller: params.caller,
    }, { contains: true });
  }

  if (params.callee) {
    qb.any({
      callee: params.callee,
    }, { contains: true });
  }

  if (params.type) {
    qb.where('type', params.type);
  } else {
    // WLP-914
    // data with type `TEST_CALL` should not be included
    qb.begin();

    ALL_TYPES_EXCEPT_TESTING.forEach((type, idx) => {
      qb.where('type', type);

      // do not call qb.or() for the last iteration
      if (idx !== ALL_TYPES_EXCEPT_TESTING.length - 1) {
        qb.or();
      }
    });

    qb.end();
  }

  // callee_country was once not working
  // so use source & target_country here
  if (params.caller_country && params.callee_country) {
    qb.where('source_country_tel_code', params.caller_country);
    qb.where('target_country_tel_code', params.callee_country);
  } else {
    if (params.caller_country) {
      qb.where('source_country_tel_code', params.caller_country);
    }

    if (params.callee_country) {
      qb.where('target_country_tel_code', params.callee_country);
    }
  }

  const queryResult = {
    q: qb.build(),
    sort: DEFAULT_SORT_ORDER,
    rows: params.size,
    start: (+params.page * params.size),
  };

  return queryResult;
}
