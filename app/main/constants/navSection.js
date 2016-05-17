import moduleId from '../../data/moduleId';
const {
  OVERVIEW, ACCOUNT, COMPANY, END_USER, CALL,
  IM, SMS, VSF, TOP_UP, VERIFICATION_SDK,
} = moduleId;

export default [
  {
    name: 'Overview',
    icon: 'icon-menuoverview',
    page: OVERVIEW,
    path: 'overview',
  },
  {
    name: 'Account',
    icon: 'icon-menuaccount',
    page: ACCOUNT,
    path: 'account',
  },
  {
    name: 'Users',
    icon: 'icon-menuenduser',
    page: END_USER,
    path: 'end-users/overview',
  },
  {
    name: 'company',
    icon: 'icon-menucompany',
    page: COMPANY,
    path: 'companies',
  },
  {
    name: 'Calls',
    icon: 'icon-menucalls',
    page: CALL,
    path: 'calls/overview',
  },
  {
    name: 'IM',
    icon: 'icon-menuim',
    page: IM,
    path: 'im/overview',
  },
  {
    name: 'SMS',
    icon: 'icon-menu-sms',
    page: SMS,
    path: 'sms/overview',
  },
  {
    name: 'VSF',
    icon: 'icon-menustore',
    page: VSF,
    path: 'vsf/overview',
  },
  {
    name: 'Top Up',
    icon: 'icon-menutopup',
    page: TOP_UP,
    path: 'top-up/details',
  },
  {
    name: 'Verification',
    icon: 'icon-menuverification',
    page: VERIFICATION_SDK,
    path: 'verification',
  },
];
