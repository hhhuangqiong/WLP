/// <reference path='../../typings/mongoose/mongoose.d.ts' />
import mongoose = require('mongoose');

var schema: mongoose.Schema = new mongoose.Schema({
  parentCompany: {
    type: String
  },
  accountManager: {
    type: String,
    required: true
  },
  billCode: {
    type: String
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String
  },
  reseller: {
    type: Boolean
  },
  domain: {
    type: String,
    unique: true
  },
  businessContact: {
    type: Object
  },
  technicalContact: {
    type: Object,
    required: true
  },
  supportContact: {
    type: Object,
    required: true
  },
  logo: {
    type: String
  },
  themeType: {
    type: String
  },
  status: {
    type: String,
    required: true,
    default: 'inactive'
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  createBy: {
    type: String
  },
  updateAt: {
    type: Date
  },
  updateBy: {
    type: String
  },
  supportedLanguages: {
    type: String,
    required: true
  },
  supportedDevices: {
    type: String,
    required: true
  }}, {collection: 'Company'});

module.exports = mongoose.model('Company', schema);

export interface Company {
  parentCompany:      string;
  accountManager:     string;
  billCode:           string;
  name:               string;
  address:            string;
  reseller:           boolean;
  domain:             string;
  businessContact:    Contact;
  technicalContact:   Contact;
  supportContact:     Contact;
  logo:               string;
  themeType:          string;
  createAt:           string;
  createBy:           string;
  updateAt:           string;
  updateBy:           string;
  supportedLanguages: string;
  supportedDevices:   string;
}

interface Contact {
  name:  string;
  phone: string;
  email: string;
}
