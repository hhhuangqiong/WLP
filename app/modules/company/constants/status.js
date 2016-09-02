import { defineMessages } from 'react-intl';

export const COMPLETE = 'COMPLETE';
export const INPROGRESS = 'IN_PROGRESS';
export const ERROR = 'ERROR';
export const UPDATING = 'UPDATING';
export const CREATED = 'CREATED';
export const UNKNOWN = 'Unknown';
export const STATUS = defineMessages({
  COMPLETE: {
    id: 'COMPLETE',
    defaultMessage: 'COMPLETE',
  },
  IN_PROGRESS: {
    id: 'INPROGRESS',
    defaultMessage: 'IN_PROGRESS',
  },
  ERROR: {
    id: 'ERROR',
    defaultMessage: 'ERROR',
  },
  UPDATING: {
    id: 'UPDATING',
    defaultMessage: 'UPDATING',
  },
  CREATED: {
    id: 'CREATED',
    defaultMessage: 'CREATED',
  },
  UNKNOWN: {
    id: 'UNKNOWN',
    defaultMessage: 'UNKNOWN',
  },
});
