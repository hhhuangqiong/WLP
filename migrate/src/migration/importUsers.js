import logger from 'winston';
import fs from 'fs';
import { ObjectId } from 'mongodb';

import { insertData, updateData } from '../utils';
import config from '../../config.json';

const buildDir = config.export.buildDir;
const userJSON = `${buildDir}/user.json`;

function loadUsers() {
  logger.info('[Import]loading the users');
  const companies = JSON.parse(fs.readFileSync(userJSON, 'utf8'));
  return companies;
}

async function insertUser(users, db) {
  logger.info('[Import]inserting the users');
  for (const user of users) {
    // convert formay
    if (user.affiliatedCompany) {
      user.affiliatedCompany = new ObjectId(user.affiliatedCompany);
    }
    if (user.createdAt) {
      user.createdAt = new Date(user.createdAt);
    }
    if (user.updatedAt) {
      user.updatedAt = new Date(user.updatedAt);
    }
    if (user.role) {
      // asign user with admin role
      if (user.role === 'root') {
        await updateData(db, 'Role',
          { company: user.affiliatedCompany, service: 'wlp' }, { $push: { users: user._id } });
      }
      // other case ignore the roles
      delete user.role;
    }
  }
  // bulk insert all the user data
  await insertData(db, 'User', users);
}

// it will import users
export async function importUsers(db) {
  logger.info('[Import]Start import users');
  // load users data
  const users = loadUsers();
  // insert data to db
  await insertUser(users, db);
  logger.info('[Import]Done import users');
}
