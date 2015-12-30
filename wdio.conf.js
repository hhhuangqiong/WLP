const log = require('logging');
const fs = require('fs-extra');

exports.config = {
  // Adding FEATURE=<feature name> for the running script allows to run single feature test instead of running all tests
  specs: [
    `./test/browser/specs/${process.env.FEATURE ? process.env.FEATURE : '**'}/*.js`,
  ],

  //
  // ============
  // Capabilities
  // ============
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://docs.saucelabs.com/reference/platforms-configurator
  //
  capabilities: [{
    browserName: process.env.BROWSER ? process.env.BROWSER : 'phantomjs',
    'phantomjs.binary.path': 'node_modules/phantomjs/bin/phantomjs',
  }],
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: 'command',

  coloredLogs: true,

  screenshotPath: './test/browser/screenshots',
  //
  // Set a base URL in order to shorten url command calls. If your url parameter starts
  // with "/", the base url gets prepended.
  baseUrl: 'http://localhost:3000',
  //
  // Default timeout for all waitForXXX commands.
  waitforTimeout: 15000,
  //
  // Initialize the browser instance with a WebdriverIO plugin. The object should have the
  // plugin name as key and the desired plugin options as property. Make sure you have
  // the plugin installed before running any tests. The following plugins are currently
  // available:
  // WebdriverCSS: https://github.com/webdriverio/webdrivercss
  // WebdriverRTC: https://github.com/webdriverio/webdriverrtc
  // Browserevent: https://github.com/webdriverio/browserevent
  // plugins: {
  //     webdrivercss: {
  //         screenshotRoot: 'my-shots',
  //         failedComparisonsRoot: 'diffs',
  //         misMatchTolerance: 0.05,
  //         screenWidth: [320,480,640,1024]
  //     },
  //     webdriverrtc: {},
  //     browserevent: {}
  // },
  //
  // Framework you want to run your specs with.
  // The following are supported: mocha, jasmine and cucumber
  // see also: http://webdriver.io/guide/testrunner/frameworks.html
  //
  // Make sure you have the node package for the specific framework installed before running
  // any tests. If not please install the following package:
  // Mocha: `$ npm install mocha`
  // Jasmine: `$ npm install jasmine`
  // Cucumber: `$ npm install cucumber`
  framework: 'mocha',
  //
  // Test reporter for stdout.
  // The following are supported: dot (default), spec and xunit
  // see also: http://webdriver.io/guide/testrunner/reporters.html
  reporter: 'xunit',

  //
  // Some reporter require additional information which should get defined here
  reporterOptions: {
    //
    // If you are using the "xunit" reporter you should define the directory where
    // WebdriverIO should save all unit reports.
    outputDir: './test/browser/reports',
  },

  //
  // Options to be passed to Mocha.
  // See the full list at http://mochajs.org/
  mochaOpts: {
    ui: 'bdd',
    compilers: ['js:babel/register'],
    timeout: 500000,
  },

  //
  // =====
  // Hooks
  // =====
  // Run functions before or after the test. If one of them returns with a promise, WebdriverIO
  // will wait until that promise got resolved to continue.
  //
  // Gets executed before all workers get launched.
  onPrepare() {
    log('Start running browser test');

    /* Ensure no previous result left inside reports dir */
    fs.emptyDirSync('./test/browser/screenshots');
    return fs.emptyDirSync('./test/browser/reports');
  },
  //
  // Gets executed before test execution begins. At this point you will have access to all global
  // variables like `browser`. It is the perfect place to define custom commands.
  before() {
    browser.setViewportSize({ width: 1440, height: 768 });

    browser.addCommand('signIn', require('./test/browser/commands/signIn'));
    browser.addCommand('signOut', require('./test/browser/commands/signOut'));
    browser.addCommand('goTo', require('./test/browser/commands/goTo'));
    browser.addCommand('goToDetails', require('./test/browser/commands/goToDetails'));
    browser.addCommand('switchCompany', require('./test/browser/commands/switchCompany'));

    // Report Related
    browser.addCommand('validateDate', require('./test/browser/commands/report/validateDate'));
    browser.addCommand('changeAndValidateDate', require('./test/browser/commands/report/changeAndValidateDate'));
    browser.addCommand('searchMobile', require('./test/browser/commands/report/searchMobile'));
    browser.addCommand('clearSearch', require('./test/browser/commands/report/clearSearch'));
    browser.addCommand('searchAndValidate', require('./test/browser/commands/report/searchAndValidate'));
    browser.addCommand('exportCsv', require('./test/browser/commands/report/exportCsv'));

    // End User Related
    browser.addCommand('validateAccountInfo', require('./test/browser/specs/end-user/commands/validateAccountInfo'));

    // VSF Related
    browser.addCommand('filterVisualItem', require('./test/browser/specs/vsf/commands/filterVisualItem'));

    // IM Related
    browser.addCommand('filterChatItem', require('./test/browser/specs/im/commands/filterChatItem'));
  },
  //
  // Gets executed after all tests are done. You still have access to all global variables from
  // the test.
  after(failures, pid) {
    if (failures) {
      log('Number of failure test:', failures);
      log("Failure test's pid", pid);
    }
  },
  //
  // Gets executed after all workers got shut down and the process is about to exit. It is not
  // possible to defer the end of the process using a promise.
  onComplete() {
    log('Browser test completed!');
  },
};
