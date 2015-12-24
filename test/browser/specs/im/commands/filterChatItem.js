import { expect } from 'chai';

import {
  WAIT_FOR_FETCHING_TIMEOUT,
} from '../../../lib/constants';

export default function filterChatItem(itemType, itemText) {
  return this
    .pause(WAIT_FOR_FETCHING_TIMEOUT)
    .selectByValue('.top-bar-section__message-type-select', itemType)
    .pause(WAIT_FOR_FETCHING_TIMEOUT)
    .pause(WAIT_FOR_FETCHING_TIMEOUT)
    .pause(WAIT_FOR_FETCHING_TIMEOUT)
    .getText('.im-message-type-text')
    .then(messageTypes => {
      messageTypes.forEach(messageType => {
        expect(messageType).to.be.eql(itemText || itemType);
      });
    });
}
