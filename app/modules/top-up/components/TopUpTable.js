import { first, isEmpty, isNull } from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import React, { PropTypes } from 'react';
import Tooltip from 'rc-tooltip';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import EmptyRow from '../../../modules/data-table/components/EmptyRow';
import Pagination from '../../../modules/data-table/components/Pagination';
import TableHeader from '../../../modules/data-table/components/TableHeader';
import Icon from '../../../main/components/Icon';

import config from './../../../main/config';

import Currency from '../../../main/components/Currency';

import * as dateLocale from '../../../utils/dateLocale';

const { displayDateFormat: DATE_FORMAT } = config;

const MESSAGES = defineMessages({
  dateAndTime: {
    id: 'details.dateAndTime',
    defaultMessage: 'Date & Time',
  },
  mobile: {
    id: 'mobile',
    defaultMessage: 'Mobile',
  },
  wallet: {
    id: 'wallet',
    defaultMessage: 'Wallet',
  },
  type: {
    id: 'type',
    defaultMessage: 'Type',
  },
  amount: {
    id: 'amount',
    defaultMessage: 'Amount',
  },
  remark: {
    id: 'remark',
    defaultMessage: 'Remark',
  },
  creditAppStore: {
    id: 'creditAppStore',
    defaultMessage: 'Credit AppStore',
  },
  creditGooglePlay: {
    id: 'topUp.details.creditGooglePlay',
    defaultMessage: 'Credit GooglePlay',
  },
  stickerAppStore: {
    id: 'topUp.details.stickerAppStore',
    defaultMessage: 'Sticker AppStore',
  },
  stickerGooglePlay: {
    id: 'topUp.details.stickerGooglePlay',
    defaultMessage: 'Sticker GooglePlay',
  },
  creditCard: {
    id: 'topUp.details.creditCard',
    defaultMessage: 'CreditCard',
  },
  payPal: {
    id: 'topUp.details.payPal',
    defaultMessage: 'PayPal',
  },
  freeVoucher: {
    id: 'topUp.details.freeVoucher',
    defaultMessage: 'FreeVoucher',
  },
  paidVoucher: {
    id: 'topUp.details.paidVoucher',
    defaultMessage: 'PaidVoucher',
  },
  universalVoucher: {
    id: 'topUp.details.universalVoucher',
    defaultMessage: 'UniversalVoucher',
  },
  promotional: {
    id: 'topUp.details.promotional',
    defaultMessage: 'Promotional',
  },
  inviteByFacebook: {
    id: 'topUp.details.inviteByFacebook',
    defaultMessage: 'Invite by Facebook',
  },
  inviteBySMS: {
    id: 'topUp.details.inviteBySMS',
    defaultMessage: 'Invite by SMS',
  },
  inviteByTwitter: {
    id: 'topUp.details.inviteByTwitter',
    defaultMessage: 'Invite by Twitter',
  },
  inviteByWeibo: {
    id: 'topUp.details.inviteByWeibo',
    defaultMessage: 'Invite by Weibo',
  },
  inviteByEmail: {
    id: 'topUp.details.inviteByEmail',
    defaultMessage: 'Invite by Email',
  },
  rateUs: {
    id: 'topUp.details.rateUs',
    defaultMessage: 'Rate us',
  },
  onNetCallReward: {
    id: 'topUp.details.onNetCallReward',
    defaultMessage: 'OnNet Call Reward',
  },
  sysRefund: {
    id: 'topUp.details.sysRefund',
    defaultMessage: 'System Refund',
  },
  sysRecharge: {
    id: 'topUp.details.sysRecharge',
    defaultMessage: 'System Recharge',
  },
  forfeit: {
    id: 'topUp.details.forfeit',
    defaultMessage: 'Forfeit',
  },
  monitoring: {
    id: 'topUp.details.monitoring',
    defaultMessage: 'Monitoring',
  },
  purchaseCredit: {
    id: 'topUp.details.purchaseCredit',
    defaultMessage: 'Purchase Credit',
  },
  voucher: {
    id: 'topUp.details.voucher',
    defaultMessage: 'Voucher',
  },
  invalidVoucher: {
    id: 'topUp.details.invalidVoucher',
    defaultMessage: 'Invalid voucher number',
  },
  unionPay: {
    id: 'topUp.details.unionPay',
    defaultMessage: 'UnionPay',
  },
  mumsRecharge: {
    id: 'topUp.details.mumsRecharge',
    defaultMessage: 'mumsRecharge',
  },
  apiServerTopUpWallet: {
    id: 'topUp.details.apiServerTopUpWallet',
    defaultMessage: 'ApiServerTopUpWallet',
  },
  randomRetention: {
    id: 'topUp.details.randomRetention',
    defaultMessage: 'RandomRetention',
  },
  manual: {
    id: 'topUp.details.manual',
    defaultMessage: 'Manual',
  },
  adColony: {
    id: 'topUp.details.adColony',
    defaultMessage: 'AdColony',
  },
});

