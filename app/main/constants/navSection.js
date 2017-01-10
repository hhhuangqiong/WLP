import moduleId from '../../constants/moduleId';
import { defineMessages } from 'react-intl';
import { permission, RESOURCE } from './../../main/acl/acl-enums';

const {
  OVERVIEW, ACCOUNT, COMPANY, END_USER, CALL,
  IM, SMS, VSF, TOP_UP, VERIFICATION_SDK, ACCESS_MANAGEMENT,
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
  user: {
    id: 'user',
    defaultMessage: 'User',
  },
  company: {
    id: 'company',
    defaultMessage: 'company',
  },
  call: {
    id: 'call',
    defaultMessage: 'Call',
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
  accessManagement: {
    id: 'accessManagement',
    defaultMessage: 'Access Management',
  },
});

export default [
  {
    name: MESSAGES.overview,
    icon: 'icon-menuoverview',
    page: OVERVIEW,
    path: '/overview',
    permission: permission(RESOURCE.GENERAL),
  },
  {
    name: MESSAGES.account,
    icon: 'icon-menuaccount',
    page: ACCOUNT,
    path: `/${ACCOUNT}`,
    permission: permission(RESOURCE.USER),
  },
  {
    name: MESSAGES.user,
    icon: 'icon-menuenduser',
    page: END_USER,
    path: `/${END_USER}`,
    permission: permission(RESOURCE.END_USER),
  },
  {
    name: MESSAGES.company,
    icon: 'icon-menucompany',
    page: COMPANY,
    path: `/${COMPANY}`,
    permission: permission(RESOURCE.COMPANY),
  },
  {
    name: MESSAGES.call,
    icon: 'icon-menucalls',
    page: CALL,
    path: `/${CALL}`,
    permission: permission(RESOURCE.CALL),
  },
  {
    name: MESSAGES.im,
    icon: 'icon-menuim',
    page: IM,
    path: `/${IM}`,
    permission: permission(RESOURCE.IM),
  },
  {
    name: MESSAGES.sms,
    icon: 'icon-menu-sms',
    page: SMS,
    path: `/${SMS}`,
    permission: permission(RESOURCE.SMS),
  },
  {
    name: MESSAGES.vsf,
    icon: 'icon-menustore',
    page: VSF,
    path: `/${VSF}`,
    permission: permission(RESOURCE.VSF),
  },
  {
    name: MESSAGES.topUp,
    icon: 'icon-menutopup',
    page: TOP_UP,
    path: `/${TOP_UP}`,
    permission: permission(RESOURCE.TOP_UP),
  },
  {
    name: MESSAGES.verification,
    icon: 'icon-menuverification',
    page: VERIFICATION_SDK,
    path: `/${VERIFICATION_SDK}`,
    permission: permission(RESOURCE.VERIFICATION_SDK),
  },
  {
    name: MESSAGES.accessManagement,
    icon: 'icon-menu-access-management',
    page: ACCESS_MANAGEMENT,
    path: `/${ACCESS_MANAGEMENT}`,
    permission: permission(RESOURCE.ROLE),
  },
];
