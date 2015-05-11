import nconf from 'nconf';
import request from 'superagent';

import env from '../utils/env';

import Company from '../collections/company';

// making it a const in order to use nconf
const baseUrl = nconf.get('localhost:baseUrl');

function getAllCompanies(criteria, cb) {
  // on SERVER, we go directly to mongoose Modal
  // just use this for as demo now, will consider replacing with Company Controller
  // any security concerns?
  if (env.SERVER) {
    Company.find({}, function(err, companies) {
      cb(err || companies);
    });
  } else {
  // on CLIENT, we send out request
    request
      .get(`${baseUrl}/companies`)
      .send(criteria)
      .set('Accept', 'application/json')
      .end(function(err, res){
        console.log(err, res);
        if (err || !res) {
          // error handling
          return cb(null);
        }

        let companies = res.body.result;

        cb(companies);
      });
  }
}

module.exports = {
  name: 'company', // name is compulsory here
  read: function(req, resource, params, config, cb) {
    getAllCompanies({}, function(companies) {
      cb(null, companies);
    });
  }
};
