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
      'wlp:endUser': ['create', 'update', 'read', 'delete'],
      'wlp:generalOverview': ['read'],
      'wlp:topUp': ['read'],
      'wlp:vsf': ['read'],
      'wlp:call': ['read'],
      'wlp:im': ['read'],
      'wlp:sms': ['read'],
      'wlp:verification-sdk': ['read'],
      'wlp:general': ['read'],
    },
  };
}
