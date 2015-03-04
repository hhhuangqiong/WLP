var moment = require('moment');

export default function() {
  return {
    DEFAULT_DATE: moment().format('L')
  }
}
