import { expect } from 'chai';

export default function switchLanguage(selecter, lang) {
  expect(selecter).to.not.be.empty;
  expect(lang).to.not.be.empty;

  browser.selectByValue(selecter, lang);

  const value = browser.getValue(selecter);
  expect(value).to.equal(lang);
};
