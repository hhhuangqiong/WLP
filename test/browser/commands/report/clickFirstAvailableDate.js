export default function clickFirstAvailableDate() {
  const text = browser.getText('.datepicker__day');

  if (!text) {
    return browser;
  }

  const firstAvailableDate = text.find(el => el.match(/\d+/g));

  browser.click(`div.datepicker__day=${firstAvailableDate}`);
}
