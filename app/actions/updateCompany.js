export function updateProfile(context, company, done) {
  context.dispatch('UPDATE_COMPANY_PROFILE_SUCCESS', company);
  done();
};

export function updateServices(context, payload, done) {
  context.dispatch('UPDATE_COMPANY_SERVICES_SUCCESS', payload);
  done();
};

export function updateWidgets(context, company, done) {
  context.dispatch('UPDATE_COMPANY_WIDGETS_SUCCESS', company);
  done();
};
