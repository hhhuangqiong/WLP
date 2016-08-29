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

const CompanyDetail = (props, context) => {
  const { identity } = context.params;
  const { id, companyName, domain, createDate, status } = props;
  return (
    <tr key={companyName} onClick={() => context.router.push(`/${identity}/company/${id}/edit`)}>
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
  id: PropTypes.string.isRequired,
  companyName: PropTypes.string.isRequired,
  domain: PropTypes.string.isRequired,
  createDate: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
};
CompanyDetail.contextTypes = {
  params: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};
export default CompanyDetail;
