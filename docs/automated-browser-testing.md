# Automated Browser Testing

## 1. Begin

### To start

1. npm i
2. npm run selenium
3. gulp

### Selenium server failure

`pkill -f selenium-standalone`

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

### Element Chain

```
browser
  .element('#someElem') // intial element
  .element('..') // parent of #someElem
  .element('#someElem2') // children of the parent element

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
page.url('https://partner.m800.com/')
  .setValue('[name="username"]', 'admin@maaii.com')
  .setValue('[name="password"]', 'whitelabel2014')
  .click('button=sign in');
```

#### Go to top up page

```
page.moveToObject('a=Top Up')
page.click('a=Top Up')
```

#### Get Text by selector

```
page.getText('tr').then(text => console.log(text))
```

#### Move to load More

```
page.moveToObject('a=Details Report').moveToObject('span=Load More')
```
