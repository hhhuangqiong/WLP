# Logstash

## How it works

The (winston) logs are published to Logstash directly via TCP

Publish location:

- development: 192.168.118.26:9997
- test & production: 192.168.0.12:9997

To view on Kibana:

- development: http://192.168.118.26:5601/#/discover
- test & production: https://192.168.0.12/#/discover

## Usage

Add the following snippet to "logging.winston.transports"

```json
"type": "winston.transports.Logstash",
"options": {
  "port": 9997,
  "host": "192.168.118.26"
}
```

The "meta" config under "logging.winston" could be overridden by env vars for
deployment.

Reference:

- [jaakkos/winston-logstash](https://github.com/jaakkos/winston-logstash)

## Custom fields

Required to be applied as filter(s) in [Kibana](https://www.elastic.co/products/kibana).

There are 4:

- app (name of the application)
- type
  - always use 'logs' in our case
- env
  - allowed values:
    - dev
    - tb
    - pro
- instance
  - the name of server instance
  - usually configured by engineering team

