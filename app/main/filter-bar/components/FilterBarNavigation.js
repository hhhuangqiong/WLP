import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

const overviewMessage = <FormattedMessage id="overview" defaultMessage="Overview" />;
const detailsMessage = <FormattedMessage id="detailsReport" defaultMessage="Details Report" />;

function renderOverview(tab, to) {
  if (tab === 'overview') {
    return (
      <a className="active">{overviewMessage}</a>
    );
  }

  return (
    <Link to={to} activeClassName="active">{overviewMessage}</Link>
  );
}

function renderDetails(tab, to) {
  if (tab === 'details') {
    return (
      <a className="active">{detailsMessage}</a>
    );
  }

  return (
    <Link to={to} activeClassName="active">{detailsMessage}</Link>
  );
}

export default function FilterBarNavigation({ section, tab }, { params }) {
  if (!section) {
    return null;
  }

  const { role, identity } = params;

  return (
    <ul className="left top-bar--inner tab--inverted">
      <li className="top-bar--inner tab--inverted__title">
        {renderOverview(tab, `/${role}/${identity}/${section}/overview`)}
      </li>
      <li className="top-bar--inner tab--inverted__title">
        {renderDetails(tab, `/${role}/${identity}/${section}/details`)}
      </li>
    </ul>
  );
}

FilterBarNavigation.contextTypes = {
  params: PropTypes.object.isRequired,
};

FilterBarNavigation.propTypes = {
  section: PropTypes.string.isRequired,
  tab: PropTypes.string.isRequired,
};
