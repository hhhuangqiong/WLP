export default function goToDetails(section) {
  return this
    .waitUntil(function waitUntil() {
      return this
        .isVisible('a=Details Report')
        .then(isVisible => isVisible);
    })
    .click('a=Details Report');
}
