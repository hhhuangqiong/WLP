import React from 'react';
import classNames from 'classnames';
import {Link} from 'react-router';

var CompanyNewActionBar = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <nav className="top-bar top-bar--inner" data-topbar role="navigation">
        <section className="top-bar-section">
          <ul className="left top-bar--inner tab--inverted">
            <li className="top-bar--inner tab--inverted__title">
              <a href="javascript:void(0)">company profile</a>
            </li>
          </ul>
          <ul className="right">
            <li>
              <button
                className={classNames('company-action-bar__button', {disable: this.props.errors})}
                onClick={this.props.onSave}
              >
                create
              </button>
            </li>
          </ul>
        </section>
      </nav>
    )
  }
});

export default CompanyNewActionBar;
