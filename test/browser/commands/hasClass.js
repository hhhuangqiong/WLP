export default function hasClass(selector, className) {
  const classNames = browser.getAttribute(selector, 'class');
  return classNames.includes(className);
}
