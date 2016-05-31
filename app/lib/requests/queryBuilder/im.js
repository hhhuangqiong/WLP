import SolrQueryBuilder from 'solr-query-builder';
import _ from 'lodash';

const DEFAULT_SORT_ORDER = 'timestamp desc';

export function /**
 * Function to generate solr query for ImRequest
 * For reference on how this function is built see:
 * @see {@link https://github.com/maxcnunes/solr-query-builder}
 */
buildImSolrQueryString(params, cb) {
  const qb = new SolrQueryBuilder();

  qb.where('carrier', params.carrier);
  qb.where('timestamp').between(params.from, params.to);
  qb.where('type', 'IncomingMessage');

  if (_.isArray(params.message_type)) {
    qb.where('message_type').in(params.message_type);
  } else if (_.isString(params.message_type)) {
    qb.where('message_type', params.message_type);
  }

  if (params.origin) {
    qb.where('origination', params.origin);
  }

  if (params.destination) {
    qb.where('destination', params.destination);
  }

  if (params.sender) {
    qb.any({
      sender: params.sender,
    }, { contains: true });
  }

  if (params.recipient) {
    qb
      .begin()
      .any({
        recipient: params.recipient,
      }, { contains: true })
      .or()
      .any({
        recipients: params.recipient,
      }, { contains: true })
      .end();
  }

  const queryResult = {
    q: qb.build(),
    sort: DEFAULT_SORT_ORDER,
    rows: params.size,
    start: (+params.page * params.size),
  };

  cb(null, queryResult);
}
