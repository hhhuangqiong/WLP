# Development Environment Variables

## Optional:

### APP_HOSTNAME (DEFAULT: '')

Description:

- hostname of request url in `apiPlugin`
- hostname of `webpack-dev-server`

Values:

- localhost
- partner.m800.com

### APP_PORT (DEFAULT: 3000)

Description:

- port listened by node application

### APP_URL (DEFAULT: http://localhost:3000)

Description:

- pass to third party service api such as mail server

### DISABLE_ISOMORPHISM (DEFAULT: '')

Description:

- setting to disable Universal JavaScript

Values:

- true
- false

### ENABLE_WEBPACK_HOTLOADER (DEFAULT: false)

Description:

- change to activate hotloader to update file without reload

Values:

- true
- false

### HOT_LOAD_PORT (DEFAULT: 8888)

Description:

- port listened by `webpack-dev-server`

### NODE_ENV (DEFAULT: development)

Description:

- environment setting of Node application

Values:

- test
- production
