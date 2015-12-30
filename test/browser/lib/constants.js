export const PAGE_TRANSITION_TIMEOUT = 2000;
export const WAIT_FOR_FETCHING_TIMEOUT = process.env.TIMEOUT || 7000;
export const WAIT_FOR_WIDGET_TIMEOUT = 8000;

export const DEFAULT_URL = process.env.URL || 'http://localhost:3000/';

export const ROOT_LOGIN = {
  name: 'root@maaii.com',
  password: 'whitelabel2014',
};

export function getBrowserCapabilites(browserName) {
  return {
    desiredCapabilities: {
      browserName: browserName,
      screenshotPath: browserName,
    },
  };
}
