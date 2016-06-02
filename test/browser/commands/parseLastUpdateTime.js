import moment from 'moment';
import { expect } from 'chai';

import {
  LAST_UPDATE_TIME_FORMAT
} from '../lib/constants';

export default function parseLastUpdateTime(lastUpdateTimeString) {
  const lastUpdateParts = lastUpdateTimeString.split('Data updated till:');

  expect(lastUpdateParts.length).to.equal(2);

  return moment(lastUpdateParts[1].trim(), LAST_UPDATE_TIME_FORMAT);
}
