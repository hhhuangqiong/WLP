import { expect } from 'chai';

import {
  WAIT_FOR_FETCHING_TIMEOUT,
} from '../../../lib/constants';

export default function validateAccountInfo(className, index = 0) {
  return this
    .getText(className)
    .then(dates => {
      const date = dates[index];

      return this
        .elements('.end-user-table-row')
        .then(({ value: elements }) => {
          const firstElement = elements[index].ELEMENT;

          return this
            .elementIdClick(firstElement)
            .pause(WAIT_FOR_FETCHING_TIMEOUT)
            .getText('.accordion__item__content')
            .then(accountDetails => {
              expect(accountDetails).to.include(date);
            });
        });
    })
}
