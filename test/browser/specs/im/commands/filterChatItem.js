import { expect } from 'chai';

export default function filterChatItem(itemType, itemText) {
  this.selectByValue('.top-bar-section__message-type-select', itemType);

  this.waitForTableFetching();

  const messageTypes = this.getText('.im-message-type-text');

  if (Array.isArray(messageTypes)) {
    messageTypes.forEach(messageType => {
      expect(messageType).to.be.eql(itemText || itemType);
    });
  } else {
    expect(messageTypes).to.be.eql(itemText || itemType);
  }

  return this;
}
