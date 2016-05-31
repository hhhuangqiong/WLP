import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import { injectIntl } from 'react-intl';
import Permit from '../../main/components/common/Permit';
import navSections from '../../main/constants/navSection';
import { userPath } from '../../utils/paths';

const Sidebar = props => {
  const {
    carrierId: identity,
    currentCompany,
    handleOffCanvas,
    isAuthorityReady,
    isOffCanvas,
    logo: logoSrc,
    role,
    intl,
  } = props;
  const { formatMessage } = intl;
  const closeSidebar = handleOffCanvas.bind(null, true);
  const openSidebar = handleOffCanvas.bind(null, false);

  return (
    <div
      className={classnames('mainmenu-bar', 'vertical', { offcanvas: isOffCanvas })}
      onMouseLeave={closeSidebar}
      onMouseEnter={openSidebar}
    >
      <ul>
        <li>
          <a className="item mainmenu-bar__item" href="#">
            <label>
              <i><img src={logoSrc} /></i>
              <span id="sidebar-company-name">{ currentCompany && currentCompany.name }</span>
            </label>
          </a>
        </li>
        {
          isAuthorityReady ? navSections.map((section, idx) => (
            <Permit action="view" resource={section.page}>
              <li key={idx}>
                <Link
                  id={`${section.page}-section-link`}
                  className="item mainmenu-bar__item"
                  to={userPath(role, identity, section.path)}
                  activeClassName="active"
                >
                  <label>
                    <i className={section.icon} />
                    {formatMessage(section.name)}
                  </label>
                </Link>
              </li>
            </Permit>
          )) : null
        }
      </ul>
    </div>
  );
};

Sidebar.propTypes = {
  carrierId: PropTypes.string.isRequired,
  currentCompany: PropTypes.object.isRequired,
  handleOffCanvas: PropTypes.func.isRequired,
  isAuthorityReady: PropTypes.bool.isRequired,
  isOffCanvas: PropTypes.bool.isRequired,
  logo: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
};

export default injectIntl(Sidebar);
