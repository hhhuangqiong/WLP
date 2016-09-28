import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import { injectIntl } from 'react-intl';

import Permit from '../../main/components/common/Permit';
import Icon from '../../main/components/Icon';
import Avatar from '../../main/components/Avatar';
import navSections from '../../main/constants/navSection';
import { userPath } from '../../utils/paths';

const Sidebar = props => {
  const {
    carrierId: identity,
    currentCompany,
    handleOffCanvas,
    isOffCanvas,
    logo: logoSrc,
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
              <div className="sidebar-logo">
                <Avatar src={logoSrc} firstName={currentCompany.name}
                  color="#FFFFFF" size="small" borderRadius="0"
                />
              </div>
              <span id="sidebar-company-name">{ currentCompany && currentCompany.name }</span>
            </label>
          </a>
        </li>
        {
          navSections.map((section, idx) => (
            <Permit permission={section.permission} key={idx}>
              <li key={idx}>
                <Link
                  id={`${section.page}-section-link`}
                  className="item mainmenu-bar__item"
                  to={userPath(identity, section.path)}
                  activeClassName="active"
                >
                  <label>
                    <Icon symbol={section.icon} />
                    {formatMessage(section.name)}
                  </label>
                </Link>
              </li>
            </Permit>
          ))
        }
      </ul>
    </div>
  );
};

Sidebar.propTypes = {
  carrierId: PropTypes.string.isRequired,
  currentCompany: PropTypes.object.isRequired,
  handleOffCanvas: PropTypes.func.isRequired,
  isOffCanvas: PropTypes.bool.isRequired,
  logo: PropTypes.string.isRequired,
};

export default injectIntl(Sidebar);
