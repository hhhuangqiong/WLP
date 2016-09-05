# Docker

This application is design to be run as a docker container. This section provide the necessary information to for application deployment.

## Docker Image Identifier

```
docker.dev.maaii.com/m80/m800-white-label-portal
```

## Docker Container Environment Variables

| Key | Description | e.g. |
| --- | --- | --- |
| TZ | NodeJs runtime timezone | Asia/Hong_Kong |
| `APP_URL` | base url of the application. i.e. if the application | https://partner.m800.com |
| `APP_PORT` | Port that App is listening inside the docker container | 3000 |
| `redisUri` | Connection String in [redisUri](https://github.com/mp911de/lettuce/wiki/Redis-URI-and-connection-details) format | `redis-sentinel://192.168.119.25:26378,192.168.119.26:26379` |
| `bossApi__baseUrl` | BOSS API Endpoint |`http://192.168.135.167:10080`|
| `bossApi__timeout` | BOSS API Timeout | 15000 |
| `mumsApi__baseUrl` | MUMS API Endpoint |`http://192.168.119.12:8080`|
| `mumsApi__timeout` | MUMS API Timeout | 15000 |
| `dataProviderApi__baseUrl` | Data Provider API Endpoint |`http://192.168.119.131:9998,http://192.168.119.132:9998`|
| `dataProviderApi__timeout` | Data Provider API Timeout |60000|
| `mvsApi__baseUrl` | Maaii Virtual Store Endpoint |`http://192.168.119.21:9125`|
| `mvsApi__timeout` | Maaii Virtual Store Timeout |15000|
| `bufferTimeInMinutes__callStats__dailyFetch` | buffering time to determine whether to get latest call stats data or the data from one day before to ensure all data are cached into redis successfully.| 240 |
| `bufferTimeInMinutes__callStats__hourlyFetch` | buffering time to determine whether to get latest call stats data or the data from one hour before to ensure all data are cached into redis successfully. | 10 |
| (Deprecated^) `logging__winston__meta__instance`|Deploy server/instance name, to use to identify from logstash which container the logs is coming from | testbed-wlp-1 |
| `iamApi__baseUrl` | Identity Access Management API Endpoint | http://127.0.0.1:3001 |
| `mpsApi__baseUrl` | Maaii Provision Service API Endpoint | http://deploy.dev.maaii.com:4005 |
| `openid__issuer`  | OpenId Issuer Endpoint. In most cases, should be pointed to IAM openid issuer endpoint. See [IAM Integration](docs/IAM_INTEGRATION.md) | http://127.0.0.1:3001/openid/core/.well-known/openid-configuration |
| `openid__clientId` | OpenId Client Id. See [IAM Integration](docs/IAM_INTEGRATION.md) | wlp |
| `openid__clientSecret` | OpenId Client Secret. [IAM Integration](docs/IAM_INTEGRATION.md) | 7GnoS1vf5HqM1b8B4ZKDJQA6BvXa38ltUoFFVQ4cloR4GICEuWQk50S60pIVK16b |


Note: Keys defined with __ in between words are due to default setup of [nconf](https://github.com/indexzero/nconf), an npm module that we used to organize application configurations.  

Note: `openid_` prefix should follow the guide in the [IAM integration](docs/IAM_INTEGRATION.md)

^ Deprecated as this would logs forwarding to logstash will be done through mapping of docker logs


## Docker Container Exposed Port
|Name|Port|Description|
| --- | --- | --- |
|App Port|3000|WLP NodeJS application port|
|Kue Port|3100|Kue UI & API. UI visualizing kue job (e.g. export job) status and API for kue job monitoring. Not required to externalize, but please map an internal IP for monitoring.|
