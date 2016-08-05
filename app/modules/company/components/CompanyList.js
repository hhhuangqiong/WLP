import React, { PropTypes } from 'react';
import CompanyDetail, {CompanyDetailShape} from './CompanyDetail';
import companies from './companyData';// temporary use

class CompanyList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log(this.props);
    return (
      <table className="company-sidebar__list__item">
        <thead>
          <tr>
            <th>Comany Name</th>
            <th>Carrier Domain</th>
            <th>Create Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {this.props.companies.map((item) => (
            <CompanyDetail {...item} />
          ))}
        </tbody>
      </table>
    );
  }
}

CompanyList.propTypes = {
  companies: PropTypes.arrayOf(CompanyDetailShape),
};

export default CompanyList;

