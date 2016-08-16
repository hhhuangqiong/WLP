import _ from 'lodash';
import Q from 'q';

export default function (context, params, done) {
  const { apiClient } = context;
  context.dispatch('FETCH_CARRIER_MANAGING_COMPANIES');
  apiClient
    .get(`companies/${params.companyId}/managingCompanies`)
    .then(companies => {
      const getRolesPromise = _.map(companies, company => {
        const mCompany = company;
        return apiClient
          .get(`companies/${company.id}/roles`)
          .then(roles => {
            mCompany.roles = [{
                "_id": "5774d238efb2f0535997eeca",
                 "name": "Sales Manager",
                 "service": "iam",
                 "company": "company-1"
             },
             {
                 "_id": "5774d238efb2f0535997eecb",
                 "name": "Sales Director",
                 "service": "wlp",
                 "company": "company-1"
             },
             {
                 "_id": "5774d238efb2f0535997eecc",
                 "name": "Admin",
                 "service": "wlp",
                 "company": "m800"
             }];//roles;
            return mCompany;
          })
          .catch(() => {
            mCompany.roles = [];
            return mCompany;
          });
      });
      return Q.all(getRolesPromise);
    })
    .then(result => {
      context.dispatch('FETCH_CARRIER_MANAGING_COMPANIES_SUCCESS', result);
      done();
    })
    .catch(err => {
      context.dispatch('FETCH_CARRIER_MANAGING_COMPANIES_SUCCESS', err);
      done();
    });
}
