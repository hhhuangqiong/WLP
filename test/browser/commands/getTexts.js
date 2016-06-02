import { expect } from 'chai';

// treat all data structure as the same for easier data checking and handling
export default function getTexts(selector) {
  const data = browser.getText(selector);

  expect(data).to.not.be.undefined;

  if (Array.isArray(data)) {
    return data;
  }

  return [data];
}
