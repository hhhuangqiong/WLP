import logger from 'winston';

import { transformObject } from '../utils';

function nameTransform(value) {
  const user = { name: {} };
  if (value.first) {
    user.name.givenName = value.first;
  }
  if (value.last) {
    user.name.familyName = value.last;
  }
  return user;
}

export function formatNewUser(user) {
  logger.info(`[Export]Formatting new User ${user.username}`);
  // update the company format
  // oldKeyName: newKeyName
  const copyKeys = {
    isRoot: 'isRoot',
    username: '_id',
    hashedPassword: 'hashedPassword',
    salt: 'salt',
    name: nameTransform,
    affiliatedCompany: 'affiliatedCompany',
    assignedCompanies: 'assignedCompanies',
    assignedGroup: 'role',
    createdAt: 'createdAt',
    updateAt: 'updatedAt',
  };
  // all the existing company are status completed
  return transformObject(user, {}, copyKeys);
}
