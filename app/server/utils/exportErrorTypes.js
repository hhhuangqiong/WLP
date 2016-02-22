export const JOB_FAILED_ERROR = {
  status: 500,
  message: 'Kue job failed at',
};

export const GET_JOB_ERROR = {
  status: 400,
  message: 'Failed to get Kue job',
};

export const REQUEST_VALIDATION_ERROR = {
  status: 400,
  message: 'Failed to validate request',
};

export const FILE_STREAM_ERROR = {
  status: 400,
  message: 'File stream error',
};

export const INCOMPELETE_JOB_ERROR = {
  status: 204,
  message: 'Job progress is incomplete',
};
