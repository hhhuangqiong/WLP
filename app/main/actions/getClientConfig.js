import nconf from 'nconf';

export default function (context, payload, done) {
  const clientConfig = nconf.get('clientConfig');
  context.dispatch('SET_CLIENT_CONFIG', clientConfig);
  done();
}
