export default function(context, company, done) {
  context.dispatch('UPDATE_COMPANY_SUCCESS', company);
  done();
};
