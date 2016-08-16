import React from 'react';
import SwitchButtonGroup from '../../../main/components/SwitchButtonGroup';

const COMPANY_TYPE = {
  SDK: 'SDK',
  WHITE_LABEL: 'WHITE_LABEL',
};
const PAYMENT_TYPE = {
  PRE_PAID: 'Pre-Paid',
  POST_PAID: 'Post Paid',
};

class CompanyProfileInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedCompanyType: COMPANY_TYPE[0], selectedPaymentType: PAYMENT_TYPE[0] };
    this.companyTypeChange = this.companyTypeChange.bind(this);
    this.paymentTypeChange = this.paymentTypeChange.bind(this);
  }
  companyTypeChange(type) {
    this.setState({ selectedCompanyType: type });
  }
  paymentTypeChange(type) {
    this.setState({ selectedPaymentType: type });
  }

  render() {
    return (
      <div>
        <div className="company-profile " defaultActiveKey = "2">
          <span className="inline header__sub">Company Name:</span>
          <input className="input-name" type="text" />
        </div>
        <div className="company-profile">
          <span className="inline header__sub">Company Type:</span>
          <SwitchButtonGroup
            types={COMPANY_TYPE}
            currentType={this.state.selectedCompanyType}
            onChange={this.companyTypeChange}
          />
        </div>
        <div className="company-profile">
          <span className="inline header__sub">Payment Type:</span>
          <SwitchButtonGroup
            types={PAYMENT_TYPE}
            currentType={this.state.selectedPaymentType}
            onChange={this.paymentTypeChange}
          />
        </div>
      </div>
    );
  }
}

export default CompanyProfileInfo;
