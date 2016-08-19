import React, { PropTypes } from 'react';
import Select from 'react-select';
import { injectIntl, defineMessages, intlShape, FormattedMessage } from 'react-intl';

const MESSAGES = defineMessages({
  selectCountry: {
    id: 'company.selectCountry',
    defaultMessage: 'Select a country',
  },
  selectTimezone: {
    id: 'company.selectTimezone',
    defaultMessage: 'Select a timezone',
  },
});

const CompanyDescription = (props) => {
  const {
    country,
    timezone,
    contactDetail,
    countryOption,
    timezoneOption,
    onCountryChange,
    onTimezoneChange,
    onContactDetailChange,
    intl: { formatMessage },
   } = props;
  return (
    <div className="company-description">
      <div className="row">
        <div className="large-10 columns">
          <label>
            <FormattedMessage id="country" defaultMessage="Country" />:
          </label>
        </div>
        <div className="large-14 columns">
          <Select
            name="select-country"
            value={country}
            placeholder={formatMessage(MESSAGES.selectCountry)}
            options={countryOption}
            onChange={onCountryChange}
          />
        </div>
      </div>
      <div className="row">
        <div className="large-10 columns">
          <label>
            <FormattedMessage id="timezone" defaultMessage="Timezone" />:
          </label>
        </div>
        <div className="large-14 columns">
          <Select
            name="select-timezone"
            value={timezone}
            placeholder={formatMessage(MESSAGES.selectTimezone)}
            options={timezoneOption}
            onChange={onTimezoneChange}
          />
        </div>
      </div>
      <div className="row" defaultActiveKey = "2">
        <div className="large-10 columns">
          <label>
            <FormattedMessage id="contactDetail" defaultMessage="Contact Detail" />:
          </label>
        </div>
        <div className="large-14 columns">
          <input
            className="radius"
            value={contactDetail}
            type="text"
            onChange={onContactDetailChange}
          />
        </div>
      </div>
    </div>
  );
};

CompanyDescription.propTypes = {
  intl: intlShape.isRequired,
  country: PropTypes.string,
  timezone: PropTypes.string,
  contactDetail: PropTypes.string,
  countryOption: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  timezoneOption: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  onCountryChange: PropTypes.func,
  onTimezoneChange: PropTypes.func,
  onContactDetailChange: PropTypes.func,
};

export default injectIntl(CompanyDescription);
