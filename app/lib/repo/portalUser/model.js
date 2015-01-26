/// <reference path='../../../../typings/mongoose/mongoose.d.ts' />
/// <reference path='../../../../typings/underscore/underscore.d.ts' />
/// <reference path='../../../../typings/bcrypt/bcrypt.d.ts' />
var _ = require('underscore');
var bCrypt = require('bcrypt');
var mongoose = require('mongoose');
//TODO: common validators to be shared among models
function presenceValidator(param) {
    return param && param.length > 0;
}
function lengthValidator(param, min, max) {
    return param.length >= min || param.length <= max;
}
function emailValidator(email) {
    var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return email && reg.test(email);
}
var portalUserSchema = new mongoose.Schema({
    // username is in form of email as discussed
    username: {
        type: String,
        required: 'Username is required',
        trim: true,
        unique: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    name: {
        first: {
            type: String,
            required: 'First name is required'
        },
        last: {
            type: String,
            required: 'Last name is required'
        }
    },
    changedPassword: [{
        password: {
            type: String
        },
        changeAt: {
            type: Date
        }
    }],
    carrierDomains: [{
        type: String
    }],
    assignedGroups: [{
        type: Object
    }],
    isVerified: {
        type: Boolean,
        require: true,
        default: false
    },
    status: {
        type: String,
        required: true,
        default: 'inactive'
    },
    token: {
        forgotPassword: {
            token: {
                type: String
            },
            createAt: {
                type: Date
            }
        }
    },
    createAt: {
        type: Date,
        required: true
    },
    createBy: {
        type: String,
        required: true
    },
    updateAt: {
        type: Date,
        required: true
    },
    updateBy: {
        type: String,
        required: true
    },
    affiliatedCompany: {
        type: String,
        required: true
    }
}, { collection: 'portalUser' });
/*
 * Schema Instance Methods
 */
portalUserSchema.method('hasCarrierDomain', function (carrierDomain) {
    return _.contains(this.carrierDomains, carrierDomain);
});
portalUserSchema.method('isValidPassword', function (password) {
    return bCrypt.compareSync(password, this.hashedPassword);
});
portalUserSchema.static('findByName', function (name, cb) {
    this.find({ name: new RegExp(name, 'i') }, cb);
});
portalUserSchema.static('newForgotPasswordRequest', function (username, cb) {
    var salt = bCrypt.genSaltSync(10);
    var token = bCrypt.hashSync(username + new Date(), salt);
    this.findOneAndUpdate({
        username: username
    }, {
        $set: {
            token: {
                forgotPassword: {
                    token: token,
                    createAt: new Date()
                }
            }
        }
    }, function (err, user) {
        if (err) {
            cb(err, null);
        }
        cb(null, user);
    });
});
portalUserSchema.static('newPortalUser', function (data, cb) {
    var _this = this;
    var _cb = cb;
    bCrypt.genSalt(10, function (err, salt) {
        bCrypt.hash(data.username + new Date(), salt, function (err, hash) {
            data.salt = salt;
            data.hashedPassword = hash;
            _this.create(data, function (err, user) {
                if (err) {
                    return _cb(err, null);
                }
                return _cb(null, user);
            });
        });
    });
});
var PortalUser = module.exports = mongoose.model('PortalUser', portalUserSchema);
