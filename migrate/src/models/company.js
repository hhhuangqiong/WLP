import logger from 'winston';
import timezone from 'timezones.json';
import _ from 'lodash';

import { transformObject } from '../utils';

function timezoneTransform(value) {
  let offset = value.match(/\-?\+?\d+.?\d*/);
  // extract the +8
  if (!offset || offset.length !== 1) {
    return value;
  }
  // parse into number
  offset = parseFloat(offset, 10);
  // find the value in timezones.json
  const set = _.find(timezone, time => time.offset === offset);
  if (!set || !set.value) {
    return value;
  }
  return { timezone: set.value };
}

export function formatNewCompany(company) {
  logger.info(`[Export]Formatting new company ${company.name}`);
  // update the company format
  // oldKeyName: newKeyName
  const copyKeys = {
    _id: '_id',
    parentCompany: 'parent',
    name: 'name',
    reseller: 'reseller',
    logo: 'logo',
    themeType: 'themeType',
    address: value => ({ address: { formatted: value } }),
    country: 'country',
    timezone: timezoneTransform,
    accountManager: 'accountManager',
    status: value => ({ active: value === 'active' }),
    businessContact: value => ({ businessContact: [value] }),
    technicalContact: value => ({ technicalContact: [value] }),
    supportContact: value => ({ supportContact: [value] }),
    createdAt: 'createdAt',
    updateAt: 'updatedAt',
  };

  return transformObject(company, {}, copyKeys);
}
