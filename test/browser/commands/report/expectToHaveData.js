import { expect } from 'chai';

import {
  PAGE_TRANSITION_TIMEOUT,
} from '../../lib/constants';

export default function expectToHaveData(rowClass) {
  return this
    .pause(PAGE_TRANSITION_TIMEOUT)
    .isExisting(rowClass)
    .then(isExisting => {
      expect(isExisting).to.be.true;

      return this
        .getText(rowClass)
        .then(text => {
          expect(text).to.not.be.empty;
        });
    });
}
