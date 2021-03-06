export const PAGE_TRANSITION_TIMEOUT = 2000;
export const WAIT_FOR_FETCHING_TIMEOUT = 30000;

// Expect automatically redirect to sign-in page to perform
export const DEFAULT_URL = '/';


export const ROOT_LOGIN = {
  name: 'root@maaii.com',
  password: 'whitelabel2014',
};

export function getBrowserCapabilites(browserName) {
  return {
    desiredCapabilities: {
      browserName,
      screenshotPath: browserName,
    },
  };
}

export const LAST_UPDATE_TIME_FORMAT = 'MMM DD, YYYY H:mm';
