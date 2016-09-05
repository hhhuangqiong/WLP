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

### Create a preset for a Reseller Company

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
  "paymentMode": "POST_PAID",
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
    "im", "im.im-to-sms", "call.onnet", "call.offnet", "push", "platform.ios", "platform.android", "verification.sms", "verification.ivr", "verification.mo", "verification.mt"
  ]
}
```

Finally, to validate,
1. See if you get the preset by `GET /preset/:resellerCarrierId`.
2. Check if these applied fields are disabled in WLP Create Company View (if field is shown).
