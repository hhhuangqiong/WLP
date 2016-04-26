import {
  OVERVIEW, ACCOUNT, COMPANY, END_USER, CALL,
  IM, SMS, VSF, TOP_UP, VERIFICATION_SDK,
} from '../../data/moduleId';

export default [
  {
    name: 'Overview',
    icon: 'icon-menuoverview',
    page: OVERVIEW,
    routeName: 'overview',
    path: 'overview',
  },
  {
    name: 'Account',
    icon: 'icon-menuaccount',
    page: ACCOUNT,
    routeName: 'account',
    path: 'account',
  },
  {
    name: 'Users',
    icon: 'icon-menuenduser',
    page: END_USER,
    routeName: 'end-users-overview',
    path: 'end-users/overview',
  },
  {
    name: 'company',
    icon: 'icon-menucompany',
    page: COMPANY,
    routeName: 'companies',
    path: 'companies',
  },
  {
    name: 'Calls',
    icon: 'icon-menucalls',
    page: CALL,
    routeName: 'calls-overview',
    path: 'calls/overview',
  },
  {
    name: 'IM',
    icon: 'icon-menuim',
    page: IM,
    routeName: 'im-overview',
    path: 'im/overview',
  },
  {
    name: 'SMS',
    icon: 'icon-menu-sms',
    page: SMS,
    routeName: 'sms-overview',
    path: 'sms/overview',
  },
  {
    name: 'VSF',
    icon: 'icon-menustore',
    page: VSF,
    routeName: 'vsf-transaction-overview',
    path: 'vsf/overview',
  },
  {
    name: 'Top Up',
    icon: 'icon-menutopup',
    page: TOP_UP,
    routeName: 'top-up-details',
    path: 'top-up/details',
  },
  {
    name: 'Verification',
    icon: 'icon-menuverification',
    page: VERIFICATION_SDK,
    routeName: 'verification',
    path: 'verification',
  },
];
