import { expect } from 'chai';

export default function filterVisualItem(itemType) {
  // click the button by item type
  this.click(`.icon-${itemType}.vsf-type-filtering`);
  this.waitForTableFetching();

  expect(this.isVisible(`.icon-${itemType}.vsf-type-filtering--active`)).to.be.true;

  // validate items that should align with selected item type
  const virtualItemsClasses = this.getAttribute('.data-table__virtual-item', 'class');

  if (Array.isArray(virtualItemsClasses)) {
    virtualItemsClasses.forEach(vistualItemClasses => {
      expect(vistualItemClasses.indexOf(`icon-${itemType}`) > -1).to.be.true;
    });
  }

  // unclick the button
  this.click(`.icon-${itemType}.vsf-type-filtering--active`);
  this.waitForTableFetching();

  expect(this.isVisible(`.icon-${itemType}.vsf-type-filtering--active`)).to.be.false;

  return this;
}
