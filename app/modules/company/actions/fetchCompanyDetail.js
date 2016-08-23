export default function (context, params, done) {
  context.dispatch('FETCH_COMPANY_DETAIL_SUCCESS', {
    createdAt: '2016-08-18T08:14:07.589Z',
    updatedAt: '2016-08-18T08:14:07.838Z',
    status: 'IN_PROGRESS',
    profile: {
      companyCode: 'bolter',
      country: 'Hong Kong',
      resellerCarrierId: 'maaii.org',
      serviceType: 'WHITE_LABEL',
      paymentMode: 'POST_PAID',
      carrierId: 'bolter.maaiii.org',
      companyId: '57a950b9cdf9005630e797f8',
      capabilities: [
        'platform.android',
        'platform.ios',
        'call.onnet',
        'call.offnet',
      ],
      companyInfo: {
        name: 'Bolter',
        timezone: 'Etc/GMT+12',
      },
    },
    id: '57b69220121a6a012160c412',
    company: {
      createdAt: '2016-08-02T07:00:44.197Z',
      updatedAt: '2016-08-02T07:12:56.964Z',
      name: 'Bolt',
      country: 'Hong Kong',
      timezone: 'Etc/GMT+12',
      logo: 'http://127.0.0.1:3001/identity/companies/logo/57a047f8281063f8149af643',
      parent: '57a950b9cdf9005630e797fc',
      active: true,
      reseller: false,
      id: '57a950b9cdf9005630e797f8',
    },
  });
}
