import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

export default function FilterBarNavigation({ section }, { params }) {
  if (!section) {
    return null;
  }

  const { role, identity } = params;

  return (
    <ul className="left top-bar--inner tab--inverted">
      <li className="top-bar--inner tab--inverted__title">
        <Link to={`/${role}/${identity}/${section}/overview`} activeClassName="active">
          <FormattedMessage id="overview" defaultMessage="Overview" />
        </Link>
      </li>
      <li className="top-bar--inner tab--inverted__title">
        <Link to={`/${role}/${identity}/${section}/details`} activeClassName="active">
          <FormattedMessage id="detailsReport" defaultMessage="Details Report" />
        </Link>
      </li>
    </ul>
  );
}

FilterBarNavigation.contextTypes = {
  params: PropTypes.object.isRequired,
};

FilterBarNavigation.propTypes = {
  section: PropTypes.string.isRequired,
};
