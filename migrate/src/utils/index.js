import fs from 'fs';
import _ from 'lodash';
import logger from 'winston';

export function exportToFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 4));
}

export function transformObject(originalData, newData = {}, keySet) {
  return _.reduce(keySet, (data, value, key) => {
    // early return if doesn't exist
    if (!originalData[key]) {
      return data;
    }
    // transform the function base on the function
    if (_.isFunction(value)) {
      return _.merge(data, value(originalData[key]));
    }
    const target = {};
    target[value] = originalData[key];
    // directly mapped the data
    return _.merge(data, target);
  }, newData);
}

export async function exportData(db, collection) {
  const mCollection = db.collection(collection);
  return await mCollection.find().toArray();
}

export async function insertData(db, collection, docs) {
  const mCollection = db.collection(collection);
  return mCollection.insertMany(docs);
}

export async function updateData(db, collection, filter, update) {
  const mCollection = db.collection(collection);
  return await mCollection.findOneAndUpdate(filter, update);
}

// helper function to handle company change, it will temporary save the company and
// perform conversion from m800 company to root company for user
let m800Company;
let rootCompany;
export function setTransformCompany(m800, root) {
  m800Company = m800;
  rootCompany = root;
}

let companiesArr = [];
export function setCompanyList(companies) {
  companiesArr = companies;
}

export function isCompanyExisted(companyId) {
  const result = _.find(companiesArr, comp => companyId.toString() === comp._id.toString());
  if (!result) {
    logger.warn(`Fail to find the company with ${companyId.toString()}`);
    return false;
  }
  return true;
}

export function checkAndUpdateCompanyId(companyId) {
  let resultId = companyId;

  if (m800Company && rootCompany) {
    if (companyId.toString() === m800Company._id.toString()) {
      resultId = rootCompany._id;
    }
  }
  if (isCompanyExisted(resultId)) {
    return resultId;
  }
  return null;
}

export function lineBreak() {
  logger.info('====================================================================');
}
