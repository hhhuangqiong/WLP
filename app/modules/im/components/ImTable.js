import React, { PropTypes } from 'react';
import moment from 'moment';
import { isNull, isEmpty, capitalize } from 'lodash';
import classNames from 'classnames';
import Tooltip from 'rc-tooltip';
import { FormattedMessage } from 'react-intl';

import { getCountryName } from '../../../utils/StringFormatter';
import CountryFlag from '../../../main/components/CountryFlag';
import EmptyRow from '../../../main/components/data-table/EmptyRow';

import Pagination from '../../../main/components/Pagination';

const IM_DATETIME_FORMAT = 'MMMM DD YYYY, hh:mm:ss a';
const LABEL_FOR_NULL = 'N/A';

const TABLE_TITLES_IDS = [
  'details.dateAndTime',
  'im.details.typeAndFilesize',
  'details.mobileAndDestination',
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
      if (typeSize !== 'itunes') typeSize = capitalize(typeSize);
    }

    return typeSize;
  },

  renderEmptyRow() {
    return <EmptyRow colSpan={TABLE_TITLES.length} />;
  },

  renderRows() {
    return this.props.ims.map((u, key) => {
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
              <span className="data-table__datetime call_date dark">{imDate}</span>
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
              <span className="data-table__sender sender dark">{sender}</span>
              <br />
              <span>{getCountryName(u.origin)}</span>
            </div>
          </td>
          <td className="im-table--cell">
            <div className="icon-arrow">
            </div>
          </td>
          <td className="im-table--cell">
            <If condition={Array.isArray(u.recipients)}>
              <div className="recipient_info">
                <div className="icon-multiuser"></div>
                <Tooltip
                  placement="right"
                  trigger={['hover']}
                  overlay={u.recipients.map(n => <span className="recip-info">{n}</span>)}
                >
                  <span className="recipient-num">
                    <span>{u.recipients.length}</span>
                  <FormattedMessage
                    id="im.details.recipients"
                    defaultMessage="Recipients"
                  />
                  </span>
                </Tooltip>
              </div>
            <Else />
              <div>
                <CountryFlag className="left" code={u.destination} />
                <div className="recipient_info">
                  <span className="data-table__recipient recipient dark">{u.recipient}</span>
                  <br />
                <span>{getCountryName(u.destination)}</span>
                </div>
              </div>
            </If>
          </td>
        </tr>
      );
    });
  },

  renderTableBody(content) {
    if (isNull(content)) {
      return (
        <tbody className="ui-state-loading">
          <tr>
            <td colSpan={TABLE_TITLES.length}>
              <div className="text-center">
                <span>Loading...</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (isEmpty(content)) {
      return (
        <tbody className="ui-state-empty">{this.renderEmptyRow()}</tbody>
      );
    }

    return (
      <tbody className="ui-state-normal">{this.renderRows()}</tbody>
    );
  },

  render() {
    return (
      <table className="data-table large-24 clickable im-table" key="im-table">
        <thead className="im-table--head">
        <tr className="im-table--row">
          {
            TABLE_TITLES_IDS.map(id => (
              <th className="im-table--cell">
                <FormattedMessage id={id} />
              </th>
            ))
          }
        </tr>
        </thead>
        {this.renderTableBody(this.props.ims)}
        <tfoot>
          <If condition={!isEmpty(this.props.ims)}>
            <Pagination
              colSpan={TABLE_TITLES_IDS.length + 1}
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
