 /* blindly follow the reference project for now*/
 /* should not include sensible information in the configuration*/
module.exports = {
  API_HOST: process.env.API_HOST || 'http://localhost:3000/api',
  DISABLE_ISOMORPHISM: Boolean(process.env.DISABLE_ISOMORPHISM) || false,
  COOKIE: {
    MAX_AGE: 1000 * 60 * 30
  }
};
