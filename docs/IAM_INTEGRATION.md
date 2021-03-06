# IAM Integration

Identity Access Management will provide identity management, permission management and openID (Single Sign On).

For identity management and permission management is to mention the
variables mentioned(`iamApi__baseUrl`, `APP_URL`) in the docker section.

This section will focus on the openID (Single Sign On).

## OPEN CONNECT ID

Open Connect ID is a (Single Sign On) SSO solution and identity layer to allow client verify the end user identity based on based on the authentication performed by an Authorization Server.

White Label will become a client to make use of this service.

When launch the WLP, it will redirect the user to IAM Open ID Login page.
It will request user to enter the password. If it is correct, it will redirect the user back to the WLP.

# Get started / Steps

## [IAM] 1. Register the WLP as a new Client on IAM

In the following steps, there are two ip will be used.  

`{$ip}` - the ip address of the WLP application (e.g `http://deploy.dev.maaii.com:4002`)  
`{$externalIamEndpoint}` - the IAM public domain which is public to outside (e.g `https://iam-tb.m800.com`)
`{$internalIamEndpoint}` - the IAM internal IP which is internal address (e.g `http://192.168.119.66:3020`)

Please refer to the IAM documentation about [OPEN ID Connect (Add a new Client)](http://deploy.dev.maaii.com:9080/maaii-identity-access-mgmt/).

The following one is the setting for WLP.

|Key|Description|values|examples|
| --- | --- | --- |
|`client_secret`|the client secret is a secret token to indicate the client *|(Generate one)|`u77rWchPSnoXXkuhr4cIUSivE+UWsuMZgAUlAD5VvscF5t6wPfkA3M9j6Q/llSZh`|
|`grant_types`|the grant type|`authorization_code`|
|`redirect_uris`|the redirect url|`http://{$ip}/callback`| `http://deploy.dev.maaii.com:4002/callback`|
|`post_logout_redirect_uris`|the redirect url after logout|`http://{$ip}`|`http://deploy.dev.maaii.com:4002`|
|`token_endpoint_auth_method`|the token authentication method|`client_secret_basic`/ `client_secret_jwt`|
|`token_endpoint_auth_signing_alg`|the signing algorithms used when applied `client_secret_jwt`, no need when using `client_secret_basic` |`HS512`|

we will apply the wlp as client_id and here is the sample
```
openid__clients__wlp__client_secret=9GnoS1vf5HqM1b8B4ZKDJQA6BvXa35ltUoFFVQ4cloR4GICEuWQk50S60pIVK06b
openid__clients__wlp__grant_types=authorization_code
openid__clients__wlp__redirect_uris=http://deploy.dev.maaii.com:4002/callback
openid__clients__wlp__post_logout_redirect_uris=http://deploy.dev.maaii.com:4002
openid__clients__wlp__token_endpoint_auth_method=client_secret_basic
```


## [WLP] 2. Use as client on WLP
After registered on the IAM, apply the configuration on the WLP.  

Here are the docker env setting related.  
- `APP_URL`  
the WLP APP URL which is required,  
To send along with the login and logout with IAM the exact location to redirect to.(`{$ip}` e.g`http://deploy.dev.maaii.com:4002`) which is used to construct the redirect_uris, and post_logout_redirect_uris.

- `openid__issuer`  
iam Open id issuer which is the address to issue the openid
(`${externalIamEndpoint}/openid/core`  e.g.`https://iam-tb.m800.com/openid/core`)

- `openid__clientId`  
the client id that registered above (e.g `wlp`)

- `openid__clientSecret`
the clientSecret registered above (e.g `7GnoS1vf5HqM1b8B4ZKDJQA6BvXa38ltUoFFVQ4cloR4GICEuWQk50S60pIVK16b`)

- `openid__token_endpoint_auth_method`
the authentication method used above (e.g `client_secret_basic`)

- `openid__token_endpoint_auth_signing_alg`
the signing algorithms when applied on `client_secret_jwt`, no need to set using `client_secret_basic` (e.g `HS512`)

The following 7 end points are configuration for IAM OpenID

- `openid__authorization_endpoint`
OpenId Client authorization end point which redirect login  
(`${externalIamEndpoint}/openid/core/auth` e.g`https://iam-tb.m800.com/openid/core/auth`)

- `openid__end_session_endpoint`
OpenId Client session end point which end session
(`${externalIamEndpoint}/openid/core/session/end` e.g `https://iam-tb.m800.com/openid/core/session/end`)

- `openid__token_endpoint`
OpenId Client token end point which obtain access token  
(`${internalIamEndpoint}/openid/core/token` e.g`http://192.168.119.66:3020/openid/core/token`)

- `openid__token_introspection_endpoint`
OpenId Client introspect end point which introspect token  
(`${internalIamEndpoint}/openid/core/token/introspection` e.g`http://192.168.119.66:3020/openid/core/token/introspection`)

- `openid__userinfo_endpoint`
OpenId Client user info end point
(`${internalIamEndpoint}/openid/core/me` e.g `http://192.168.119.66:3020/openid/core/me`)

- `openid__jwks_uri`
OpenId Client certificate end point
(`${internalIamEndpoint}/openid/core/certs}` e.g`http://192.168.119.66:3020/openid/core/certs`)

- `openid__token_revocation_endpoint`
OpenId Client revocation end point
(`${internalIamEndpoint}/openid/core/token/revocation` e.g `http://192.168.119.66:3020/openid/core/token/revocation`)

Please aware there are 7 endpoints, two of them (`openid__authorization_endpoint`, `openid__end_session_endpoint`) are based on the externalIamEndpoint which will be redirected to by browser. The remaining are used by the WLP server side internally

## Reference
[Open Connect ID Standard](http://openid.net/connect/)  
[Node Provider used in IAM](https://github.com/panva/node-oidc-provider)  
[NODE OPENID Client applied in WLP](https://github.com/panva/node-openid-client)  
[IAM Doc](http://deploy.dev.maaii.com:9080/maaii-identity-access-mgmt/)  
[IAM Design Guide](https://issuetracking.maaii.com:9443/display/WLP/Identity+Access+Management%28IAM%29+Service)
