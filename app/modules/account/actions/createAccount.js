import _ from 'lodash';
import fetchAccounts from './fetchAccounts';
export default function (context, params, done) {
  context.api.createAccount(_.omit(params, 'companyId'), (err, profile) => {
    if (err) {
      context.dispatch('CREATE_ACCOUNT_FAILURE', err);
      context.dispatch('ERROR_MESSAGE', err);
      return;
    }

    context.dispatch('CREATE_ACCOUNT_SUCCESS', profile);
    context.executeAction(fetchAccounts, { affiliatedCompany: params.companyId })
      .then(() => {
        context.dispatch('INFO_MESSAGE', { message: 'Create account success!' });
        done();
      });
  });
}
