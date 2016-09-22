import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { injectIntl, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

import { CompanyWalletStore } from '../stores/CompanyWalletStore';
import { MESSAGES } from '../constants/companyOptions';

import fetchCompanyWallets from './../actions/fetchCompanyWallets';
import fetchCompanyWalletRecords from './../actions/fetchCompanyWalletRecords';
import topUpWallet from './../actions/topUpWallet';
import updateTopUpForm from './../actions/updateTopUpForm';

import Icon from '../../../main/components/Icon';
import WalletTopUpForm from './WalletTopUpForm';
import WalletTransactionsTable from './WalletTransactionsTable';

class CompanyWallet extends Component {
  static get contextTypes() {
    return {
      params: PropTypes.object.isRequired,
      executeAction: PropTypes.func.isRequired,
    };
  }
  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      topUpForms: PropTypes.objectOf(PropTypes.shape({
        amount: PropTypes.string,
        description: PropTypes.string,
      })),
      wallets: PropTypes.arrayOf(PropTypes.shape({
        walletId: PropTypes.number.isRequired,
        serviceType: PropTypes.string.isRequired,
        balance: PropTypes.string.isRequired,
      })),
      transactionsPage: PropTypes.shape({
        pageNumber: PropTypes.number.isRequired,
        pageSize: PropTypes.number.isRequired,
        totalElements: PropTypes.number.isRequired,
        contents: PropTypes.arrayOf(PropTypes.object),
      }),
    };
  }
  constructor(props, context) {
    super(props, context);
    this.state = { topUpForms: {} };
  }
  componentDidMount() {
    const { carrierId } = this.context.params;
    const { pageNumber, pageSize } = this.props.transactionsPage;
    this.context.executeAction(fetchCompanyWallets, { carrierId });
    this.context.executeAction(fetchCompanyWalletRecords, { carrierId, pageNumber, pageSize });
  }
  handlePageChange(pageParams) {
    const { carrierId } = this.context.params;
    const params = { carrierId, ...pageParams };
    this.context.executeAction(fetchCompanyWalletRecords, params);
  }
  handleFormChange(walletId, values) {
    this.context.executeAction(updateTopUpForm, {
      walletId,
      ...values,
    });
  }
  handleFormSubmit(values) {
    const { carrierId } = this.context.params;
    this.context.executeAction(topUpWallet, {
      ...values,
      carrierId,
    });
  }
  toDisplayedTransaction(transaction) {
    return {
      ...transaction,
      type: this.props.wallets.find(x => x.walletId === transaction.walletId).serviceType,
    };
  }
  render() {
    const {
      intl,
      transactionsPage,
      wallets,
      topUpForms,
    } = this.props;
    const { identity } = this.context.params;
    return (
      <div>
        <div className="company-wallet-header">
          <Link className="company-wallet-header__link" to={`/${identity}/company/overview`}>
            <Icon symbol="icon-previous" />
            <h4>
              {intl.formatMessage(MESSAGES.backToCompanies)}
            </h4>
          </Link>
        </div>
        <div className="row">
          {
            wallets.map(wallet =>
              <div className="small-12 columns" key={wallet.walletId}>
                <h4>{intl.formatMessage(wallet.serviceType === 'SMS' ? MESSAGES.smsWallet : MESSAGES.voiceWallet)}</h4>
                <WalletTopUpForm
                  wallet={wallet}
                  values={topUpForms[wallet.walletId] || {}}
                  onChange={values => this.handleFormChange(wallet.walletId, values)}
                  onSubmit={values => this.handleFormSubmit(values)}
                />
              </div>
            )
          }
        </div>
        <WalletTransactionsTable
          contents={transactionsPage.contents.map(x => this.toDisplayedTransaction(x))}
          pageNumber={transactionsPage.pageNumber}
          pageSize={transactionsPage.pageSize}
          totalElements={transactionsPage.totalElements}
          onPageChange={p => this.handlePageChange(p)}
        />
      </div>
    );
  }
}

CompanyWallet = connectToStores(
  CompanyWallet,
  [CompanyWalletStore],
  (context) => context.getStore(CompanyWalletStore).getState()
);

export default injectIntl(CompanyWallet);
