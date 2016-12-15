export default {
  IM: {
    DATA_FIELDS: [
      'type', 'message_type', 'message_size', 'sender',
      'origin', 'recipient', 'recipients', 'destination', 'platform',
      'stanza_type', 'resource_id', 'theme', 'resource', 'region',
      'file_size', 'thread', 'stanza_id', 'timestamp', 'device_id',
      'receive_id',
    ],
    EXPORT_REQUEST: 'ImRequest',
    EXPORT_REQUEST_EXECUTION: 'getImSolr',
    EXPORT_FILENAME: 'export_im.csv',
  },
  CALLS: {
    DATA_FIELDS: [
      'call_id', 'caller', 'callee', 'type', 'start_time',
      'end_time', 'answer_time', 'duration', 'last_response_code',
      'caller_os_version', 'callee_os_version', 'bye_reason',
      'caller_platform', 'callee_platform', 'caller_hardware_identifier',
      'callee_hardware_identifier', 'source_country_tel_code', 'target_country_tel_code',
      'caller_bundle_id', 'sip_trunk', 'release_party',
    ],
    EXPORT_REQUEST: 'CallsRequest',
    EXPORT_REQUEST_EXECUTION: 'getCalls',
    EXPORT_FILENAME: 'export_calls_usage.csv',
  },
  SMS: {
    DATA_FIELDS: [
      'id', 'carrier', 'charged_amount', 'country', 'destination_address_inbound',
      'origin_interface', 'outgoing_interface', 'request_date', 'response_date',
      'segment_count', 'sms_server_msg_id', 'source_address_inbound', 'status',
      'type', 'type2',
    ],
    EXPORT_REQUEST: 'SmsRequest',
    EXPORT_REQUEST_EXECUTION: 'getSms',
    EXPORT_FILENAME: 'export_sms.csv',
  },
  CALLS_COST: {
    DATA_FIELDS: [
      'ID', 'hey', 'USERID', 'WALLETID', 'VC2SID',
      'VC2CALLING', 'VC2REQUESTED', 'VC2CALLED', 'DATBEGIN',
      'DATEND', 'NUMSECONDS', 'NUMMINUTES', 'NUMCAUSECODE', 'NUMCURRENCYCODE', 'NUMCOST',
      'DATCREATE', 'NUMISCHILD', 'NUMCALLTYPE',
    ],
    EXPORT_REQUEST: 'OcsClient',
    EXPORT_REQUEST_EXECUTION: 'getCallsCost',
    EXPORT_FILENAME: 'export_calls_retail_price.csv',
  },
  VERIFICATION: {
    DATA_FIELDS: [
      'application_id', 'application_key', 'cellular_subscriber_id', 'country',
      'current_mcc', 'current_mnc', 'custom', 'developer_key', 'device_id',
      'start_time', 'end_time', 'hardware_identifier', 'home_mcc', 'home_mnc',
      'os_version', 'phone_number', 'platform', 'reason_message', 'request_id',
      'sdk_version', 'source_country', 'source_ip', 'success', 'type',
    ],
    EXPORT_REQUEST: 'VerificationRequest',
    EXPORT_REQUEST_EXECUTION: 'getVerifications',
    EXPORT_FILENAME: 'export_verification.csv',
  },
  END_USER: {
    DATA_FIELDS: [
      'displayName', 'username', 'creationDate', 'accountStatus', 'platform', 'deviceModel',
      'appBundleId', 'appVersionNumber',
    ],
    EXPORT_REQUEST: 'EndUserRequest',
    EXPORT_REQUEST_EXECUTION: 'getExportUsers',
    EXPORT_FILENAME: 'export_users.csv',
  },
};
