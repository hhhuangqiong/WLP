# Release

## Relesae Build

White Label Portal is built as a Docker image, check the [Docker](./DOCKER.md) section for details.

## Monitoring

### Background Jobs 

Background jobs, in WLP cases mostly export tasks, can be monitored via kue's getStat API. i.e.

```
GET http://{Container's Host}:{Kue Port}/stats
```

See [https://github.com/Automattic/kue#get-stats|https://github.com/Automattic/kue#get-stats] for more details.
