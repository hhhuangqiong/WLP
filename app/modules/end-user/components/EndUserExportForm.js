import React from 'react';
import moment from 'moment';

import DateRangePicker from '../../../main/components/DateRangePicker';
import ExportSubmitControls from '../../../main/file-export/components/ExportSubmitControls';

export default React.createClass({
  propTypes: {
    carrierId: React.PropTypes.string,
    startDate: React.PropTypes.string,
    endDate: React.PropTypes.string,
    handleExport: React.PropTypes.func.isRequired,
    closeModal: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      startDate: moment(this.props.startDate),
      endDate: moment(this.props.endDate).endOf('day'),
    };
  },

  clearState() {
    this.setState(this.getInitialState());
  },

  handleStartDateChange(newDate) {
    this.setState({ startDate: moment.isMoment(newDate) ? newDate : moment(newDate) });
  },

  handleEndDateChange(newDate) {
    this.setState({ endDate: moment.isMoment(newDate) ? newDate : moment(newDate) });
  },

  handleExport() {
    const params = {
      carrierId: this.props.carrierId,
      startDate: this
        .state
        .startDate
        .format('L'),
      endDate: this
        .state
        .endDate
        .format('L'),
      pageNumberIndex: 0,
    };

    this.props.handleExport(params);
    this.clearState();
  },

  render() {
    return (
      <form onSubmit={this.handleExport} noValidate>
        <h4 id="modalTitle">DOWNLOAD REPORT</h4>

        <hr />

        <div className="export-row">
          <label className="left bold">Period</label>

          <DateRangePicker
            withIcon
            startDate={this
              .state
              .startDate
              .format('L')
            }
            endDate={this
              .state
              .endDate
              .format('L')
            }
            handleStartDateChange={this.handleStartDateChange}
            handleEndDateChange={this.handleEndDateChange}
          />
        </div>

        <hr />

        <ExportSubmitControls
          closeModal={this.props.closeModal}
          handleExport={this.handleExport}
        />

      </form>
    );
  },
});
