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
          headers.map((title, index) => (
            <th className="top-up-table--cell" key={index}>
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
  headers: PropTypes.array.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }),
};

export default injectIntl(TableHeader);
