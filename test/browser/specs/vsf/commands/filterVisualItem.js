import { expect } from 'chai';

import {
  PAGE_TRANSITION_TIMEOUT,
} from '../../../lib/constants';

export default function filterVisualItem(itemType) {
  let originLength = 0;

  return this
    .pause(PAGE_TRANSITION_TIMEOUT) /* Wait until data to be injected to the view before click */
    .click(`.icon-${itemType}.vsf-type-filtering`)
    .pause(PAGE_TRANSITION_TIMEOUT) /* Wait until data to be updated after certain selection */
    .getHTML(`.icon-${itemType}.icon-virtual-item`)
    .then(elementBeforeClick => {
      originLength = elementBeforeClick.length;

      return this
        .click(`.icon-${itemType}.vsf-type-filtering`)
        .pause(PAGE_TRANSITION_TIMEOUT)
        .getHTML(`.icon-${itemType}.icon-virtual-item`)
        .then(elementAfterClick => {
          expect(elementAfterClick.length <= originLength).to.be.true;
        });
    });
}
