// *not* used, maybe in some ways covered by react-router
export default function(context, payload, done) {
  context.dispatch('CHANGE_ROUTE', payload);
  done();
};

