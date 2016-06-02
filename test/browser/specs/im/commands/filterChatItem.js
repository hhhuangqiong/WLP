import { expect } from 'chai';

export default function filterChatItem(itemType) {
  browser.selectByValue('.top-bar-section__message-type-select', itemType);

  browser.waitForTableFetching();

  const messageType = browser.getAttribute('.im-message-type-text', 'data-im-message-type');

  const messageTypes = Array.isArray(messageType) ? messageType : [messageType];

  messageTypes.forEach(eachType => {
    expect(eachType).to.be.eql(itemType);
  });
}
