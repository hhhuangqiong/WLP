import React, { PropTypes } from 'react';
import Collapse, { Panel } from 'rc-collapse';
import reactDom from 'react-dom';
import countryData from 'country-data';
import timeZone from 'timeZones.json';

import CompanyProfileInfo from './CompanyProfileInfo';
import CompanyDescription from './CompanyDescription';
import CompanyCapabilities from './CompanyCapabilities';

const countries = countryData.countries.all.map((item) => (
  {
    value: item.name,
    label: item.name,
  }
));

let timeZoneArray = [];
timeZone.forEach((item) => {
  timeZoneArray = timeZoneArray.concat(item.utc);
});
timeZoneArray = timeZoneArray.map((item) => (
  {
    value: item,
    label: item,
  }
));

class CompanyProfile extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="company__new-profile">
        <div className="header inline-with-space narrow">
          <div>
            <button></button>
            <h4 className="title-inline">Create New Company</h4>
          </div>
          <button>Create</button>
        </div>
        <Collapse accordion={false} defaultActiveKey="0">
          <Panel header="Company Profile">
           <CompanyProfileInfo />
          </Panel>
          <Panel header="Company Description">
           <CompanyDescription countries={countries} timeZone={timeZoneArray} />
          </Panel>
          <Panel header="Company Capabilities">
           <CompanyCapabilities />
          </Panel>
        </Collapse>
      </div>

    );
  }
}

CompanyProfile.propTypes = {

};

export default CompanyProfile;
