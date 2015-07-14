import moment from 'moment';
import config from '../../../config';

export default {
  fromTime: moment().subtract(2, 'day').startOf('day').format('L'),
  toTime: moment().endOf('day').format('L'),
  category: '',
  pageSize: config.PAGES.CALLS.PAGE_SIZE,
  pageIndex: 0,
  userNumber: ''
};
