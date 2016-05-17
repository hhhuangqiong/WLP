import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import Permit from '../../main/components/common/Permit';
import navSections from '../../main/constants/navSection';
import { userPath } from '../../server/paths';

const Sidebar = (props) => {
  const {
    carrierId: identity,
    companyName,
    handleOffCanvas,
    isAuthorityReady,
    isOffCanvas,
    logo: logoSrc,
    role,
  } = props;

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
              <span>{companyName}</span>
            </label>
          </a>
        </li>
        {
          isAuthorityReady ? navSections.map((section, idx) => (
            <Permit action="view" resource={section.page}>
              <li key={idx}>
                <Link
                  className={classnames(
                    'item',
                    'mainmenu-bar__item',
                  )}
                  to={userPath(role, identity, section.path)}
                >
                  <label>
                    <i className={section.icon} />
                    {section.name}
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
  companyName: PropTypes.string.isRequired,
  handleOffCanvas: PropTypes.func.isRequired,
  isAuthorityReady: PropTypes.bool.isRequired,
  isOffCanvas: PropTypes.bool.isRequired,
  logo: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
};

export default Sidebar;
