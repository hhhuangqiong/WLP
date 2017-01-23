import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { Link } from 'react-router';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import CSV from 'comma-separated-values';
import FileSaver from 'file-saver';
import connectToStores from 'fluxible-addons-react/connectToStores';

import { CompanyWalletStore } from '../stores/CompanyWalletStore';
import ClientConfigStore from '../../../main/stores/ClientConfigStore';
import { MESSAGES, WALLET_SERVICE_TYPE } from '../constants/companyOptions';

import fetchCompanyWalletsWithRecords from '../actions/fetchCompanyWalletsWithRecords';
import fetchCompanyWalletRecords from './../actions/fetchCompanyWalletRecords';
import topUpWallet from './../actions/topUpWallet';
import updateTopUpForm from './../actions/updateTopUpForm';

import Icon from '../../../main/components/Icon';
import WalletTopUpForm from './WalletTopUpForm';
import WalletTransactionsTable from './WalletTransactionsTable';

import currencyData from '../../../data/bossCurrencies.json';
import Converter from '../../../utils/bossCurrencyConverter';
import { beautifyTime } from '../../../utils/StringFormatter';

const converter = new Converter(currencyData, { default: '840' });

class CompanyWallet extends Component {
  static contextTypes = {
    params: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
  };
  static propTypes = {
    intl: intlShape.isRequired,
    topUpForms: PropTypes.objectOf(PropTypes.shape({
      amount: PropTypes.string,
      description: PropTypes.string,
    })),
    walletsLoading: PropTypes.bool,
    wallets: PropTypes.arrayOf(PropTypes.shape({
      walletId: PropTypes.number.isRequired,
      serviceType: PropTypes.oneOf(Object.values(WALLET_SERVICE_TYPE)).isRequired,
      balance: PropTypes.number.isRequired,
    })),
    transactionsPage: PropTypes.shape({
      pageNumber: PropTypes.number.isRequired,
      pageSize: PropTypes.number.isRequired,
      totalElements: PropTypes.number.isRequired,
      contents: PropTypes.arrayOf(PropTypes.object),
    }),
    transactionsPageParams: PropTypes.shape({
      defaultPageSize: PropTypes.number.isRequired,
      pageSizes: PropTypes.arrayOf(PropTypes.number).isRequired,
    }),
  };
  constructor(props, context) {
    super(props, context);
    this.state = { topUpForms: {} };
  }
  componentDidMount() {
    const { carrierId } = this.context.params;
    // the first time, it will apply the default page size and page number after that,
    // it will depends on the transaction page size
    const pageNumber = 0;
    const { defaultPageSize: pageSize } = this.props.transactionsPageParams;
    this.context.executeAction(fetchCompanyWalletsWithRecords, { carrierId, pageNumber, pageSize });
  }
  handlePageChange(pageParams) {
    const { carrierId } = this.context.params;
    const params = { carrierId, ...pageParams };
    this.context.executeAction(fetchCompanyWalletRecords, params);
  }
  handleFormChange(walletId, values) {
    const { pageNumber, pageSize } = this.props.transactionsPage;
    this.context.executeAction(updateTopUpForm, {
      walletId,
      ...values,
      pageParams: {
        pageNumber,
        pageSize,
      },
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
    const wallet = this.props.wallets.find(x => x.walletId === transaction.walletId);
    return {
      ...transaction,
      type: wallet ? wallet.serviceType : '',
    };
  }
  prepareCSVContent(data) {
    // set up the header
    const headerFields = ['transactionDate', 'amount', 'balance', 'currency', 'type', 'description'];
    // parse the data into row data
    const rows = _.map(data, record => _.map(headerFields, value => {
      if (value === 'transactionDate') {
        return beautifyTime(record[value]);
      }
      return record[value] || '';
    }));

    return new CSV(rows, { header: headerFields }).encode();
  }
  convertCurrencyCode(data) {
    _.forEach(data, item => {
      Object.assign(item, {
        currency: _.get(converter.getCurrencyById(item.currency), 'code') || item.currency,
      });
    });
    return data;
  }
  downloadRecord(data) {
    const content = this.prepareCSVContent(this.convertCurrencyCode(data));
    // set the content type
    const blob = new Blob([content], { type: 'data:text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, 'export_comapny_wallet.csv');
  }
  renderDownloadButton(data) {
    if (!data) {
      return null;
    }
    return (
        <div className="export-download-button export-ie-fix right" onClick={() => this.downloadRecord(data)}>
          <FormattedMessage
            id="download"
            defaultMessage="Download"
          />
          <Icon symbol="icon-download" />
        </div>
    );
  }
  render() {
    const {
      intl,
      transactionsPage,
      wallets,
      walletsLoading,
      topUpForms,
      transactionsPageParams,
    } = this.props;
    const { identity } = this.context.params;
    let content;
    let contentData;
    if (walletsLoading || !transactionsPage) {
      content = (
        <div>{intl.formatMessage(MESSAGES.loading)}</div>
      );
    } else if (wallets.length === 0) {
      content = (
        <div>{intl.formatMessage(MESSAGES.noDataAvailable)}</div>
      );
    } else {
      contentData = transactionsPage.contents.map(x => this.toDisplayedTransaction(x));
      content = (
        <div>
          <div className="row">
            {
              wallets.map(wallet =>
                <div className="small-12 columns" key={wallet.walletId}>
                  <h4>{intl.formatMessage(MESSAGES[`${wallet.serviceType}Wallet`] || { id: wallet.serviceType })}</h4>
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
            contents={contentData}
            pageNumber={transactionsPage.pageNumber}
            pageSize={transactionsPage.pageSize}
            totalElements={transactionsPage.totalElements}
            pageSizeOptions={transactionsPageParams.pageSizes}
            onPageChange={p => this.handlePageChange(p)}
          />
        </div>
      );
    }

    return (
      <div>
        <div className="company-wallet-header">
          <Link className="company-wallet-header__link" to={`/${identity}/company/overview`}>
            <Icon symbol="icon-previous" />
            <h4>
              {intl.formatMessage(MESSAGES.backToCompanies)}
            </h4>
          </Link>
          {this.renderDownloadButton(contentData)}
        </div>
        {content}
      </div>
    );
  }
}

CompanyWallet = connectToStores(
  CompanyWallet,
  [CompanyWalletStore, ClientConfigStore],
  (context) => Object.assign(context.getStore(CompanyWalletStore).getState(), {
    transactionsPageParams: context.getStore(ClientConfigStore).getTransactionsPageParams(),
  })
);

export default injectIntl(CompanyWallet);
