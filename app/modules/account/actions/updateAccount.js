import fetchAccounts from './fetchAccounts';

export default function (context, params, done) {
  context.api.updateAccount(params, (err, { error, result }) => {
    if (err) {
      context.dispatch('UPDATE_ACCOUNT_FAILURE', err);
      context.dispatch('ERROR_MESSAGE', err);
      return;
    }

    if (error) {
      context.dispatch('UPDATE_ACCOUNT_FAILURE', error);
      context.dispatch('ERROR_MESSAGE', error);
      return;
    }
    context.dispatch('INFO_MESSAGE', { message: 'Successfully update user' });
    context.executeAction(fetchAccounts, { affiliatedCompany: params.companyId })
     .then(() => {
       context.dispatch('UPDATE_ACCOUNT_SUCCESS', result);
       done();
     });
  });
}