const TABLE_TITLES = [
  '',
  MESSAGES.dateAndTime,
  MESSAGES.mobile,
  MESSAGES.wallet,
  MESSAGES.type,
  MESSAGES.amount,
  MESSAGES.remark,
];

import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_NORMAL,
} from '../../../main/constants/uiState';

const TopUpTable = React.createClass({
  propTypes: {
    dateFormat: PropTypes.string,
    histories: PropTypes.array,
    page: PropTypes.number,
    pageRec: PropTypes.number,
    totalRec: PropTypes.number,
    onPageLoad: PropTypes.func,
    isLoadingMore: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  },

  _isFreeWallet(type) {
    return type.toLowerCase() === 'free';
  },

  _getDisplayTimestamp(timestamp) {
    return dateLocale.format(moment(timestamp), this.props.dateFormat || DATE_FORMAT);
  },

  _getDisplayUsername(username) {
    return first(username.split('@'));
  },

  renderEmptyRow() {
    return <EmptyRow colSpan={TABLE_TITLES.length} />;
  },

  renderTableBody() {
    const { histories } = this.props;

    if (isNull(histories)) {
      return (
        <tbody className={UI_STATE_LOADING}>
          <tr>
            <td colSpan={TABLE_TITLES.length}>
              <div className="text-center capitalize">
                <FormattedMessage
                  id="loading"
                  defaultMessage="Loading"
                />
                <span>...</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (isEmpty(histories)) {
      return (
        <tbody className={UI_STATE_EMPTY}>{this.renderEmptyRow()}</tbody>
      );
    }

    return (
      <tbody className={UI_STATE_NORMAL}>{this.renderRows(histories)}</tbody>
    );
  },

  getWalletType(walletType) {
    if (walletType === 'Paid') {
      return (
        <FormattedMessage
          id="wallet.type.paid"
          defaultMessage="Paid"
        />
      );
    }

    if (walletType === 'Free') {
      return (
        <FormattedMessage
          id="wallet.type.free"
          defaultMessage="Free"
        />
      );
    }

    return walletType;
  },

  getRechargeType(type) {
    const { formatMessage } = this.props.intl;


    if (!type) {
      return (
        <FormattedMessage
          id="unknown"
          defaultMessage="Unknown"
        />
      );
    }

    // transform the first letter of the case to be lower to match with translation identifier
    const clonedType = type.slice(0);
    const firstLetter = clonedType[0].toLowerCase();
    const restLetters = clonedType.substr(1);
    const messageType = `${firstLetter}${restLetters}`;

    if (!(messageType in MESSAGES)) {
      return type;
    }

    return formatMessage(MESSAGES[messageType]);
  },

  getErrorDescription(type) {
    const { formatMessage } = this.props.intl;

    switch (type) {
      case 'Invalid voucher no':
        return formatMessage(MESSAGES.invalidVoucher);
      default:
        return type;
    }
  },

  renderRows(histories) {
    return histories.map(history =>
      (
        <tr>
          <td className="text-center">
            <span
              className={
                classNames(
                  'label',
                  'status',
                  { success: history.status.toLowerCase() === 'success' },
                  {
                    alert: history.status.toLowerCase() === 'failure' ||
                    history.status.toLowerCase() === 'processing',
                  }
                )
              }
            />
          </td>
          <td className="data-table__datetime">{this._getDisplayTimestamp(history.rechargeDate)}</td>
          <td className="data-table__mobile">{this._getDisplayUsername(history.username)}</td>
          <td>
            <span className={
              classNames(
                'label',
                'radius',
                { success: this._isFreeWallet(history.walletType) },
                { alert: !history.walletType }
              )
            }
            >{this.getWalletType(history.walletType) || (<FormattedMessage
              id="unknown"
              defaultMessage="Unknown"
            />)}</span>
          </td>
          <td>{this.getRechargeType(history.rechargeType)}</td>
          <td>
            <Currency
              currencyCode={history.currency}
              amount={history.amount}
            />
          </td>
          <td className="remark">
            <If condition={history.status.toLowerCase() !== 'success'}>
              <Tooltip
                placement="left"
                trigger={['hover']}
                overlay={<span>{this.getErrorDescription(history.errorDescription)}</span>}
              >
                <Icon symbol="icon-error6" />
              </Tooltip>
            </If>
          </td>
        </tr>
      )
    );
  },

  renderTableFoot() {
    if (!this.props.histories || isEmpty(this.props.histories)) {
      return null;
    }

    const { totalRec, pageRec } = this.props;
    const totalPage = Math.ceil(totalRec / pageRec);

    return (
      <tfoot>
        <Pagination
          colSpan={TABLE_TITLES.length + 1}
          hasMoreData={totalPage > this.props.page}
          onLoadMore={this.props.onPageLoad}
          isLoading={this.props.isLoadingMore}
        />
      </tfoot>
    );
  },

  render() {
    return (
      <table className="data-table large-24 clickable">
        <TableHeader headers={TABLE_TITLES} />
        {this.renderTableBody()}
        {this.renderTableFoot()}
      </table>
    );
  },
});

export default injectIntl(TopUpTable);
