import React, { PropTypes } from 'react';
import moment from 'moment';

import * as dateLocale from '../../../utils/dateLocale';
import { SHORT_DATE_FORMAT } from '../../../utils/timeFormatter';
import {
  ACTIVE,
  INPROGRESS,
  SUSPENDED,
  UNKNOWN,
  CREATED,
  ERROR,
  UPDATING,
} from '../constants/status';

const CompanyDetail = (props) => {
  const { companyName, domain, createDate, status } = props;
  return (
    <tr key={companyName}>
      <td>{companyName}</td>
      <td>{domain}</td>
      <td>{dateLocale.format(moment(createDate), SHORT_DATE_FORMAT)}</td>
      {
        (() => {
          switch (status) {
            case ACTIVE:
              return (
                <td className="active">
                  <span className="circle-button green"></span>{status}
                </td>
              );
            case CREATED:
            case UPDATING:
            case INPROGRESS:
              return (
                <td className="in-progress">
                  <span className="circle-button blue"></span>{status}
                </td>
              );
            case ERROR:
            case SUSPENDED:
              return (
                <td className="suspended">
                  <span className="circle-button red"></span>{status}
                </td>
              );
            case UNKNOWN:
              return (
                <td className="unknown">
                  <span className="circle-button grey"></span>{status}
                </td>
              );
            default:
              return <td>{status}</td>;
          }
        })()
      }
    </tr>
  );
};

export const CompanyDetailShape = PropTypes.shape(CompanyDetail.propTypes);
CompanyDetail.propTypes = {
  companyName: PropTypes.string,
  domain: PropTypes.string,
  createDate: PropTypes.string,
  status: PropTypes.string,
};

export default CompanyDetail;
