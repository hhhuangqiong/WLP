import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';

import moment from 'moment';
import _ from 'lodash';

import Pagination from './Pagination';

var Countries = require('../data/countries.json');

var Tooltip = require('rc-tooltip');

const IM_DATETIME_FORMAT = 'MMMM DD YYYY, hh:mm:ss a';

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

  getTypeSize: function(item) {
    let typeSize = '';
    if (item.file_size>0 && item.file_size>1024) {
      typeSize = (Math.round((item.file_size/1024)))+'kb';
    } else if (item.file_size>0 && item.file_size<1024) {
      typeSize = item.file_size+'b';
    } else {
      if (item.message_size>0 && item.message_size>1024) {
        typeSize = (Math.round((item.message_size/1024)))+'kb';
      } else if (item.message_size>0 && item.message_size<1024) {
        typeSize = item.message_size+'b';
      }
    }
    return typeSize;
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

          let imDate = moment(u.timestamp).format(IM_DATETIME_FORMAT);

          let messageTypeClasses = {
            animation: 'icon-animation',
            text: 'icon-text',
            image: 'icon-image',
            audio: 'icon-audio',
            video: 'icon-video',
            remote: 'icon-ituneyoutube',
            sticker: 'icon-sticker',
            'voice_sticker': 'icon-audio'
          };

          let typeClass = messageTypeClasses[u.message_type] || '';

          let typeText = _.capitalize(u.message_type);

          if (typeText === 'Undefined') {
            typeText = 'N/A';
          }

          let typeSize = this.getTypeSize(u);

          if (typeText == 'Remote') {
            typeText = 'Sharing';
            typeSize = u.resource_id;
            if (typeSize != 'itunes')
              typeSize = _.capitalize(typeSize);
          }

          let sender = u.sender.split('/');
          sender = sender[0];

          let recipient_info;

          if (_.isArray(u.recipients)) {
            recipient_info = <div className="recipient_info">
                      <div className="icon-multiuser"></div>
                        <Tooltip placement="right" trigger={['hover']} overlay={u.recipients.map((n)=>{return <span className="recip-info">{n}</span>})}>
                          <span className="recipient-num">{u.recipients.length} Recipients</span>
                        </Tooltip>
                    </div>
          } else {
            recipient_info =  <div className="recipient_info">
                                <span className={u.destination ? 'flag--'+u.destination : ''}></span>
                                <span className="recipient dark">{u.recipient}</span>
                                <br/>
                                <span>{(calleeCountry) ? calleeCountry.name : ''}</span>
                              </div>
          }

          return <tr className="im-table--row" key={u.timestamp}>
            <td className="im-table--cell">
              <div className="left timestamp">
                <span className="call_date dark">{imDate}</span>
              </div>
            </td>
            <td className="im-table--cell">
              <span className={"im-message-type-icon " + typeClass + " " + u.message_type}></span>
              <div className="im-message-type-info">
                <span className={"im-message-type-text dark"}>{typeText}</span>
                <br/>
                <span className={"im-message-type-size"}>{typeSize}</span>
              </div>
            </td>
            <td className="im-table--cell">
              <span className={'flag--'+u.origin}></span>
              <div className="sender_info">
                <span className="sender dark">{sender}</span>
                <br/>
                <span>{(callerCountry) ? callerCountry.name : ''}</span>
              </div>
            </td>
            <td className="im-table--cell">
                <div className="icon-arrow">
                </div>
            </td>
            <td className="im-table--cell">
                {recipient_info}
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
          <td className="im-table--cell"></td>
        </tr>
    }

    return (
      <table className="large-24 clickable im-table" key="im-table">
        <thead className="im-table--head">
          <tr className="im-table--row">
            <th className="im-table--cell">Date &amp; Time</th>
            <th className="im-table--cell">Type / Filesize</th>
            <th className="im-table--cell">Mobile &amp; Destination</th>
            <th className="im-table--cell"></th>
            <th className="im-table--cell"></th>
          </tr>
        </thead>
        <tbody className="im-table--body" key="im-table--body">
          {rows}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5">
              <Pagination total={this.props.total} current={this.props.current} per={this.props.per} onPageChange={this.props.onPageChange} />
            </td>
          </tr>
        </tfoot>
      </table>
    );
  }
});

export default ImTable;
