import mongoose = require('mongoose');

var portalUserSchema: mongoose.Schema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
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
                required: true
            },
            middle: {
                type: String
            },
            last: {
                type: String,
                required: true
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
            default: false
        },
        status: {
            type: String,
            required: true,
            default: 'inactive'
        },
        createAt: {
            type: Date,
            required: true
        },
        createBy: {
            type: Number,
            required: true
        },
        updateAt: {
            type: Date,
            required: true
        },
        updateBy: {
            type: Date,
            required: true
        }
    }, { collection: 'portalUser'}
);

export interface PortalUser extends mongoose.Document {
    _id: string;
    username: Array<string>;
    password: string;
    carrierDomains: Array<string>;
    createAt: string;
    createBy: number;
    updateAt: string;
    updateBy: number;

    hasCarrierDomain(carrierDomain: string): Boolean;
}

portalUserSchema.method('hasCarrierDomain', function(carrierDomain: string) {
    for (var i in this.carrierDomains) {
        if (this.carrierDomains(i) == carrierDomain) {
            return true;
        }
    }

    return false;
});

export interface PortalUserModel extends mongoose.Model<PortalUser> {
    findByName(name, cb);
}

portalUserSchema.static('findByName', function(name: string, cb: any) {
    this.find({ name: new RegExp(name, 'i') }, cb);
});

export var PortalModel = <PortalUserModel>mongoose.model('PortalUser', portalUserSchema);
