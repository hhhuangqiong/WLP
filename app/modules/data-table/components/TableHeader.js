import React, { PropTypes } from 'react';
import { injectIntl } from 'react-intl';

function TableHeader({ intl, headers }) {
  const {
    formatMessage,
  } = intl;

  return (
    <thead>
      <tr>
        {
          headers.map(title => (
            <th className="top-up-table--cell">
              {typeof title === 'object' ? formatMessage(title) : ''}
            </th>
          ))
        }
      </tr>
    </thead>
  );
}

TableHeader.defaultProps = {
  headers: [],
};

TableHeader.propTypes = {
  headers: PropTypes.string.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }),
};

export default injectIntl(TableHeader);
