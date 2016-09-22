export default function (context, params, done) {
  const { token, ...profile } = params;
  context.dispatch('UPDATE_CARRIER_PROFILE_START');

  context.api.updateCarrierProfile(profile, err => {
    if (err) {
      context.dispatch('UPDATE_CARRIER_PROFILE_FAILURE', err);
    } else {
      context.dispatch('UPDATE_CARRIER_PROFILE_SUCCESS', token);
    }
    done();
  });
}
