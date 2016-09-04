import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';

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
  } = props;

  return (
    <div className="row">
        <div className="large-10 columns">
          <label>Status</label>
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
                <div className="suspended large-14 columns status">
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
};

export default injectIntl(StatusDisplay);