import { expect } from 'chai';

export default function filterVisualItem(itemType) {
  // click the button by item type
  browser.click(`.icon-${itemType}.vsf-type-filtering`);
  browser.waitForTableFetching();

  expect(browser.isVisible(`.icon-${itemType}.vsf-type-filtering--active`)).to.be.true;

  // validate items that should align with selected item type
  const virtualItemsClasses = browser.getAttribute('.data-table__virtual-item', 'class');

  if (Array.isArray(virtualItemsClasses)) {
    virtualItemsClasses.forEach(vistualItemClasses => {
      expect(vistualItemClasses.indexOf(`icon-${itemType}`) > -1).to.be.true;
    });
  }

  // unclick the button
  browser.click(`.icon-${itemType}.vsf-type-filtering--active`);
  browser.waitForTableFetching();

  expect(browser.isVisible(`.icon-${itemType}.vsf-type-filtering--active`)).to.be.false;
}
