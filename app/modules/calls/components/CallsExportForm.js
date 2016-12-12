import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Select from 'react-select';

import DateTimePicker from '../../../main/components/DateTimePicker';
import ExportSubmitControls from '../../../main/file-export/components/ExportSubmitControls';

import { CALL_TYPE, MESSAGES, CALL_EXPORT_REPORT_TYPE } from '../constants/callType';
import { CALLS_COST, CALLS } from '../../../main/file-export/constants/exportType';
import * as dateLocale from '../../../utils/dateLocale';
import { TIME_FORMAT } from '../../../utils/timeFormatter';

const defaultLocale = dateLocale.getDefaultLocale();

const CallsExportForm = React.createClass({
  propTypes: {
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    netType: PropTypes.string,
    handleExport: PropTypes.func,
    closeModal: PropTypes.func,
    intl: intlShape.isRequired,
    exportTypeOptions: PropTypes.array,
    disabled: PropTypes.bool,
    exportType: PropTypes.string,
    handleExportTypeChange: PropTypes.func,
  },

  defaultState() {
    return {
      startDate: moment(this.props.startDate),
      endDate: moment(this.props.endDate).endOf('day'),
      netType: this.props.netType,
      destination: '',
    };
  },

  getInitialState() {
    return this.defaultState();
  },

  clearState() {
    this.setState(this.defaultState());
  },

  handleStartDateChange(newDate) {
    this.setState({ startDate: moment.isMoment(newDate) ? newDate.locale(defaultLocale) : moment(newDate) });
  },

  handleEndDateChange(newDate) {
    this.setState({ endDate: moment.isMoment(newDate) ? newDate.locale(defaultLocale) : moment(newDate) });
  },

  handleToggleOnnet(e) {
    e.preventDefault();
    this.setState({ netType: this.state.netType !== CALL_TYPE.ONNET ? CALL_TYPE.ONNET : '' });
  },

  handleToggleOffnet(e) {
    e.preventDefault();
    this.setState({ netType: this.state.netType !== CALL_TYPE.OFFNET ? CALL_TYPE.OFFNET : '' });
  },

  handleToggleMaaiiIn(e) {
    e.preventDefault();
    this.setState({ netType: this.state.netType !== CALL_TYPE.MAAII_IN ? CALL_TYPE.MAAII_IN : '' });
  },

  handleDestinationChange(event) {
    this.setState({ destination: event.target.value });
  },

  handleExport() {
    const params = {
      type: this.state.netType,
      startDate: this.state.startDate.format('x'),
      endDate: this.state.endDate.format('x'),
      destination: this.state.destination.toLowerCase(),
    };

    this.props.handleExport(params);
    this.clearState();
  },

  render() {
    // ExportCountryDropdown is removed for WLP-285
    const { formatMessage } = this.props.intl;
    return (
      <form onSubmit={this.handleExport} noValidate>
        <h4 id="modalTitle">
          <FormattedMessage
            id="details.downloadReport"
            defaultMessage="Download Report"
          />
        </h4>

        <hr />

        <div className="export-row">
          <label className="left bold">
            <FormattedMessage
              id="startTime"
              defaultMessage="Start time"
            />
          </label>

          <DateTimePicker
            className="export-datetime-picker export-from-time"
            name="startPicker"
            date={this.state.startDate}
            dataPickerkey="startExportDatePicker"
            dataPickerRef="startExportDatePicker"
            dateOnChange={this.handleStartDateChange}
            dateFormat="MM/DD/YYYY"
            timeFormat={TIME_FORMAT}
          />
        </div>

        <div className="export-row">
          <label className="left bold">
            <FormattedMessage
              id="endTime"
              defaultMessage="End time"
            />
          </label>

          <DateTimePicker
            className="export-datetime-picker export-to-time"
            name="endPicker"
            date={this.state.endDate}
            dataPickerkey="endExportDatePicker"
            dataPickerRef="endExportDatePicker"
            dateOnChange={this.handleEndDateChange}
            dateFormat="MM/DD/YYYY"
            minDate={this.state.startDate}
            timeFormat={TIME_FORMAT}
          />
        </div>

        <div className="export-row">
          <label className="left bold">
            <FormattedMessage
              id="type"
              defaultMessage="Type"
            />
          </label>

          <Select
            className="export-select"
            name="select-export-type"
            value={this.props.exportType}
            placeholder={formatMessage(MESSAGES.selectType)}
            options={this.props.exportTypeOptions}
            onChange={this.props.handleExportTypeChange}
            clearable={false}
            disabled={this.props.disabled}
          />
        </div>

        {
          this.props.exportType !== CALLS_COST ?
          <div className="export-row">
            <label className="left bold">
              <FormattedMessage
                id="filter"
                defaultMessage="Filter by"
              />
            </label>

            <ul className="button-group round even-3 export-type-buttons">
              <li>
                <a
                  className={classNames('button', { active: this.state.netType === CALL_TYPE.ONNET })}
                  onClick={this.handleToggleOnnet}
                >
                  <FormattedMessage id="onnet" defaultMessage="Onnet" />
                </a>
              </li>
              <li>
                <a
                  className={classNames('button', { active: this.state.netType === CALL_TYPE.OFFNET })}
                  onClick={this.handleToggleOffnet}
                >
                  <FormattedMessage id="offnet" defaultMessage="Offnet" />
                </a>
              </li>
              <li>
                <a
                  className={classNames('button', { active: this.state.netType === CALL_TYPE.MAAII_IN })}
                  onClick={this.handleToggleMaaiiIn}
                >
                  <FormattedMessage id="maaiiIn" defaultMessage="Maaii-In" />
                </a>
              </li>
            </ul>
          </div> : null
        }

        <hr />

        <ExportSubmitControls
          closeModal={this.props.closeModal}
          handleExport={this.handleExport}
        />

      </form>
    );
  },
});

export default injectIntl(CallsExportForm);
