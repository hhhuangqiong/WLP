# Docker

This application is design to be run as a docker container. This section provide the necessary information to for application deployment.

## Docker Image Identifier

```
docker.dev.maaii.com/m800/white-label-portal
```

## Docker Container Environment Variables

|Key|Description|e.g.|
| --- | --- | --- |
|TZ|NodeJs runtime timezone|Asia/Hong_Kong|
|APP_PORT|Port that App is listening inside the docker container|3000|
|`mongodb__uri`|Mongo URI|`mongodb://192.168.119.71,192.168.119.72,192.168.119.73/m800-whitelabel-portal?connectTimeoutMS=300000`|
|`mongodb__options__user`|Mongo access username|wlp-testbed-user|
|`mongodb__options__pass`|Mongo access password|tb-wlp-user|
|`mongodb__options__mongos`|Whether to should mongos, secure connection|false|
|`redisUri`| Connection String in [redisUri](https://github.com/mp911de/lettuce/wiki/Redis-URI-and-connection-details) format | `redis-sentinel://192.168.119.25:26378,192.168.119.26:26379` |
|`bossApi__baseUrl`|BOSS API Endpoint|`http://192.168.135.167:10080`|
|`bossApi__timeout`|BOSS API Timeout|15000|
|`mumsApi__baseUrl`|MUMS API Endpoint|`http://192.168.119.12:8080`|
|`mumsApi__timeout`|MUMS API Timeout|15000|
|`dataProviderApi__baseUrl`|Data Provider API Endpoint|`http://192.168.119.131:9998,http://192.168.119.132:9998`|
|`dataProviderApi__timeout`|Data Provider API Timeout|60000|
|`mvsApi__baseUrl`|Maaii Virtual Store Endpoint|`http://192.168.119.21:9125`|
|`mvsApi__timeout`|Maaii Virtual Store Timeout|15000|
|`logging__winston__meta__instance`|Deploy server/instance name, to use to identify from logstash which container the logs is coming from|testbed-wlp-1|
|`APP_URL`|APP URL which is required, to send along with the login and logout with IAM the exact location to redirect to.|`http://deploy.dev.maaii.com:4002`|
|`iamApi__baseUrl`|iamApi url which is used to access the user and company identity information|`http://deploy.dev.maaii.com:4004`|
|`openid__issuer`|iam Open id issuer which is the address to obtain the endpoint url, it will return a json data|`http://deploy.dev.maaii.com:4004/openid/core/.well-known/openid-configuration`|
|`openid__clientId`|the current client id|wlp|
|`openid__clientSecret`|the current client secret id|`7GnoS1vf5HqM1b8B4ZKDJQA6BvXa38ltUoFFVQ4cloR4GICEuWQk50S60pIVK16b`|
|`mpsApi__baseUrl`|the mps service base url|`http://deploy.dev.maaii.com:4005`|


Note: Keys defined with __ in between words are due to default setup of [nconf](https://github.com/indexzero/nconf), an npm module that we used to organize application configurations.


## Docker Container Exposed Port
|Name|Port|Description|
| --- | --- | --- |
|App Port|3000|WLP NodeJS application port|
|Kue Port|3100|Kue UI & API. UI visualizing kue job (e.g. export job) status and API for kue job monitoring. Not required to externalize, but please map an internal IP for monitoring.|
