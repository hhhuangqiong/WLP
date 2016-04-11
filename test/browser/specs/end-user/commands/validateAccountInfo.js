import { expect } from 'chai';

export default function validateAccountInfo(className, index = 0) {
  // pick a date from the table
  const dates = this.getText(className);
  const date = Array.isArray(dates) ? dates[index] : dates;

  // click the row by index
  const elements = this.elements('.end-user-table-row').value;
  const firstElement = Array.isArray(elements) ? elements[index].ELEMENT : elements.ELEMENT;

  this.elementIdClick(firstElement);

  // expect the sidebar contain the same date as selected above
  const createdTime = this.getText('.end-user-info__created-time');
  expect(createdTime).to.include(date);

  return this;
}
