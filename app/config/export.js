export default {
  IM: {
    DATA_FIELDS: [
      'type', 'message_type', 'message_size', 'sender',
      'origin', 'recipient', 'recipients', 'destination', 'platform',
      'stanza_type', 'resource_id', 'theme', 'resource', 'region',
      'file_size', 'thread', 'stanza_id', 'timestamp', 'device_id',
      'receive_id'
    ],
    EXPORT_REQUEST: 'ImRequest',
    EXPORT_REQUEST_EXECUTION: 'getImSolr',
    EXPORT_FILENAME: 'export_im.csv'
  },
  CALLS: {
    DATA_FIELDS: [
      'call_id', 'caller', 'callee', 'type', 'start_time',
      'end_time', 'answer_time', 'duration', 'last_response_code',
      'caller_os_version', 'callee_os_version', 'bye_reason',
      'caller_platform', 'callee_platform', 'caller_hardware_identifier',
      'callee_hardware_identifier', 'caller_country', 'callee_country',
      'caller_bundle_id', 'sip_trunk'
    ],
    EXPORT_REQUEST: 'CallsRequest',
    EXPORT_REQUEST_EXECUTION: 'getCalls',
    EXPORT_FILENAME: 'export_calls.csv'
  },
  VERIFICATION: {
    DATA_FIELDS: [
      'application_id', 'application_key', 'cellular_subscriber_id', 'country',
      'current_mcc', 'current_mnc', 'custom', 'developer_key', 'device_id',
      'start_time', 'end_time', 'hardware_identifier', 'home_mcc', 'home_mnc',
      'os_version', 'phone_number', 'platform', 'reason_message', 'request_id',
      'sdk_version', 'source_country', 'source_ip', 'success', 'type'
    ],
    EXPORT_REQUEST: 'VerificationRequest',
    EXPORT_REQUEST_EXECUTION: 'getVerifications',
    EXPORT_FILENAME: 'export_verification.csv'
  },
  END_USER: {
    DATA_FIELDS: [
      'username', 'creationDate', 'accountStatus', 'platform', 'deviceModel',
      'appBundleId', 'appVersionNumber'
    ],
    EXPORT_REQUEST: 'EndUserRequest',
    EXPORT_REQUEST_EXECUTION: 'getExportUsers',
    EXPORT_FILENAME: 'export_users.csv'
  },
}
