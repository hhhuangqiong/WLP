import React, { PropTypes } from 'react';
import CompanyDetail, { CompanyDetailShape } from './CompanyDetail';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

const CompanyList = (props) => (
  <table className="table__list__item table__list__item--company">
    <thead>
      <tr>
        <th>
          <FormattedMessage id="companyName" defaultMessage="Company Name" />
        </th>
        <th>
          <FormattedMessage id="createDate" defaultMessage="Create Date" />
        </th>
        <th>
          <FormattedMessage id="paymentType" defaultMessage="Payment Type" />
        </th>
        <th>
          <FormattedMessage id="status" defaultMessage="Status" />
        </th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {props.companies.map((item, index) => (
        <CompanyDetail {...item} key={index} />
      ))}
    </tbody>
  </table>

);

CompanyList.propTypes = {
  intl: intlShape.isRequired,
  companies: PropTypes.arrayOf(CompanyDetailShape),
};

export default injectIntl(CompanyList);
