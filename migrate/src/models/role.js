export function formatNewRole(company) {
  // default company which can't create anythings
  return {
    company: company._id,
    name: 'Admin',
    service: 'wlp',
    permissions: {
      // no parent mean root which is possible to create company
      company: !company.parent ? ['create', 'update', 'read', 'delete'] : [],
      user: ['create', 'update', 'read', 'delete'],
      role: ['create', 'update', 'read', 'delete'],
      endUser: ['update', 'read'],
      generalOverview: ['read'],
      topUp: ['read'],
      vsf: ['read'],
      call: ['read'],
      im: ['read'],
      sms: ['read'],
      verificationSdk: ['read'],
      whitelist: ['create', 'update', 'read', 'delete'],
      endUserExport: ['read'],
      imExport: ['read'],
      callExport: ['read'],
    },
    // create the root role that IAM will make it read only
    isRoot: true,
  };
}
