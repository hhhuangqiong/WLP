# Release

White Label Portal is built as a Docker image, with configurable fields as below:

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
|`redis__sentinels`|Json array of redis sentinels endpoint|`[{"host":"192.168.119.25","port":26379},{"host":"192.168.119.26","port":26379}]`|
|`redis__name`|Redis username|wlp-testbed-user|
|`redis__role`|Redis client role|master|
|`redis__db`|Redis db number|11|
|`bossApi__baseUrl`|BOSS API Endpoint|`http://192.168.135.167:10080`|
|`bossApi__timeout`|BOSS API Timeout|15000|
|`mumsApi__baseUrl`|MUMS API Endpoint|`http://192.168.119.12:8080`|
|`mumsApi__timeout`|MUMS API Timeout|15000|
|`dataProviderApi__baseUrl`|Data Provider API Endpoint|`http://192.168.119.131:9998,http://192.168.119.132:9998`|
|`dataProviderApi__timeout`|Data Provider API Timeout|60000|
|`mvsApi__baseUrl`|Maaii Virtual Store Endpoint|`http://192.168.119.21:9125`|
|`mvsApi__timeout`|Maaii Virtual Store Timeout|15000|
|`logging__winston__meta__instance`|Deploy server/instance name, to use to identify from logstash which container the logs is coming from|testbed-wlp-1|


## Docker Container Exposed Port
|Name|Port|Description|
| --- | --- | --- |
|App Port|3000|WLP NodeJS application port|
|Kue Port|3100|Kue UI & API. UI visualizing kue job (e.g. export job) status and API for kue job monitoring. Not required to externalize, but please map an internal IP for monitoring.|



# Monitoring

## Background Jobs 

Background jobs, in WLP cases mostly export tasks, can be monitored via kue's getStat API. i.e.

```
GET http://{Container's Host}:{Kue Port}/stats
```

See [https://github.com/Automattic/kue#get-stats|https://github.com/Automattic/kue#get-stats] for more details.
 

# Configurations

## General

Release Candidate refers to the build of upcoming release version. See Releases section above for upcoming release version.

| |Demo|Hotfix|Release Candidate|Development|
| --- | --- | --- | --- | --- |
| |Hostname|http://deply.dev.maaii.com:4008|http://deply.dev.maaii.com:4006|http://deploy.dev.maaii.com:4004|http://deploy.dev.maaii.com:4002|

## Data Seeding

### Permissions 

This process that needs to be triggered on each new deployment that seeds any new user, once the application reaches version 1.2.0. This will provide the basic permission to the existing users towards their affiliated company.

It should be run after docker container is started.
```
docker exec -it ${container} npm  bin/permissionSeeding.js --env ${environment}
```

|environment|value of ${environment}|
| --- | --- | --- | --- | --- |
|development|development|
|test|test|
|production|production|

based on env argument, *the process will read the corresponding environment config json for mongoose connection.*
