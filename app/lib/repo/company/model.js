var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CompanySchema = (function (_super) {
    __extends(CompanySchema, _super);
    function CompanySchema() {
        _super.call(this, {
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
            supportedLanguages: {
                type: String,
                required: true
            },
            supportedDevices: {
                type: String,
                required: true
            }
        }, { collection: 'Company', strict: true });
    }
    return CompanySchema;
})(mongoose.Schema);
exports.CompanySchema = CompanySchema;
