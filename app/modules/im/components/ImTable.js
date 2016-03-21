import React, { PropTypes } from 'react';
import moment from 'moment';
import _ from 'lodash';
import classNames from 'classnames';
import Tooltip from 'rc-tooltip';

import { getCountryName } from '../../../utils/StringFormatter';
import CountryFlag from '../../../main/components/CountryFlag';
import EmptyRow from '../../../main/components/data-table/EmptyRow';

import Pagination from '../../../main/components/Pagination';

const IM_DATETIME_FORMAT = 'MMMM DD YYYY, hh:mm:ss a';
const LABEL_FOR_NULL = 'N/A';

const TABLE_TITLES = [
  'Date & Time',
  'Type / Filesize',
  'Mobile & Destination',
  '',
  '',
];

const MESSAGE_TYPES = {
  text: {
    className: 'icon-text',
    title: 'text',
  },
  image: {
    className: 'icon-image',
    title: 'image',
  },
  audio: {
    className: 'icon-audio',
    title: 'audio',
  },
  video: {
    className: 'icon-video',
    title: 'video',
  },
  remote: {
    className: 'icon-ituneyoutube',
    title: 'sharing',
  },
  animation: {
    className: 'icon-video',
    title: 'animation',
  },
  sticker: {
    className: 'icon-image',
    title: 'sticker',
  },
  voice_sticker: {
    className: 'icon-audio',
    title: 'voice sticker',
  },
  ephemeral_image: {
    className: 'icon-image',
    title: 'ephemeral image',
  },
};

const ImTable = React.createClass({
  propTypes: {
    ims: PropTypes.array.isRequired,
    totalPages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    onDataLoad: PropTypes.func.isRequired,
    isLoadingMore: PropTypes.bool,
  },

  contextTypes: {
    router: PropTypes.func.isRequired,
  },

  getTypeSize(item, typeText) {
    function calculateSize(itemSize) {
      if (itemSize > 1024) {
        return `${(Math.round((itemSize / 1024)))}kb`;
      } else if (itemSize > 0 && itemSize < 1024) {
        return `${itemSize}b`;
      }

      return '';
    }

    let typeSize = '';

    if (item.message_type !== 'undefined') {
      typeSize = calculateSize(item.file_size > 0 ? item.file_size : item.message_size);
    }

    if (typeText === 'Sharing') {
      typeSize = item.resource_id;
      if (typeSize !== 'itunes') typeSize = _.capitalize(typeSize);
    }

    return typeSize;
  },

  renderEmptyRow() {
    if (!this.props.ims || this.props.ims.length === 0) {
      return <EmptyRow colSpan={5} />;
    }
  },

  render() {
    const {
      ims,
    } = this.props;

    const rows = ims.map((u, key) => {
      const imDate = moment(u.timestamp).format(IM_DATETIME_FORMAT);
      const imType = MESSAGE_TYPES[u.message_type] || LABEL_FOR_NULL;
      const typeSize = this.getTypeSize(u, imType.title);

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
            <span
              className={classNames('im-message-type-icon', imType.className, u.message_type)}
            ></span>
            <div className="im-message-type-info">
              <span className={"im-message-type-text dark"}>{imType.title || LABEL_FOR_NULL}</span>
              <br />
              <span className={"im-message-type-size"}>{typeSize}</span>
            </div>
          </td>
          <td className="im-table--cell">
            <CountryFlag className="left" code={u.origin} />
            <div className="sender_info">
              <span className="sender dark">{sender}</span>
              <br />
              <span>{getCountryName(u.origin)}</span>
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
                <Tooltip
                  placement="right"
                  trigger={['hover']}
                  overlay={u.recipients.map(n => <span className="recip-info">{n}</span>)}
                >
                  <span className="recipient-num">{u.recipients.length} Recipients</span>
                </Tooltip>
              </div>
            <Else />
              <div>
                <CountryFlag className="left" code={u.destination} />
                <div className="recipient_info">
                  <span className="recipient">{u.recipient}</span>
                  <br />
                <span>{getCountryName(u.destination)}</span>
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
          {
            TABLE_TITLES.map(title => <th className="im-table--cell">{title}</th>)
          }
        </tr>
        </thead>
        <tbody className="im-table--body" key="im-table--body">
        {_.isEmpty(rows) ? this.renderEmptyRow() : rows}
        </tbody>
        <tfoot>
          <If condition={!_.isEmpty(this.props.ims)}>
            <Pagination
              colSpan={TABLE_TITLES.length + 1}
              hasMoreData={(this.props.totalPages - 1) > this.props.page}
              onLoadMore={this.props.onDataLoad}
              isLoading={this.props.isLoadingMore}
            />
          </If>
        </tfoot>
      </table>
    );
  },
});

export default ImTable;
