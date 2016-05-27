import i18nMessages from '../../../main/constants/i18nMessages';

const PLATFORM = {
  WINDOWS_PHONE: {
    iconClass: null,
    name: i18nMessages.windowsPhone,
  },
  IOS: {
    iconClass: 'icon-apple',
    name: i18nMessages.ios,
  },
  ANDROID: {
    iconClass: 'icon-android',
    name: i18nMessages.android,
  },
};

export default (platform) => {
  switch (platform.toLowerCase()) {
    case 'android':
      return PLATFORM.ANDROID;
    case 'ios':
      return PLATFORM.IOS;
    //  'phone' is determined as a windows phone in the snapshots,
    //  so it will be kept here to ensure for the old data.
    case 'phone':
    case 'windows.phone':
      return PLATFORM.WINDOWS_PHONE;
    default:
      return {
        name: platform,
        iconClass: '',
      };
  }
};
