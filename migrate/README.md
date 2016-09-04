# White Label Portal Database Migration scripts

This script will migrate the mongodb data from existing one to the new one.

In the WLP 1.9, it will apply the new database structure and data from IAM(Identity Access Management) and MPS(Maaii Provisioning Service)

## Objective
Original data in the WLP will move to IAM/MPS by this script.
It will transfer the data format and information.

Company will be separated into 2 parts, company identity(IAM) and company provision(MPS). The front one will store the identity information like country, timezone and name. The later one will store the capabilities and service information like paymentMode, serviceType(SDK), capabilities (like vsf, platform.android).

At the end, the portal user(WLP) will become IAM User. It expects the user can login with the same email and password.

Company information will be the same in the MPS and IAM. Each company will also has a admin role by default. It will grant with all the permission.

And users who originally assignedGroup as root will be automatically granted with admin role.

## Flow

1. Export the origin data from current mongodb   
It will export the current company, portal user account and update the format in the build directory. It will also download the company logo files.

2. Import the data into the IAM mongodb and MPS mongodb  
It will import the data from build directory. It will import the company information,


## Usage
The migration is written in nodejs.

#### prerequisite

[Node 6 Environment](https://nodejs.org/en/download/)

### config
config.json in the the root directory

`export.mongo.uri` - the current WLP portal mongo db address  
`import.iam.mongo.uri` - the new IAM mongo db address  
`import.mps.mongo.uri` - the new MPS mongo db address  
`export.buildDir` - the directory temporary store the exported data and images.  

```
{
  "export": {
    "mongo":{
      "uri": "mongodb://deploy.dev.maaii.com:27018/m800-whitelabel-portal",
      "options": {}
    },
    "buildDir": "./build"
  },
  "import": {
    "iam": {
      "mongo": {
        "uri": "mongodb://deploy.dev.maaii.com:27018/maaii-identity-access-mgmt-test",
        "options": {}
      }
    },
    "mps": {
      "mongo": {
        "uri": "mongodb://deploy.dev.maaii.com:27018/maaii-provisioning-service-test",
        "options": {}
      }
    }
  }
}
```

### Get Started / Steps

1. Configure the `config.json`
2. In the terminal, run `npm run migrate`

In the terminal, it will show the current status, here is the sample output.

```
info: [Export]Connect to database mongodb://deploy.dev.maaii.com:27018/m800-whitelabel-portal
info: ====================================================================
info: [Export]Start export company
info: [Export]Start fetching the companies
info: [Export]Done fetching the companies with 12 records
...
info: [Export]Done export company
info: ====================================================================
info: [Export]Start export users
info: [Export]Start fetching the users
info: [Export]Done fetching the users with 11 records
info: [Export]Formatting new User admin@demo-verify.maaiii-api.org
...
info: [Export]Done export users
info: ====================================================================
info: [Export]Finish export task

info: [Import]Connect to IAM database mongodb://deploy.dev.maaii.com:27018/maaii-identity-access-mgmt
info: [Import]Connect to MPS database mongodb://deploy.dev.maaii.com:27018/maaii-provisioning-service
info: [Import]Start import companies
info: [Import]loading the companies
info: [Import]inserting the companies
info: [Import]Done import companies
info: ====================================================================
info: [Import]Start import the provisions
info: [Import]loading the provisions
info: [Import]inserting the provisions
info: [Import]Done import the provisions
info: ====================================================================
info: [Import]Start import users
info: [Import]loading the users
info: [Import]inserting the users
info: [Import]Done import users
info: ====================================================================
info: [Import]Finish import task
```

### FAQ

1. Fail to import due to duplicate data  
Migration script won't remove/edit the original data. It will only export the data and format into the new style. All to do is insert the new data. It is not suggested do import more than once since it may conflict with the previous data.
```
error: [Import]Fail to import data MongoError: E11000 duplicate key error index: maaii-identity-access-mgmt.Company.$_id_ dup key: { : ObjectId('5799e2b58149bef30dd10c71') }
    at Function.MongoError.create (/Users/thomas1lee/Documents/git/m800-white-label-portal/build/migrateScript/node_modules/mongodb-core/lib/error.js:31:11)
    at toError (/Users/thomas1lee/Documents/git/m800-white-label-portal/build/migrateScript/node_modules/mongodb/lib/utils.js:114:22)
```

2. How to debug and trace ?  
Since migration has two steps, export and import. You may check the data in the build directory for the exported data. It will be the data pending for the import task. So please check if the original data is correct or not.  
Also you can directly access the mongodb to validate the data. It will update the Company, User and Role in IMA and provisioning in MPS.

### Reference
Capabilities migration https://issuetracking.maaii.com:9443/pages/viewpage.action?pageId=19663526#MaaiiProvisioningService(MPS)-Migrationonthecapabilities
