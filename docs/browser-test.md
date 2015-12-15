const webdriverio = require('webdriverio');

#### Init a page object
const page = webdriverio.remote({ desiredCapabilities: { browserName: 'chrome' }}).init();

#### Sign In
page.url('https://partner.m800.com/').setValue('[name="username"]', 'admin@maaii.com').setValue('[name="password"]', 'whitelabel2014').click('button=sign in');

#### Go to top up page
page.moveToObject('a=Top Up')
page.click('a=Top Up')

#### Get Text by selector
page.getText('tr').then(text => console.log(text))

#### Move to load More
page.moveToObject('a=Details Report').moveToObject('span=Load More')
