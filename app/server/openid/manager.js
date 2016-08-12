import { Issuer } from 'openid-client';

let openidOption;
let loadClientPromise;

export function loadClient(options) {
  openidOption = options;
  loadClientPromise = Issuer.discover(options.issuer)
    .then(mIssuer => {
      const issuer = mIssuer;
      const client = new issuer.Client({
        client_id: options.clientID,
        client_secret: options.clientSecret,
      });
      return {
        issuer,
        client,
      };
    });
  return loadClientPromise;
}

export function getClient() {
  return loadClientPromise;
}

export function getClientOption() {
  return openidOption;
}

export function signOut(req, res) {
  const { tokens } = req.user;
  req.logout();
  // revoke the access token
  getClient().then(({ client, issuer }) =>
    client.revoke(tokens.access_token)
      .then(() => {
        const { postLogoutURL } = getClientOption();
        let url = `${issuer.end_session_endpoint}?id_token_hint=${tokens.id_token}`;
        url = `${url}&post_logout_redirect_uri=${encodeURIComponent(postLogoutURL)}`;
        res.redirect(url);
      })
  );
}

export function getAuthorizationUrl() {
  return getClient().then(({ client }) => {
    const { redirectURL, scope } = getClientOption();
    return client.authorizationUrl({
      redirect_uri: redirectURL,
      scope,
    });
  });
}

export function authorizationCallback(query) {
  return getClient().then(({ client }) =>
    client.authorizationCallback(getClientOption().redirectURL, query));
}

export function getUserInfo(tokens) {
  return getClient().then(({ client }) =>
    client.userinfo(tokens));
}

export function introspect(token) {
  return getClient().then(({ client }) =>
    client.introspect(token));
}
