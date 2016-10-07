# Service Provision

## Auto provisioning

Auto provisioning, has been partially implemented through version 1.9 of WLP. The
business logics of this feature is implemented in MPS, with WLP interacting with
MPS to allow M800 Admin or Reseller Customers to use this feature.

## Provision Preset

Provision Preset, is a provision options preset for company's who has reseller, i.e.
company creation, capabilities. It is used to restrict provision options that
Reseller can change.

Provision options specified in Provision preset are not changeable by reseller,
when they attempt to provision a child service.

Provision Preset is read from MPS by a convention (temporary),
```
  ResellerCarrierId = PresetId
```
i.e. Reseller Companies will use it's carrier id to query a preset from MPS. using
it to restrict configurable options from the user, in the backend.

## Manual Provision steps for Reseller Carrier

As the UI to enable M800 Admin to setup Reseller Provision Preset is not available.
This steps has to be done manually for the time being until the feature is ready.

### 1. Create a preset for a Reseller Company

First, you will need it's prepare the following

* `resellerCarrierId` - Use as the preset id, according to the convention mentioned above
* `presetOptions` - the provision restriction options for the reseller carrier.
For available options, see [MPS documentation](http://deploy.dev.maaii.com:9080/maaii-provisioning-service/latest/).

Then, make a `POST /preset/:resellerCarrierId` request to MPS. e.g.

```
POST /preset/ABCD HTTP/1.1
Host: deploy.dev.maaii.com:4005 # targeting MPS service
Content-Type: application/json
Cache-Control: no-cache

{
  "chargeWallet": "WALLET_COMPANY",
  "serviceType": "WHITE_LABEL",
  "smsc": {
    "sourceAddress": "1234567899",
    "servicePlanId": "whitelabel",
    "defaultRealm": "WhiteLabel",
    "needBilling": false
  },
  "billing": {
    "currency": 840,
    "offnetPackageId": 1
  },
  "capabilities": [
    "im", "im.im-to-sms", "call.onnet", "call.offnet", "push", "platform.ios", "platform.android", "verification.sms", "verification.ivr", "verification.mo", "verification.mt", "end-user.whitelist", "end-user.suspension"
  ]
}
```

Finally, to validate,
1. See if you get the preset by `GET /preset/:resellerCarrierId`.
2. Check if these applied fields are disabled in WLP Create Company View (if field is shown).


### 2. Create a reseller company in IAM

To create a company identity in IAM, you have to set the following values via the post request to IAM.
* `name` - Company name
* `country` - Company country which should be ISO-3661 2 letter country code e.g `HK`
* `timezone` - Company timezone [possible values in the list](https://github.com/dmfilipenko/timezones.json/blob/master/timezones.json) e.g `China Standard Time`
* `reseller` - true

For available options, see [IAM API documentation](http://deploy.dev.maaii.com:9080/maaii-identity-access-mgmt/api/latest/#api-company-PostCompany).

Create a company profile `POST /identity/companies`

```
POST /identity/companies HTTP/1.1
Host: deploy.dev.maaii.com:4004 # targeting IAM service
Content-Type: application/json
Cache-Control: no-cache

{
  "country": "HK",
  "name": "reseller company",
  "timezone": "China Standard Time",
  "reseller": true
}
```

```
Response:
{
    "id": "57cd52b11458cc0001bb54e9"
}
```

1. See if you get the company by `GET /identity/companies/:id`.

### 3. Create a reseller company admin role in IAM

All the values are fixed except the company id which is obtained above.

* `name` - `Admin`
* `service` - `wlp`
* `company` - the company id obtained above
* `permissions` - the whole permission list in the sample

Create a reseller company admin role `POST /access/roles`

```
POST /access/roles HTTP/1.1
Host: deploy.dev.maaii.com:4004 # targeting IAM service
Content-Type: application/json
Cache-Control: no-cache

{
  "name": "Admin",
  "company": "{$companyId}",
  "service": "wlp",
  "permissions":{
    "company": ["create", "update", "read", "delete"],
    "user": ["create", "update", "read", "delete"],
    "role": ["create", "update", "read", "delete"],
    "endUser": ["update", "read"],
    "generalOverview": ["read"],
    "topUp": ["read"],
    "vsf": ["read"],
    "call": ["read"],
    "im": ["read"],
    "sms": ["read"],
    "verificationSdk: ["read"],
    "whitelist": ["create", "update", "read", "delete"]
  }
}
```
Response will return 201 Created and the role data submitted

### 4. Create Provision Profile in MPS

Access the MPS mongodb and collection provisionings directly, insert into the provisionings Collection in the following format.

* `status` - `COMPLETE`
* `companyId` - the company id created above
* `carrierId` - the company carrierId
* `companyCode` - the company code
* `chargeWallet` - the charge wallet type, `WALLET_NONE`, `WALLET_COMPANY`, `WALLET_END_USER`, `WALLET_OCS_INTEGRATION`
* `capabilities` - the capabilities array for the provisioned company
* `serviceType` - the service kind, `WHITE_LABEL` or `SDK`
* `paymentMode` - the payment mode, `PRE_PAID` or `POST_PAID`
* `country` - the provision country
* `resellerCarrierId` - the parent carrierId who create this company. If not, it should be filled
 with root company carrier id.

The possible options for the values, see [IAM API documentation](http://deploy.dev.maaii.com:9080/maaii-identity-access-mgmt/api/latest/#api-company-PostCompany).

```
{
  "status": "COMPLETE",
  "profile": {
    "companyId": "{$companyId}",
    "carrierId": "{$carrierId}",
    "companyCode": "{$companyCode}",
    "chargeWallet": "WALLET_COMPANY",
    "capabilities": [
      "platform.ios",
      "platform.android",
      "call.onnet",
      "call.offnet",
      "im.im-to-sms",
      "im",
      "vsf"
    ],
    "serviceType": "WHITE_LABEL",
    "paymentMode": "PRE_PAID",
    "country": "HK",
    "resellerCarrierId": "maaiii.org"
  }
}
```

After creating company, roles in IAM and provision profile in MPS.

1. When login the root account in WLP, there is a new provision company on the top right managingCompanies section.
2. The created company will be listed in the company section under the resellerCarrierId.
3. Switch into reseller company, you can access and create in company section.
