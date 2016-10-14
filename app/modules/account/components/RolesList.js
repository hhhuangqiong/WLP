import React, { PropTypes } from 'react';
import Role from './Role';
import _ from 'lodash';

const RolesList = (props) => {
  const companyIdArray = Object.keys(props.currentRoles);
  const companies = _.map(companyIdArray, id =>
    _.find(props.managingCompanies, company => company.id === id));
  return (
    <div className="account-form__assignedRole">
    {
      companies.map((item, index) => (
        <Role
          key={index}
          {...item}
          currentRoles={props.currentRoles}
          handleEditRole={props.handleEditRole}
          handleDeleteCompany={props.handleDeleteCompany}
        />)
      )
    }
    </div>
  );
};

RolesList.propTypes = {
  currentRoles: PropTypes.object,
  managingCompanies: PropTypes.array,
  handleDeleteCompany: PropTypes.func,
  handleEditRole: PropTypes.func.isRequired,
};

export default RolesList;
