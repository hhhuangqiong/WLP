import React  from 'react';
import {Link} from 'react-router';
import AuthMixin from '../../utils/AuthMixin'; 
const TemporaryMain = React.createClass({
  mixins: [AuthMixin],

  render: function() {
    return (
      <div>
        <nav className="top-bar public-header" data-topbar role="navigation">
          <ul className="title-area public-header__title-area">
            <li className="logo public-header__logo">
              <img className="logo" src="/images/logo-default-m800.png" />
            </li>
          </ul>
        </nav>
        <div className="public-container row">
          <div className="large-8 large-centered columns">
            <div className="panel panel--extra">
              <div className="row">
                <div className="large-24 columns">
                  <Link to="about">About page</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});

export default TemporaryMain;
