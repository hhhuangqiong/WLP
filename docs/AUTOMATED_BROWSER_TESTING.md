# Automated Browser Testing

The environment of front-end is not rigor like back-end development.
The output can be varied from the input depending on different accessing devices, software versions and screen size.
It is therefore necessary to test screen output in *User Perspective*, so that deviation are always in control.

## Target Browsers
- Chrome (Latest Version)
- Firefox (Latest Version)

## 1. Begin

### Before start

1. Start the application: `gulp`
2. Ensure you've set environment variable SELENIUM_HOST, SELENIUM_PORT that wire up selenium server and web driver (wdio)
3. Start selenium server if you are at local: `npm run selenium`

### Running test case

```
npm run test:browser
```

### Running test case with options

```
// Specifying browser (default: phantom.js)
BROWSER=chrome npm run test:browser

// Specifying feature (default: running all)
FEATURE=call npm run test:browser

// Specifying both
BROWSER=firefox FEATURE=sms npm run test:browser

// FEATURE AND BROWSER can be multiple
BROWSER=chrome,firefox FEATURE=sms,call npm run test:browser

// Running on remote with selenium server config (e.g. Jenkins)
REMOTE=true npm run test:browser

// Specifying test location (default: localhost:3000)
TEST_URL=http://deploy.dev.maaii.com:4004 npm run test:browser
```

## 2. Interacting with Page Object

### Directory Structure

```
└── test
    ├── browser
    │   ├── commands
    │   ├── lib
    │   └── specs
    │       ├── call
    │       └── vsf
    ├── reports
    └── screenshots

```

### Webdriver.io

- [selectors](http://webdriver.io/guide/usage/selectors.html)
- [tutorials](https://github.com/onewithhammer/web-driver-io-tutorial)

### Debugging

```
browser.debug()
browser.pause(5000)
browser.saveScreenshot(<path>)
```

## 3. Example

### About Scrolling

Element can be exist anc can be not visible at the same time. You can move to a
specific object first before doing get/set.

```
browser.moveToObject(<selector>)
```

### About hover

There are no methods to do hover effect in webdriver.io.
Instead, you should use `click` instead.

## 4. Manual Test (Advance debugging)

```
const webdriverio = require('webdriverio');
```

#### Init a page object

```
const page = webdriverio.remote({ desiredCapabilities: { browserName: 'chrome' }}).init();
```

#### Sign In

```
browser.url('https://partner.m800.com/')
browser.setValue('[name="username"]', 'admin@maaii.com')
browser.setValue('[name="password"]', 'whitelabel2014')
browser.click('button=sign in');
```

#### Entering section with hover menu

It is necessary to use moveToObject to avoid the unclickable problem

```
browser.moveToObject('a=Top Up')
browser.click('a=Top Up')
```

#### Get Text by selector

```
browser.getText('tr')
```

#### Move to load More

```
browser.moveToObject('a=Details Report')
browser.moveToObject('span=Load More')
```
