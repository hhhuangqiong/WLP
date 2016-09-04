import _ from 'lodash';
import logger from 'winston';

import { formatNewUser } from '../models/user';
import { exportData, exportToFile, checkAndUpdateCompanyId } from '../utils';
import config from '../../config.json';

const buildDir = config.export.buildDir;
const userJSON = `${buildDir}/user.json`;

async function exportUsersData(db) {
  logger.info('[Export]Start fetching the users');
  const rawUsers = await exportData(db, 'PortalUser');
  logger.info(`[Export]Done fetching the users with ${rawUsers.length} records`);
  return rawUsers;
}

function migrateUsers(users) {
  const updatedUsers = _.map(users, user => {
    const mUser = user;
    if (user.affiliatedCompany) {
      mUser.affiliatedCompany = checkAndUpdateCompanyId(user.affiliatedCompany);
    }
    if (user.assignedCompanies) {
      mUser.assignedCompanies = [];
      _.forEach(user.assignedCompanies, companyId => {
        const id = checkAndUpdateCompanyId(companyId);
        if (id) {
          mUser.assignedCompanies.push(id);
        }
      });
    }
    return mUser;
  });

  return _.map(updatedUsers, formatNewUser);
}

export async function exportUsers(db) {
  logger.info('[Export]Start export users');
  // export user data
  const users = await exportUsersData(db);
  // migrate user data
  const updatedUsers = migrateUsers(users);
  // save the data
  exportToFile(userJSON, updatedUsers);
  logger.info('[Export]Done export users');
}
