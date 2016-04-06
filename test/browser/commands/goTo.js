import { expect } from 'chai';

export default function goTo(section) {
  this.waitForExist(`.mainmenu-section-name=${section}`);
  this.moveToObject(`.mainmenu-section-name=${section}`);
  this.click(`.mainmenu-section-name=${section}`);

  // the navigation element should become active after triggering the click event
  const activeElementsText = this
    .elements('.mainmenu-bar__item.active .mainmenu-section-name')
    .value
    .map(value => value.ELEMENT)
    .map(elementId => this.elementIdText(elementId).value);

  const hasResult = activeElementsText.some(elementText => elementText === section);
  expect(hasResult).to.not.be.undefined;

  return this;
}
