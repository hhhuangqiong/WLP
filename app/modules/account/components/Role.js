import React, { PropTypes } from 'react';
import _ from 'lodash';
import Icon from '../../../main/components/Icon';

const Role = (props) => {
  const { id } = props;
  const rolesArray = props.currentRoles[id];
  let roleName = _.map(rolesArray, item => _.find(props.roles, role => role.id === item));
  if (roleName) {
    roleName = roleName.map(role => role.name);
  }
  return (
    <div className="account-form__role-item">
      <div className="deleteIcon" onClick={() => props.handleDeleteCompany(id)}>
        <Icon
          symbol="icon-minus-circle"
        />
      </div>
      <div className="item" onClick={() => props.handleEditRole(id)}>
        <div className="company-name">{props.name}</div>
        <div className="role-name">
          {
            roleName ?
            roleName.map((name, index) => (
              <div key={index}>{name}</div>
            )) : null
          }
        </div>
      </div>
    </div>
  );
};

Role.propTypes = {
  last: PropTypes.bool,
  // companyId passed by {...item}
  id: PropTypes.string,
  // companyName passed by {...item}
  name: PropTypes.string,
  roles: PropTypes.array,
  currentRoles: PropTypes.object,
  handleEditRole: PropTypes.func,
  handleDeleteCompany: PropTypes.func,
};

export default Role;
