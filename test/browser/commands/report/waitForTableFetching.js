import {
  WAIT_FOR_FETCHING_TIMEOUT,
} from '../../lib/constants';

import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_ERROR,
  UI_STATE_NORMAL,
} from '../../../../app/main/constants/uiState';

export default function waitForTableFetching() {
  if (this.isVisible(`.data-table tbody.${UI_STATE_LOADING}`)) {
    // wait until UI state become normal/empty/error
    /* eslint-disable max-len */
    this.waitForVisible(
      `.data-table tbody.${UI_STATE_NORMAL}, .data-table tbody.${UI_STATE_EMPTY}, .data-table tbody.${UI_STATE_ERROR}`,
      WAIT_FOR_FETCHING_TIMEOUT
    );
    /* eslint-enable */
  }

  return this;
}
