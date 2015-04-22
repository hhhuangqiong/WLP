import React from 'react';
import classnames from 'classnames';

var Sidebar = React.createClass({
  getInitialState: function() {
    return {
      sections: [
        {
          name: 'overview',
          icon: 'fi-web'
        },
        {
          name: 'account',
          icon: 'fi-key'
        },
        {
          name: 'company',
          icon: 'fi-home'
        },
        {
          name: 'setting',
          icon: 'fi-widget'
        }]
    }
  },
  render: function() {
    return (
      <div
        className={classnames('mainmenu-bar','vertical', {offcanvas: this.props.isOffCanvas})}
        onMouseLeave={this.props.handleOffCavnas.bind(null, true)}
        onMouseEnter={this.props.handleOffCavnas.bind(null, false)}
      >
        <ul>
          {this.state.sections.map((section)=>{
            return (
              <li>
                <a className="item mainmenu-bar__item">
                  <label>
                    <i className={section.icon} />
                    {section.name}
                  </label>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    )
  }
});

export default Sidebar;
