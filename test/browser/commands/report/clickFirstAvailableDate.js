export default function clickFirstAvailableDate() {
  const text = this.getText('.datepicker__day');

  if (!text) {
    return this;
  }

  const firstAvailableDate = text.find(el => el.match(/\d+/g));

  this.click(`div.datepicker__day=${firstAvailableDate}`);

  return this;
}
