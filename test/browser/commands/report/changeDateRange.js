export default function changeDateRange() {
  this.click('.date-input-wrap');
  this.clickFirstAvailableDate();

  return this;
}
