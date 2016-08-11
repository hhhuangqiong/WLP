import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

const overviewMessage = <FormattedMessage id="overview" defaultMessage="Overview" />;
const detailsMessage = <FormattedMessage id="detailsReport" defaultMessage="Details Report" />;
const userActivationMessage = (
  <FormattedMessage id="userActivation" defaultMessage="User Activation" />
);

function renderOverview(tab, to) {
  if (tab === 'overview') {
    return (
      <a id="overview-link" className="active">{overviewMessage}</a>
    );
  }

  return (
    <Link id="overview-link" to={to} activeClassName="active">{overviewMessage}</Link>
  );
}

function renderDetails(tab, to) {
  if (tab === 'details') {
    return (
      <a id="details-report-link" className="active">{detailsMessage}</a>
    );
  }

  return (
    <Link id="details-report-link" to={to} activeClassName="active">{detailsMessage}</Link>
  );
}

function renderUserActivation(tab, to) {
  if (tab === 'whitelist') {
    return (
      <a id="whitelist-link" className="active">{userActivationMessage}</a>
    );
  }

  return (
    <Link id="whitelist-link" to={to} activeClassName="active">
      {userActivationMessage}
    </Link>
  );
}

export default function FilterBarNavigation({ section, tab }, { params }) {
  if (!section) {
    return null;
  }

  const { identity } = params;

  return (
    <ul className="left top-bar--inner tab--inverted">
      <li className="top-bar--inner tab--inverted__title">
        {renderOverview(tab, `/${identity}/${section}/overview`)}
      </li>
      <li className="top-bar--inner tab--inverted__title">
        {renderDetails(tab, `/${identity}/${section}/details`)}
      </li>
      {
        section === 'end-user' ? (
          <li className="top-bar--inner tab--inverted__title">
            {renderUserActivation(tab, `/${identity}/${section}/whitelist`)}
          </li>
        ) : null
      }
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
