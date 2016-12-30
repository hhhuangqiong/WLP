import React, { PropTypes } from 'react';
import moment from 'moment';
import { isString } from 'lodash';
import { injectIntl, intlShape } from 'react-intl';

import * as dateLocale from '../../../utils/dateLocale';
import { SHORT_DATE_FORMAT } from '../../../utils/timeFormatter';
import {
  COMPLETE,
  INPROGRESS,
  UNKNOWN,
  CREATED,
  ERROR,
  UPDATING,
  STATUS,
} from '../constants/status';
import { MESSAGES, PAYMENT_TYPE, WALLET_TYPE } from '../constants/companyOptions';

const CompanyDetail = (props, context) => {
  const { identity } = context.params;
  const {
    id,
    carrierId,
    companyName,
    paymentType,
    chargeWallet,
    createDate,
    status,
    intl: { formatMessage },
  } = props;
  const isWalletVisible = paymentType === PAYMENT_TYPE.PRE_PAID &&
    // TODO: remove is string condition when charge wallet is added to the API
    (!isString(chargeWallet) || chargeWallet === WALLET_TYPE.COMPANY);
  return (
    <tr key={companyName}>
      <td>{companyName}</td>
      <td>{dateLocale.format(moment(createDate), SHORT_DATE_FORMAT)}</td>
      <td>{formatMessage(paymentType === PAYMENT_TYPE.PRE_PAID ? MESSAGES.prePaid : MESSAGES.postPaid)}</td>
      {
        (() => {
          switch (status) {
            case COMPLETE:
              return (
                <td className="complete">
                  <span className="circle-button green"></span>{formatMessage(STATUS[status])}
                </td>
              );
            case CREATED:
            case UPDATING:
            case INPROGRESS:
              return (
                <td className="in-progress">
                  <span className="circle-button blue"></span>{formatMessage(STATUS[status])}
                </td>
              );
            case ERROR:
              return (
                <td className="status-error">
                  <span className="circle-button red"></span>{formatMessage(STATUS[status])}
                </td>
              );
            case UNKNOWN:
              return (
                <td className="unknown">
                  <span className="circle-button grey"></span>{formatMessage(STATUS[status])}
                </td>
              );
            default:
              return <td>{status}</td>;
          }
        })()
      }
      <td>
        <div className="company-sidebar__list__item__links">
          <button className="button--secondary" onClick={() => context.router.push(`/${identity}/company/${id}/edit`)}>
            {formatMessage(MESSAGES.details)}
          </button>
          <If condition={isWalletVisible}>
            <button className="button--secondary" onClick={() => context.router.push(`/${identity}/company/${carrierId}/wallet`)}>
              {formatMessage(MESSAGES.wallet)}
            </button>
          </If>
        </div>
      </td>
    </tr>
  );
};

export const CompanyDetailShape = PropTypes.shape(CompanyDetail.propTypes);
CompanyDetail.propTypes = {
  intl: intlShape.isRequired,
  id: PropTypes.string.isRequired,
  companyName: PropTypes.string.isRequired,
  paymentType: PropTypes.string.isRequired,
  chargeWallet: PropTypes.string,
  carrierId: PropTypes.string,
  createDate: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
};
CompanyDetail.contextTypes = {
  params: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};
export default injectIntl(CompanyDetail);
