import Q from 'q';
import deleteCompanyLogo from './deleteCompanyLogo';
import updateCompanyLogo from './updateCompanyLogo';

export default function (context, params) {
  const { token, ...profile } = params;
  const { deleteLogo, logoFile, ...restProfile } = profile;

  context.dispatch('UPDATE_COMPANY_PROFILE_START');

  const promiseArray = [Q.ninvoke(context.api, 'updateCompanyProfile', restProfile)];

  if (logoFile) {
    promiseArray.push(context.executeAction(updateCompanyLogo, {
      carrierId: restProfile.carrierId,
      companyId: restProfile.companyId,
      logoFile,
    }));
  } else if (deleteLogo) {
    promiseArray.push(context.executeAction(deleteCompanyLogo, {
      carrierId: restProfile.carrierId,
      companyId: restProfile.companyId,
    }));
  }

  return Q.all(promiseArray).then(() => {
    context.dispatch('UPDATE_COMPANY_PROFILE_SUCCESS', token);
  }).catch(err => {
    context.dispatch('UPDATE_COMPANY_PROFILE_FAILURE', err);
    throw err;
  });
}
