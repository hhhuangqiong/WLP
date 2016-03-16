### Steps to seed capabilities to Companies

1. Enter docker instance so that you can access the command line of WLP
2. cd to WLP folder
3. run the following command: `NODE_ENV=<env> npm run seed:capabilities`, please input corresponding node environment inside `<env>`
4. you should see success message like below: `Company <company name> of carrierId <company carrierId> has been updated with capabilities`

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
