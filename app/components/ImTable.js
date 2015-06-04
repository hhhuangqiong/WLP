import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';

import moment from 'moment';
import _ from 'lodash';

var Countries = require('../data/countries.json');

var ImTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  componentWillReceiveProps: function(nextProps) {
    this.props.im = nextProps.im;
    this.props.current = nextProps.current;
    this.props.per = nextProps.per;
  },

  getFirstRecord: function() {
    return (this.props.current - 1) * this.props.per;
  },

  getLastRecord: function() {
    return this.props.current * this.props.per;
  },

  render: function() {
    let params = this.context.router.getCurrentParams();

    let rows;
    if (!_.isEmpty(this.props.im)) {
      rows = this.props.im.map((u) => {

          let callerCountry = _.find(Countries, (c) => {
            return c.alpha2.toLowerCase() == u.origin
          });

          let calleeCountry = _.find(Countries, (c) => {
            return c.alpha2.toLowerCase() == u.destination
          });

          let imDate = moment(u.timestamp).format('MMMM DD YYYY, hh:mm:ss a');

          let type = u.message_type

          return <tr className="im-table--row" key={u.timestamp}>
            <td className="im-table--cell">
              <div className="left timestamp">
                <span className="call_date">{imDate}</span>
              </div>
            </td>
            <td className="im-table--cell"><span className={"im_type " + u.type.toLowerCase()}>{(u.file_size>0)?u.file_size:u.message_size}</span></td>
            <td className="im-table--cell">
              <div className="sender_info">
                <span className={u.origin}></span>
                <span className="sender">{u.sender}</span>
                <span>{(callerCountry) ? callerCountry.name : ''}</span>
              </div>
            </td>
            <td className="im-table--cell">
              <div className="recipient_info">
                <span className={u.destination ? u.destination : ''}></span>
                <span className="recipient">{u.recipient}</span>
                <span>{(calleeCountry) ? calleeCountry.name : ''}</span>
              </div>
            </td>
          </tr>
        }
      );
    } else {
      rows = <tr className="im-table--row">
          <td className="im-table--cell"></td>
          <td className="im-table--cell"></td>
          <td className="im-table--cell"></td>
          <td className="im-table--cell"></td>
        </tr>
    }

    return (
      <table className="large-24 clickable im-table" key="im-table">
        <thead className="im-table--head">
          <tr className="im-table--row">
            <th className="im-table--cell">Date & Time</th>
            <th className="im-table--cell">Type/Filesize/ID</th>
            <th className="im-table--cell">Mobile & Destination</th>
            <th className="im-table--cell"></th>
          </tr>
        </thead>
        <tbody className="im-table--body" key="im-table--body">
          {rows}
        </tbody>
      </table>
    );
  }
});

export default ImTable;
