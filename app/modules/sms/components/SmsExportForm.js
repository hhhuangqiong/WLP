import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import DateTimePicker from '../../../main/components/DateTimePicker';
import ExportSubmitControls from '../../../main/file-export/components/ExportSubmitControls';
import Select from 'react-select';

import * as dateLocale from '../../../utils/dateLocale';
import { TIME_FORMAT } from '../../../utils/timeFormatter';
import { SMS_COST, SMS } from '../../../main/file-export/constants/exportType';

const defaultLocale = dateLocale.getDefaultLocale();

class SmsExportForm extends Component {
  static propTypes = {
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    closeModal: PropTypes.func,
    intl: intlShape.isRequired,
    handleExport: PropTypes.func,
    page: PropTypes.number,
    pageRec: PropTypes.string,
    exportTypeOptions: PropTypes.array,
    disabled: PropTypes.bool,
    exportType: PropTypes.string,
    handleExportTypeChange: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      startDate: moment(this.props.startDate),
      endDate: moment(this.props.endDate).endOf('day'),
    };
  }

  clearState = () => {
    this.setState({
      startDate: moment(this.props.startDate),
      endDate: moment(this.props.endDate).endOf('day'),
    });
  }

  handleStartDateChange = (newDate) => {
    this.setState({ startDate: moment.isMoment(newDate) ? newDate.locale(defaultLocale) : moment(newDate) });
  }

  handleEndDateChange = (newDate) => {
    this.setState({ endDate: moment.isMoment(newDate) ? newDate.locale(defaultLocale) : moment(newDate) });
  }

  handleExport = () => {
    const params = {
      startDate: this.state.startDate.format('x'),
      endDate: this.state.endDate.format('x'),
      page: this.props.page,
      pageRec: this.props.pageRec,
    };

    this.props.handleExport(params);
    this.clearState();
  }

  render() {
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
            options={this.props.exportTypeOptions}
            onChange={this.props.handleExportTypeChange}
            clearable={false}
            disabled={this.props.disabled}
          />
        </div>

        <hr />

        <ExportSubmitControls
          closeModal={this.props.closeModal}
          handleExport={this.handleExport}
        />

      </form>
    );
  }
}

export default injectIntl(SmsExportForm);
