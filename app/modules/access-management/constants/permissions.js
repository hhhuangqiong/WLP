import { RESOURCE, ACTION } from './../../../main/acl/acl-enums';

// Documentation: https://issuetracking.maaii.com:9443/display/WLP/Identity+Access+Management+Service
export const PERMISSIONS = [{
  intlKey: 'companyManagement',
  children: [{
    intlKey: 'create',
    resource: RESOURCE.COMPANY,
    action: ACTION.CREATE,
  }, {
    intlKey: 'update',
    resource: RESOURCE.COMPANY,
    action: ACTION.UPDATE,
  }, {
    intlKey: 'read',
    resource: RESOURCE.COMPANY,
    action: ACTION.READ,
  }, {
    intlKey: 'delete',
    resource: RESOURCE.COMPANY,
    action: ACTION.DELETE,
  }],
}, {
  intlKey: 'userManagement',
  children: [{
    intlKey: 'create',
    resource: RESOURCE.USER,
    action: ACTION.CREATE,
  }, {
    intlKey: 'update',
    resource: RESOURCE.USER,
    action: ACTION.UPDATE,
  }, {
    intlKey: 'read',
    resource: RESOURCE.USER,
    action: ACTION.READ,
  }, {
    intlKey: 'delete',
    resource: RESOURCE.USER,
    action: ACTION.DELETE,
  }],
}, {
  intlKey: 'permissionManagement',
  children: [{
    intlKey: 'create',
    resource: RESOURCE.ROLE,
    action: ACTION.CREATE,
  }, {
    intlKey: 'update',
    resource: RESOURCE.ROLE,
    action: ACTION.UPDATE,
  }, {
    intlKey: 'read',
    resource: RESOURCE.ROLE,
    action: ACTION.READ,
  }, {
    intlKey: 'delete',
    resource: RESOURCE.ROLE,
    action: ACTION.DELETE,
  }],
}, {
  intlKey: 'endUserManagement',
  children: [{
    intlKey: 'create',
    resource: RESOURCE.END_USER,
    action: ACTION.CREATE,
  }, {
    intlKey: 'update',
    resource: RESOURCE.END_USER,
    action: ACTION.UPDATE,
  }, {
    intlKey: 'read',
    resource: RESOURCE.END_USER,
    action: ACTION.READ,
  }, {
    intlKey: 'delete',
    resource: RESOURCE.END_USER,
    action: ACTION.DELETE,
  }],
}, {
  intlKey: 'generalOverview',
  resource: RESOURCE.GENERAL,
  action: ACTION.READ,
}, {
  intlKey: 'topUp',
  resource: RESOURCE.TOP_UP,
  action: ACTION.READ,
}, {
  intlKey: 'vsf',
  resource: RESOURCE.VSF,
  action: ACTION.READ,
}, {
  intlKey: 'call',
  resource: RESOURCE.CALL,
  action: ACTION.READ,
}, {
  intlKey: 'im',
  resource: RESOURCE.IM,
  action: ACTION.READ,
}, {
  intlKey: 'sms',
  resource: RESOURCE.SMS,
  action: ACTION.READ,
}];

export default PERMISSIONS;
