var mongoose = require('mongoose');
var collectionName = 'Company';
var schema = new mongoose.Schema({
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
    }
}, { collection: collectionName });
module.exports = mongoose.model(collectionName, schema);
