/// <reference path='../../typings/mongoose/mongoose.d.ts' />
/// <reference path='../../typings/underscore/underscore.d.ts' />
/// <reference path='../../typings/bcrypt/bcrypt.d.ts' />
var _ = require('underscore');
var bCrypt = require('bcrypt');
var mongoose = require('mongoose');
//TODO common validators to be shared among models
function lengthValidator(param, min, max) {
    return param.length >= min || param.length <= max;
}
//TODO use this validator or drop it
function emailValidator(email) {
    var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return email && reg.test(email);
}
// TODO improve the schema definition
var portalUserSchema = new mongoose.Schema({
    // username is in form of email as discussed; TODO email validator integration
    username: {
        type: String,
        required: true,
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
            required: true,
            trim: true
        },
        last: {
            type: String,
            required: true,
            trim: true
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
    affiliatedCompany: {
        type: String,
        required: true
    }
}, { collection: 'PortalUser' });
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
        if (err)
            return cb(err);
        cb(null, user);
    });
});
portalUserSchema.static('newPortalUser', function (data, cb) {
    var _this = this;
    var _cb = cb;
    bCrypt.genSalt(10, function (err, salt) {
        bCrypt.hash(data.username + new Date(), salt, function (err, hash) {
            // : any?
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
module.exports = mongoose.model('PortalUser', portalUserSchema);
