### Steps to seed capabilities to Companies

This is now an operational process, and it **MUST NOT** be done via project scripts.

**IMPORTANT:** script `npm run seed:capabilities` is deprecated

**DO NOT** run `npm run seed:capabilties` or all the changes made towards `capabilties` field in `Company` collection directly on mongoDB admin client **WILL BE ERASED**.

1. log into the mongoDB admin client;
2. go to the Mongo Document with the carrierId you want to edit;
3. edit the `capabilities` field;
4. save the changes;

### Capabilities combinations

Page / Feature | Key
--- | ---
overview | **NOT containing** 'service.sdk'
end user | 'end-user'
call | 'call'
im | 'im'
sms | 'service.white_label', 'im.im_to_sms', 'sms'
vsf | 'service.white_label', 'vsf'
top up | 'service.white_label', 'wallet'
verification | 'service.sdk', 'verification-sdk'

### Capabilities details

Remarks: Except for "Serivce type", all other features are assumed to be OFF

|     Category     |            Name           |                         Description                         |
|:----------------:|:-------------------------:|:-----------------------------------------------------------:|
|      Service     | service.white_label       |                                                             |
|                  | service.sdk               |                                                             |
|      Device      | device.ios                | Allow to filter iOS data only                               |
|                  | device.android            | Allow to filter Android data only                           |
|    Portal User   | sign_up.flow.standard     | Allow to go through a standard sign up flow                 |
|                  | sign_up.flow.customized   | Allow to go through a customized sign up flow               |
|                  | sign_up.verification.ivr  |                                                             |
|                  | sign_up.verification.sms  |                                                             |
|                  | sign_up.verification.none |                                                             |
|     End User     | end-user                  | Allow all functions under end-user to be accessible         |
|       Call       | call.onnet_call           | Allow to filter call's data by onnet call toggle            |
|                  | call.offnet_call          | Allow to filter call's data by offnet call toggle           |
|                  | call                      | Allow all functions under call to be accessible             |
|        IM        | im.im_to_sms              |                                                             |
|                  | im.client_to_client       |                                                             |
|                  | im.server_to_client       |                                                             |
|                  | im.client_to_server       |                                                             |
|                  | im                        | Allow all functions under im to be accessible               |
|        SMS       | sms                       | Allow all functions under sms to be accessible              |
|        VSF       | vsf.item.sticker          | Allow to filter vsf's data by sticker toggle                |
|                  | vsf.item.animation        | Allow to filter vsf's data by animation toggle              |
|                  | vsf.item.audio_effect     | Allow to filter vsf's data by audio toggle                  |
|                  | vsf.item.credit           | Allow to filter vsf's data by credit toggle                 |
|                  | vsf.item.customized       |                                                             |
|                  | vsf                       | Allow all functions under vsf to be accessible              |
|      Top Up      | top_up                    | Allow all functions under top_up to be accessible           |
| Verification SDK | verification-sdk          | Allow all functions under verification-sdk to be accessible |
|                  | verification-sdk.mt       |                                                             |
|                  | verification-sdk.mo       |                                                             |
|                  | verification-sdk.sms      |                                                             |
|                  | verification-sdk.ivr      |                                                             |
|                  | verification-sdk.report   | Allow to export verification sdk's data into CSV format     |
|      Wallet      | wallet.none               |                                                             |
|                  | wallet.single             |                                                             |
|                  | wallet.multiple           |                                                             |
|                  | wallet.shared             |                                                             |
|                  | wallet                    | Allow all functions under wallet to be accessible           |
|                  |                           |                                                             |

### Company (Carrier) details

Details:

*Remarks*: keys not listed in the table below are not taken into effect.

Key | Type | Description | Exmaple Value
--- | --- | --- | ---
name | String | display name of the carrier | "Maaii"
carrierId | String | carrierId of the carrier | "maaii.com"
country | String | location the carrier bases at | "Hong Kong"
parentCompany | ObjectId | objectId of another *Company* document | ObjectId("570df15165eb2fca51268f72")
status | String | status of the carrier on WLP | "active"
capabilities | Array(String) |  | [ "service.sdk", "call" ]
reseller | Boolean |  | false
createAt | Date |  | new Date(1460531537617)
createBy | ObjectId | ObjectId of a *PortalUser* document | ObjectId("570df15165eb2fca51268f72")
updateAt | Date |  | new Date(1460531537617)
updateBy | ObjectId | ObjectId of a *PortalUser* document | ObjectId("570df15165eb2fca51268f72")

Schema:

```
  parentCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  carrierId: {
    type: String,
    unique: true,
  },

  // reflecting Company Type, either "Default" or "Reseller"
  reseller: {
    type: Boolean,
  },
  logo: {
    type: mongoose.Schema.Types.ObjectId,
  },
  themeType: {
    type: String,
  },
  address: {
    type: String,
  },
  categoryID: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  timezone: {
    type: String,
    required: true,
  },
  accountManager: {
    type: String,
  },
  billCode: {
    type: String,
  },
  expectedServiceDate: {
    type: Date,
  },
  contractNumber: {
    type: String,
  },
  referenceNumber: {
    type: String,
  },
  features: {
    type: Object,
    default: [],
  },
  businessContact: {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  technicalContact: {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  supportContact: {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  widgets: {
    overview: [],
    stores: [],
    calls: [],
    im: [],
    sms: [],
    vsf: [],
  },
  serviceConfig: {
    developerKey: {
      type: String,
    },
    developerSecret: {
      type: String,
    },
    applicationId: {
      type: String,
    },
    applications: {
      ios: {
        name: {
          type: String,
          default: null,
        },
      },
      android: {
        name: {
          type: String,
          default: null,
        },
      },
    },
  },
  status: {
    type: String,
    required: true,
    default: 'inactive',
  },
  capabilities: {
    type: Array,
    default: [],
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  createBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PortalUser',
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  updateBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PortalUser',
  }
```