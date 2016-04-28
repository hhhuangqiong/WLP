import log from 'winston';
import fs from 'fs-extra';

const BROWSERS = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  PHANTOMJS: 'phantomjs',
};

function getCapabilities(selectedBrowsers = Object.values(BROWSERS).join(',')) {
  return selectedBrowsers
    .split(',')
    .map(browserName => ({
      browserName: browserName.trim(),
      'phantomjs.binary.path': './node_modules/phantomjs/lib/phantom/bin/phantomjs',
      // the following options can be specified
      // maxInstances: 5,
      // specs: [],
      // exclude: [],
    }));
}

function getSpecs(selectedFeatures = '**') {
  return selectedFeatures
    .split(',')
    .map(feature => feature.trim())
    .map(feature => `./test/browser/specs/${feature}/*.js`);
}

function addCommand(browser, commands) {
  for (const key of Object.keys(commands)) {
    browser.addCommand(key, require(commands[key]));
  }
}

// define helper files that can be used by browser instance
const COMMANDS = {
  // shared commands
  signIn: './test/browser/commands/signIn',
  signOut: './test/browser/commands/signOut',
  goTo: './test/browser/commands/goTo',
  goToDetails: './test/browser/commands/goToDetails',
  switchCompany: './test/browser/commands/switchCompany',

  // details report related commands
  waitForTableFetching: './test/browser/commands/report/waitForTableFetching',
  validateDateRange: './test/browser/commands/report/validateDateRange',
  changeDateRange: './test/browser/commands/report/changeDateRange',
  clickFirstAvailableDate: './test/browser/commands/report/clickFirstAvailableDate',
  expectToHaveData: './test/browser/commands/report/expectToHaveData',
  validateSearch: './test/browser/commands/report/validateSearch',
  clearSearch: './test/browser/commands/report/clearSearch',
  exportCsv: './test/browser/commands/report/exportCsv',

  // section specific
  validateAccountInfo: './test/browser/specs/end-user/commands/validateAccountInfo',
  filterVisualItem: './test/browser/specs/vsf/commands/filterVisualItem',
  filterChatItem: './test/browser/specs/im/commands/filterChatItem',
};

export default {
  // Adding FEATURE=<feature name> for the running script
  // allows to run single feature test instead of running all tests
  specs: getSpecs(process.env.FEATURE),

  exclude: [],

  // =====================
  // Server Configurations
  // =====================
  // Host address of the running Selenium server. This information is usually obsolete as
  // WebdriverIO automatically connects to localhost. Also if you are using one of the
  // supported cloud services like Sauce Labs, Browserstack or Testing Bot you also don't
  // need to define host and port information because WebdriverIO can figure that our
  // according to your user and key information. However if you are using a private Selenium
  // backend you should define the host address, port, and path here.
  //
  host: process.env.REMOTE ? (process.env.SELENIUM_HOST || 'deploy.dev.maaii.com') : 'localhost',
  port: process.env.SELENIUM_PORT || 4444,
  path: process.env.SELENIUM_PATH || '/wd/hub',
  //
  // ============
  // Capabilities
  // ============
  // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
  // time. Depending on the number of capabilities, WebdriverIO launches several test
  // sessions. Within your capabilities you can overwrite the spec and exclude option in
  // order to group specific specs to a specific capability.
  //
  // First you can define how many instances should be started at the same time. Let's
  // say you have 3 different capabilities (Chrome, Firefox and Safari) and you have
  // set maxInstances to 1, wdio will spawn 3 processes. Therefor if you have 10 spec
  // files and you set maxInstances to 10, all spec files will get tested at the same time
  // and 30 processes will get spawned. The property basically handles how many capabilities
  // from the same test should run tests.
  //
  maxInstances: 2,
  capabilities: getCapabilities(process.env.BROWSER),

  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here

  // Level of logging verbosity: silent | verbose | command | data | result | error
  // to avoid overwhleming selenium system log
  logLevel: 'silent',

  coloredLogs: true,

  screenshotPath: './test/browser/screenshots',
  // Set a base URL in order to shorten url command calls. If your url parameter starts
  // with "/", the base url gets prepended.
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  //
  // Default timeout for all waitForXXX commands.
  waitforTimeout: process.env.TEST_WAITFOR_TIMEOUT || 15000,
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

  framework: 'mocha',
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
    timeout: process.env.TEST_TIMEOUT || 500000,
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
    log.info(`Connect to selenium server:
      ${process.env.REMOTE ? (process.env.SELENIUM_HOST || 'deploy.dev.maaii.com') :
      'localhost'}: ${process.env.SELENIUM_PORT}`);
    log.info('Start running browser test');

    /* Ensure no previous result left inside reports dir */
    fs.emptyDirSync('./test/browser/screenshots');
    return fs.emptyDirSync('./test/browser/reports');
  },
  //
  // Gets executed before test execution begins. At this point you will have access to all global
  // variables like `browser`. It is the perfect place to define custom commands.
  before() {
    browser.setViewportSize({ width: 1440, height: 768 });
    addCommand(browser, COMMANDS);
  },
  //
  // Gets executed after all tests are done. You still have access to all global variables from
  // the test.
  after(failures, pid) {
    if (failures) {
      log.info('Number of failure test:', failures);
      log.info("Failure test's pid", pid);
    }
  },
  //
  // Gets executed after all workers got shut down and the process is about to exit. It is not
  // possible to defer the end of the process using a promise.
  onComplete() {
    log.info('Browser test completed!');
  },
};
