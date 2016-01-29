import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {Link} from 'react-router';

import moment from 'moment';
import _ from 'lodash';
import classNames from 'classnames';

var Countries = require('../../../data/countries.json');

var Tooltip = require('rc-tooltip');

const IM_DATETIME_FORMAT = 'MMMM DD YYYY, hh:mm:ss a';
const LABEL_FOR_NULL = 'N/A';

const MESSAGE_TYPES = {
  text: {
    className: 'icon-text',
    title: 'text'
  },
  image: {
    className: 'icon-image',
    title: 'image'
  },
  audio: {
    className: 'icon-audio',
    title: 'audio'
  },
  video: {
    className: 'icon-video',
    title: 'video'
  },
  remote: {
    className: 'icon-ituneyoutube',
    title: 'sharing'
  },
  animation: {
    className: 'icon-video',
    title: 'animation'
  },
  sticker: {
    className: 'icon-image',
    title: 'sticker'
  },
  voice_sticker: {
    className: 'icon-audio',
    title: 'voice sticker'
  },
  ephemeral_image: {
    className: 'icon-image',
    title: 'ephemeral image'
  }
};

var ImTable = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  getTypeSize: function(item, typeText) {
    let typeSize = '';
    if (item.message_type !== 'undefined') {
      if (item.file_size > 1024) {
        typeSize = (Math.round((item.file_size / 1024))) + 'kb';
      } else if (item.file_size > 0 && item.file_size < 1024) {
        typeSize = item.file_size + 'b';
      } else {
        if (item.message_size > 1024) {
          typeSize = (Math.round((item.message_size / 1024))) + 'kb';
        } else if (item.message_size > 0 && item.message_size < 1024) {
          typeSize = item.message_size + 'b';
        }
      }
    }

    if (typeText === 'Sharing') {
      typeSize = item.resource_id;
      if (typeSize !== 'itunes')
        typeSize = _.capitalize(typeSize);
    }

    return typeSize;
  },

  render: function() {
    let params = this.context.router.getCurrentParams();

    let rows = this.props.ims.map((u, key) => {

      let callerCountry = _.find(Countries, (c) => {
        return c.alpha2.toLowerCase() === u.origin;
      });

      let calleeCountry = _.find(Countries, (c) => {
        return c.alpha2.toLowerCase() === u.destination;
      });

      let imDate = moment(u.timestamp).format(IM_DATETIME_FORMAT);

      let imType = MESSAGE_TYPES[u.message_type] || LABEL_FOR_NULL;

      let typeSize = this.getTypeSize(u, imType.title);

      let sender = null;

      if (u.sender) {
        sender = u.sender.split('/');
        sender = sender[0];
      }

      return (
        <tr className="im-table--row" key={key}>
          <td className="im-table--cell">
            <div className="left timestamp">
              <span className="call_date dark">{imDate}</span>
            </div>
          </td>
          <td className="im-table--cell">
            <span className={classNames('im-message-type-icon', imType.className, u.message_type)}></span>
            <div className="im-message-type-info">
              <span className={"im-message-type-text dark"}>{imType.title || LABEL_FOR_NULL}</span>
              <br/>
              <span className={"im-message-type-size"}>{typeSize}</span>
            </div>
          </td>
          <td className="im-table--cell">
            <If condition={u.origin}>
              <div className="flag__container left">
                <span className={classNames('flag--' + u.origin, 'left')}></span>
              </div>
            </If>
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
            <If condition={_.isArray(u.recipients)}>
              <div className="recipient_info">
                <div className="icon-multiuser"></div>
                <Tooltip placement="right" trigger={['hover']} overlay={u.recipients.map((n)=>{return <span className="recip-info">{n}</span>;})}>
                  <span className="recipient-num">{u.recipients.length} Recipients</span>
                </Tooltip>
              </div>
              <Else />
              <div>
                <If condition={u.destination}>
                  <div className="flag__container left">
                    <span className={classNames('flag--' + u.destination, 'left')}></span>
                  </div>
                </If>
                <div className="recipient_info">
                  <span className="recipient">{u.recipient}</span>
                  <br/>
                  <span>{(calleeCountry) ? calleeCountry.name : ''}</span>
                </div>
              </div>
            </If>
          </td>
        </tr>
      );
    });

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
          <If condition={!_.isEmpty(this.props.ims)}>
            <tr>
              <td colSpan="5">
                <div className="text-center">
                  <If condition={(this.props.totalPages - 1) > this.props.page}>
                    <span className="pagination__button" onClick={this.props.onDataLoad}>Load More</span>
                    <Else />
                    <span className="pagination__button pagination__button--inactive">no more result</span>
                  </If>
                </div>
              </td>
            </tr>
          </If>
        </tfoot>
      </table>
    );
  }
});

export default ImTable;
