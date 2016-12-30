import React, { PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import {
  COMPLETE,
  INPROGRESS,
  UNKNOWN,
  CREATED,
  ERROR,
  UPDATING,
  STATUS,
} from '../constants/status';

const StatusDisplay = (props) => {
  const {
    status,
    intl: { formatMessage },
    handleOpenErrorDialog,
  } = props;

  return (
    <div className="row">
        <div className="large-10 columns">
          <label>
            <FormattedMessage id="status" defaultMessage="Status" />
          </label>
        </div>
       {
        (() => {
          switch (status) {
            case COMPLETE:
              return (
                <div className="complete large-14 columns status">
                  <span className="circle-button green"></span>{formatMessage(STATUS[status])}
                </div>
              );
            case CREATED:
            case UPDATING:
            case INPROGRESS:
              return (
                <div className="in-progress large-14 columns status">
                  <span className="circle-button blue"></span>{formatMessage(STATUS[status])}
                </div>
              );
            case ERROR:
              return (
                <div className="status-error large-14 columns status"
                  onClick={handleOpenErrorDialog}
                >
                  <span className="circle-button red"></span>{formatMessage(STATUS[status])}
                </div>
              );
            case UNKNOWN:
              return (
                <div className="unknown large-14 columns status">
                  <span className="circle-button grey"></span>{formatMessage(STATUS[status])}
                </div>
              );
            default:
              return <div>{status}</div>;
          }
        })()
      }
  </div>

  );
};

StatusDisplay.propTypes = {
  status: PropTypes.string,
  intl: intlShape.isRequired,
  handleOpenErrorDialog: PropTypes.func,
};

export default injectIntl(StatusDisplay);
