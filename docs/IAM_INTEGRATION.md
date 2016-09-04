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
To add a new client on IAM, developer need to insert a client with the following parameters on the IAM Docker environment variable.

Here is the sample  
 - client_id - the id of client
 - client_secret - the client secret which need to use to verify the client when sending authorization request. You can generate this client secret by [nodejs crypto](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback) to generate via
  `crypto.randomBytes(48).toString('base64')` (go to node env by typing node)
  ```
  M800-L-0063:m800-white-label-portal user$ node
> crypto.randomBytes(48).toString('base64')
'u77rWchPSnoXXkuhr4cIUSivE+UWsuMZgAUlAD5VvscF5t6wPfkA3M9j6Q/llSZh'
  ```
 - grant_types - the grant type, in wlp, it will be `["authorization_code"]`
 - redirect_uris - the redirect_uris which read read the authorization code in the authorization request. (In wlp, it will be WLP ip `http://deploy.dev.maaii.com:4002`/callback)
 - post_logout_redirect_uris - the redirect url to after logout the IAM session. (In wlp, it will be the root ip of WLP `http://deploy.dev.maaii.com:4002`)
```
"openid":{
  "clients": {
    "wlp": {
      "client_id": "wlp",
      "client_secret": "9GnoS1vf5HqM1b8B4ZKDJQA6BvXa35ltUoFFVQ4cloR4GICEuWQk50S60pIVK06b",
      "grant_types": ["authorization_code"],
      "redirect_uris": ["http://deploy.dev.maaii.com:4002/callback"],
      "post_logout_redirect_uris": ["http://deploy.dev.maaii.com:4002"]
   }
 }
},
```

You can also set in the env variable under the openid__clients object.
```
export openid__clients__wlp__client_id=wlp
export openid__clients__wlp__client_secret=9GnoS1vf5HqM1b8B4ZKDJQA6BvXa35ltUoFFVQ4cloR4GICEuWQk50S60pIVK06b
export openid__clients__wlp__grant_types=authorization_code
export openid__clients__wlp__redirect_uris=http://deploy.dev.maaii.com:4002/callback
export openid__clients__wlp__post_logout_redirect_uris=http://deploy.dev.maaii.com:4002
```
## [WLP] 2. Use as client on WLP

Since we have registered a client on IAM, we can apply the config and make use of those information.
In the docker env setting, there are several fields related.

- `APP_URL`  
the WLP APP URL which is required, to send along with the login and logout with IAM the exact location to redirect to.(e.g`http://deploy.dev.maaii.com:4002`) which is used to construct the redirect_uris, and post_logout_redirect_uris.

- `openid__issuer`  
iam Open id issuer which is the address to obtain the endpoint url, it will return a json data (e.g.`http://deploy.dev.maaii.com:4004/openid/core/.well-known/openid-configuration`)

- `openid__clientId`  
the client id that registered above (e.g `wlp`)

- `openid__clientSecret`
the clientSecret registered above (e.g `7GnoS1vf5HqM1b8B4ZKDJQA6BvXa38ltUoFFVQ4cloR4GICEuWQk50S60pIVK16b`)
