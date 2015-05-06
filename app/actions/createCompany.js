export default function(context, company, done) {
  context.dispatch('CREATE_COMPANY_SUCCESS', company);
  done();
};
