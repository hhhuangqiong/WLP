import { ArgumentError } from 'common-errors';
import _ from 'lodash';
import nconf from 'nconf';

import { fetchDep } from '../../server/utils/bottle';

const debug = require('debug')('app:actions/getAccessibleCompanies');

export default function getAccessibleCompanies(context, params, done) {
  debug('action start get accessible company');
  const iamHelper = fetchDep(nconf.get('containerName'), 'IamHelper');

  const user = _.get(params, 'req.user');
  const affiliatedCompany = _.get(params, 'req.user.affiliatedCompany');

  // if no user, it will manage no company
  if (!user) {
    context.dispatch('FETCH_MANAGING_COMPANIES_FAILURE', new ArgumentError('user'));
    done();
    return;
  }

  iamHelper.getManagingCompanies(user, affiliatedCompany).then(companies => {
    context.dispatch('FETCH_MANGAING_COMPANIES_SUCCESS', companies);
    done();
  }).catch(err => {
    context.dispatch('FETCH_MANAGING_COMPANIES_FAILURE', err);
    done();
  });
}
