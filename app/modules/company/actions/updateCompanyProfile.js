import _ from 'lodash';
import deleteCompanyLogo from './deleteCompanyLogo';
import updateCompanyLogo from './updateCompanyLogo';

export default async function (context, params) {
  const { token, ...profile } = params;
  const { deleteLogo, logoFile, ...restProfile } = profile;

  context.dispatch('UPDATE_COMPANY_PROFILE_START');

  const promiseArray = [context.apiClient.put(
    `/carriers/${restProfile.carrierId}/company/${restProfile.companyId}/profile`,
    { data: _.omit(restProfile, ['carrierId', 'companyId']) }),
  ];

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

  return await Promise.all(promiseArray).then(() => {
    context.dispatch('UPDATE_COMPANY_PROFILE_SUCCESS', { token });
  }).catch(err => {
    context.dispatch('UPDATE_COMPANY_PROFILE_FAILURE', err);
    throw err;
  });
}
