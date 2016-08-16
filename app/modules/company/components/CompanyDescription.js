import React, { PropTypes, Component } from 'react';
import Select from 'react-select';

const options = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' },
];
function logChange(val) {
    console.log("Selected: " + val);
}

class CompanyDescription extends Component {
  constructor(props) {
    super(props);
    this.state = { country: '', timeZone: '' };
    this.changeCountry = this.changeCountry.bind(this);
    this.changeTimeZone = this.changeTimeZone.bind(this);
  }
  changeCountry(val) {
    this.setState({ country: val });
  }
  changeTimeZone(val) {
    this.setState({ timeZone: val });
  }
  render() {
    return (
      <div>
  <div className="company-description">
    <span className="inline header__sub">Country:</span>
    <Select
      value="one"
      name="select-range"
      value={this.state.country}
      options={this.props.countries}
      onChange={this.changeCountry}
    />
  </div>
  <div className="company-description">
    <span className="inline header__sub">Time Zone:</span>
    <Select
      value="one"
      name="select-range"
      value={this.state.timeZone}
      options={this.props.timeZone}
      onChange={this.changeTimeZone}
    />
  </div>
  <div className="company-description " defaultActiveKey = "2">
    <span className="inline header__sub">Contact Details:</span>
    <input className="input-name" type="text" />
  </div>
</div>
    );
  }
}

CompanyDescription.propTypes = {
  countries: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  timeZone: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
};

export default CompanyDescription;
