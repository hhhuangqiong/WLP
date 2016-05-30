import moduleId from '../../constants/moduleId';
import { defineMessages } from 'react-intl';

const {
  OVERVIEW, ACCOUNT, COMPANY, END_USER, CALL,
  IM, SMS, VSF, TOP_UP, VERIFICATION_SDK,
} = moduleId;

const MESSAGES = defineMessages({
  overview: {
    id: 'overview',
    defaultMessage: 'Overview',
  },
  account: {
    id: 'account',
    defaultMessage: 'Account',
  },
  users: {
    id: 'users',
    defaultMessage: 'Users',
  },
  company: {
    id: 'company',
    defaultMessage: 'company',
  },
  calls: {
    id: 'calls',
    defaultMessage: 'Calls',
  },
  im: {
    id: 'im',
    defaultMessage: 'IM',
  },
  sms: {
    id: 'sms',
    defaultMessage: 'SMS',
  },
  vsf: {
    id: 'vsf',
    defaultMessage: 'VSF',
  },
  topUp: {
    id: 'topUp',
    defaultMessage: 'Top Up',
  },
  verification: {
    id: 'verification',
    defaultMessage: 'Verification',
  },
});

export default [
  {
    name: MESSAGES.overview,
    icon: 'icon-menuoverview',
    page: OVERVIEW,
    path: '/overview',
  },
  {
    name: MESSAGES.account,
    icon: 'icon-menuaccount',
    page: ACCOUNT,
    path: `/${ACCOUNT}`,
  },
  {
    name: MESSAGES.users,
    icon: 'icon-menuenduser',
    page: END_USER,
    path: `/${END_USER}`,
  },
  {
    name: MESSAGES.company,
    icon: 'icon-menucompany',
    page: COMPANY,
    path: `/${COMPANY}`,
  },
  {
    name: MESSAGES.calls,
    icon: 'icon-menucalls',
    page: CALL,
    path: `/${CALL}`,
  },
  {
    name: MESSAGES.im,
    icon: 'icon-menuim',
    page: IM,
    path: `/${IM}`,
  },
  {
    name: MESSAGES.sms,
    icon: 'icon-menu-sms',
    page: SMS,
    path: `/${SMS}`,
  },
  {
    name: MESSAGES.vsf,
    icon: 'icon-menustore',
    page: VSF,
    path: `/${VSF}`,
  },
  {
    name: MESSAGES.topUp,
    icon: 'icon-menutopup',
    page: TOP_UP,
    path: `/${TOP_UP}`,
  },
  {
    name: MESSAGES.verification,
    icon: 'icon-menuverification',
    page: VERIFICATION_SDK,
    path: `/${VERIFICATION_SDK}`,
  },
];
