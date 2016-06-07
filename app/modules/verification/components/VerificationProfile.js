import _ from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import CountryFlag from '../../../main/components/CountryFlag';
import { getCountryName } from '../../../utils/StringFormatter';
import i18nMessages from '../../../main/constants/i18nMessages';
import Icon from '../../../main/components/Icon';

const EMPTY_CELL = i18nMessages.unknownLabel;
const maxColumns = 5;

export default React.createClass({
  propTypes: {
    profile: PropTypes.object.isRequired,
    onClickBack: PropTypes.func.isRequired,
  },

  renderHLRHeader() {
    let { hlr } = this.props.profile || {};
    hlr = _.pick(hlr, ['original', 'roaming', 'ported']);

    let index = 0;
    let emptyColumns = 0;
    const length = Object.keys(hlr).length;

    return _.map(hlr, (property, type) => {
      index ++;

      if (!property.country || !property.operator) {
        emptyColumns ++;
        if (index === length) {
          return (
            <td colSpan={ index === length ? (maxColumns - length + emptyColumns) : 1} />
          );
        }
        return false;
      }

      return (
        <td colSpan={ index === length ? (maxColumns - length + emptyColumns) : 1}>
          <span className="heading">{ type }</span>
        </td>
      );
    });
  },

  renderHLRTypeRow(rowName) {
    let { hlr } = this.props.profile || {};
    hlr = _.pick(hlr, ['original', 'roaming', 'ported']);

    let index = 0;
    let emptyColumns = 0;
    const length = Object.keys(hlr).length;

    return _.map(hlr, (property) => {
      index ++;

      if (!property.country || !property.operator) {
        emptyColumns ++;
        if (index === length) {
          return (
            <td className="spacer" colSpan={ index === length ? (maxColumns - length + emptyColumns) : 1} />
          );
        }
        return false;
      }

      if (rowName === 'country') {
        return (
          <td colSpan={ index === length ? (maxColumns - length + emptyColumns) : 1}>
            <div className="country">
              <CountryFlag code={property.country} />
              { getCountryName(property.country) }
            </div>
          </td>
        );
      }

      return (
        <td colSpan={ index === length ? (maxColumns - length + emptyColumns) : 1}>
          { property[rowName] }
        </td>
      );
    });
  },

  renderHLRRow(rowName) {
    const { hlr } = this.props.profile || {};

    if (rowName === 'country') {
      return (
        <td colSpan={maxColumns - 1}>
          <div className="country">
            <CountryFlag code={hlr.country} />
            { getCountryName(hlr.country) }
          </div>
        </td>
      );
    }

    return (
      <td colSpan={maxColumns - 1}>
        { hlr[rowName] }
      </td>
    );
  },

  renderSIMHeader() {
    const { sims: simCard } = this.props.profile || {};

    return _.map(simCard, (card, index) => {
      return (
        <td colSpan={ index === (simCard.length - 1) ? (maxColumns - simCard.length) : 1}>
          <span className="heading">SIM Card #{index + 1}</span>
        </td>
      );
    });
  },

  renderSIMRow(rowName) {
    const { sims: simCard } = this.props.profile || {};

    return (
      <td colSpan={ maxColumns - 1 }>
        { _.get(simCard, `0.${rowName}`) }
      </td>
    );
  },

  renderSIMTypeRow(rowName) {
    let { sims: simCard } = this.props.profile || {};

    simCard = _.pick(_.first(simCard), ['home', 'current']);

    let index = 0;
    const length = Object.keys(simCard).length;

    return _.map(simCard, (property) => {
      index ++;
      return (
        <td colSpan={ index === length ? (maxColumns - length) : 1}>
          { _.get(property, rowName) }
        </td>
      );
    });
  },

  renderCellInfoHeader() {
    const { cellInfo } = this.props.profile || {};

    return _.map(cellInfo, (info, index) => {
      return (
        <td colSpan={ index === (cellInfo.length - 1) ? (maxColumns - cellInfo.length) : 1}>
          <span className="heading">Cell #{index + 1}</span>
        </td>
      );
    });
  },

  renderCellInfoRow(rowName) {
    const { cellInfo } = this.props.profile || {};

    return _.map(cellInfo, (info, index) => {
      return (
        <td colSpan={ index === (cellInfo.length - 1) ? (maxColumns - cellInfo.length) : 1}>
          { _.get(info, rowName) }
        </td>
      );
    });
  },

  render() {
    const { intl: { formatMessage } } = this.props;
    const { profile } = this.props;
    const { hlr, sims: simCard } = profile || {};

    return (
      <table className="verification-profile data-table small-24 large-22 large-offset-1">
        <tbody>
        <tr>
          <td colSpan={maxColumns}>
            <div className="large-24 columns">
              <h5>
                <a className="back-button" onClick={this.props.onClickBack}>
                  <Icon symbol="icon-arrow" />
                </a>
                <span>
                  <FormattedMessage
                    id="vsdk.name"
                    defaultMessage="Verification"
                  />
                  <FormattedMessage
                    id="details"
                    defaultMessage="Details"
                  />
                  <span> > </span>
                  { _.get(hlr, 'msisdn') || formatMessage(EMPTY_CELL) }
                </span>
              </h5>
            </div>
          </td>
        </tr>
        <tr>
          <td colSpan={maxColumns}>
            <div className="inner-wrap">
              <div className="large-24 columns">
                <h4>{ _.get(hlr, 'msisdn') || formatMessage(EMPTY_CELL) }</h4>
              </div>
              <div className="large-4 columns registered-date">
                <p className="heading">
                  <FormattedMessage
                    id="vsdk.details.registeredDate"
                    defaultMessage="Registered Date"
                  />
                </p>
                <If condition={_.get(hlr, 'time')}>
                  <div>
                    <span>{ moment(_.get(hlr, 'time')).format('h:mm:ss a') }</span>
                    <span>{ moment(_.get(hlr, 'time')).format('DD MMMM YYYY') }</span>
                  </div>
                <Else />
                  <span>{formatMessage(EMPTY_CELL)}</span>
                </If>
              </div>
              <div className="large-20 columns end">
                <div className="status">
                  <If condition={_.get(profile, 'success')}>
                    <span className="success label">
                      <FormattedMessage
                        id="success"
                        defaultMessage="Success"
                      />
                    </span>
                  <Else />
                    <span className="failure label">
                      <FormattedMessage
                        id="failure"
                        defaultMessage="Failure"
                      />
                    </span>
                  </If>
                  <If condition={_.get(profile, 'isValid')}>
                    <span className="default label">
                      <FormattedMessage
                        id="valid"
                        defaultMessage="Valid"
                      />
                    </span>
                  <Else />
                    <span className="warning label">
                      <FormattedMessage
                        id="invalid"
                        defaultMessage="Invalid"
                      />
                    </span>
                  </If>
                  <If condition={_.get(profile, 'isPorted')}>
                    <span className="default label">
                      <FormattedMessage
                        id="vsdk.details.ported"
                        defaultMessage="Ported"
                      />
                    </span>
                  </If>
                  <If condition={_.get(profile, 'isRoaming')}>
                    <span className="default label">
                      <FormattedMessage
                        id="roaming"
                        defaultMessage="Roaming"
                      />
                    </span>
                  </If>
                  <If condition={_.get(profile, 'imsiMatched')}>
                    <span className="default label">
                      <FormattedMessage
                        id="matched"
                        defaultMessage="Matched"
                      />
                    </span>
                    <Else />
                    <span className="warning label">
                      <FormattedMessage
                        id="vsdk.details.notMatched"
                        defaultMessage="Not matched"
                      />
                    </span>
                  </If>
                </div>
              </div>
            </div>
          </td>
        </tr>
        <tr className="column-heading-grey">
          <td colSpan={maxColumns}>
            <div className="large-24 columns">
              <h6>
                <FormattedMessage
                  id="vsdk.details.resultInfo"
                  defaultMessage="Result Info"
                />
              </h6>
            </div>
          </td>
        </tr>
        <tr className="sim-imsi">
          <td>
            <div className="large-24 columns">
              <FormattedMessage
                id="vsdk.details.deviceModel"
                defaultMessage="Device Model"
              />
            </div>
          </td>
          <td colSpan={ maxColumns - 1 }>
            { _.get(profile, 'deviceModel') }
          </td>
        </tr>
        <tr className="sim-imsi">
          <td>
            <div className="large-24 columns">
              <FormattedMessage
                id="method"
                defaultMessage="Method"
              />
            </div>
          </td>
          <td colSpan={ maxColumns - 1 }>
            { _.get(profile, 'method') }
          </td>
        </tr>
        <tr className="sim-imsi">
          <td>
            <div className="large-24 columns">
              IP
            </div>
          </td>
          <td colSpan={ maxColumns - 1 }>
            { _.get(profile, 'ip') }
          </td>
        </tr>
        <If condition={!!simCard}>
          <tr className="column-heading-grey">
            <td colSpan={maxColumns}>
              <div className="large-24 columns">
                <h6>
                  <FormattedMessage
                    id="vsdk.details.simCard"
                    defaultMessage="SIM Card"
                  />
                <span> #1</span>
                </h6>
              </div>
            </td>
          </tr>
        </If>
        <If condition={!!simCard}>
          <tr className="sim-imsi">
            <td>
              <div className="large-24 columns">
                IMSI
              </div>
            </td>
            {
              this.renderSIMRow('imsi')
            }
          </tr>
        </If>
        <If condition={!!simCard}>
          <tr className="column-heading">
            {/* Row Title Spacer */}
            <td></td>
            <td className="heading">
              <FormattedMessage
                id="home"
                defaultMessage="Home"
              />
            </td>
            <td className="heading" colSpan="3">
              <FormattedMessage
                id="current"
                defaultMessage="Current"
              />
            </td>
          </tr>
        </If>
        <If condition={!!simCard}>
          <tr className="sim-mcc">
            <td>
              <div className="large-24 columns">
                <FormattedMessage
                  id="vsdk.details.operator"
                  defaultMessage="Operator"
                />
              </div>
            </td>
            {
              this.renderSIMTypeRow('operator')
            }
          </tr>
        </If>
        <If condition={!!simCard}>
          <tr className="sim-mcc">
            <td>
              <div className="large-24 columns">
                MNC
              </div>
            </td>
            {
              this.renderSIMTypeRow('mnc')
            }
          </tr>
        </If>
        <If condition={!!simCard}>
          <tr className="sim-mcc">
            <td>
              <div className="large-24 columns">
                MCC
              </div>
            </td>
            {
              this.renderSIMTypeRow('mcc')
            }
          </tr>
        </If>
        {/*
          <If condition={!!cellInfo}>
            <tr>
              <td colSpan={maxColumns}>
                <div className="large-24 columns">
                  <h6>Cell Info</h6>
                </div>
              </td>
            </tr>
          </If>
          <If condition={!!cellInfo}>
            <tr className="column-heading">
              <td></td>
              {
                this.renderCellInfoHeader()
              }
            </tr>
          </If>
         <If condition={!!cellInfo}>
         <tr>
         <td>
         <div className="large-24 columns">
         Identity
         </div>
         </td>
         {
         this.renderCellInfoRow('identity')
         }
         </tr>
         </If>
         <If condition={!!cellInfo}>
         <tr>
         <td>
         <div className="large-24 columns">
         Signal Strength
         </div>
         </td>
         {
         this.renderCellInfoRow('signalStrength')
         }
         </tr>
         </If>
         <If condition={!!cellInfo}>
         <tr>
         <td>
         <div className="large-24 columns">
         Type
         </div>
         </td>
         {
         this.renderCellInfoRow('type')
         }
         </tr>
         </If>
         */}
        <If condition={!!hlr}>
          <tr className="column-heading-grey">
            <td colSpan={maxColumns}>
              <div className="large-24 columns">
                <h6>HLR</h6>
              </div>
            </td>
          </tr>
        </If>
        <If condition={!!hlr}>
          <tr className="hlr-operator">
            <td>
              <div className="large-24 columns">
                <FormattedMessage
                  id="country"
                  defaultMessage="Country"
                />
              </div>
            </td>
            {
              this.renderHLRRow('country')
            }
          </tr>
        </If>
        <If condition={!!hlr}>
          <tr className="hlr-operator">
            <td>
              <div className="large-24 columns">
                MSISDN
              </div>
            </td>
            {
              this.renderHLRRow('msisdn')
            }
          </tr>
        </If>
        <If condition={!!hlr}>
          <tr className="hlr-operator">
            <td>
              <div className="large-24 columns">
                MNC
              </div>
            </td>
            {
              this.renderHLRRow('mnc')
            }
          </tr>
        </If>
        <If condition={!!hlr}>
          <tr className="hlr-operator">
            <td>
              <div className="large-24 columns">
                MCC
              </div>
            </td>
            {
              this.renderHLRRow('mcc')
            }
          </tr>
        </If>
        <If condition={!!hlr}>
          <tr className="hlr-operator">
            <td>
              <div className="large-24 columns">
                IMSI
              </div>
            </td>
            {
              this.renderHLRRow('imsi')
            }
          </tr>
        </If>
        <If condition={!!hlr}>
          <tr className="column-heading">
            {/* Row Title Spacer */}
            <td></td>
            {
              this.renderHLRHeader()
            }
          </tr>
        </If>
        <If condition={!!hlr}>
          <tr className="hlr-country">
            <td>
              <div className="large-24 columns">
                <FormattedMessage
                  id="country"
                  defaultMessage="Country"
                />
              </div>
            </td>
            {
              this.renderHLRTypeRow('country')
            }
          </tr>
        </If>
        <If condition={!!hlr}>
          <tr className="hlr-operator">
            <td>
              <div className="large-24 columns">
                <FormattedMessage
                  id="operator"
                  defaultMessage="Operator"
                />
              </div>
            </td>
            {
              this.renderHLRTypeRow('operator')
            }
          </tr>
        </If>
        </tbody>
        <tfoot>
        <tr>
          <th width="20%"></th>
          <th width="20%"></th>
          <th width="20%"></th>
          <th width="20%"></th>
          <th width="20%"></th>
        </tr>
        </tfoot>
      </table>
    );
  },
});
