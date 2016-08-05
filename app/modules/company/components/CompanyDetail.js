import React, { PropTypes } from 'react';
import { ACTIVE, INPROGRESS, SUSPENDED, UNKNOWN } from '../constants/status';


const CompanyDetail = (props) => {
  const { companyName, domain, createDate, status } = props;
  return (
    <tr>
      <td>{companyName}</td>
      <td>{domain}</td>
      <td>{createDate}</td>
      {
        (() => {
          switch (status) {
            case ACTIVE:
              return (
                <td className="active">
                  <span className="circle-button green"></span>{status}
                </td>
              );
            case INPROGRESS:
              return (
                <td className="in-progress">
                  <span className="circle-button blue"></span>{status}
                </td>
              );
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
