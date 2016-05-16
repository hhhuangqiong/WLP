import { clone, get, isEmpty, max } from 'lodash';
import React, { PropTypes, Component } from 'react';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import MAP_DATA from '../constants/mapData';
import getMapConfig from '../utils/getMapConfig';

const MESSAGES = defineMessages({
  highmapLoading: {
    id: 'highmap.loading',
    defaultMessage: 'Loading maps...',
  },
});

class HighMap extends Component {
  componentDidUpdate() {
    const { id, data, mapData } = this.props;

    if (!isEmpty(data)) {
      const maxValue = this.getMaxValueFromData(data);
      // eslint-disable-next-line no-undef
      Highcharts.maps['custom/world'] = mapData;
      // eslint-disable-next-line no-undef,no-new
      new Highcharts.Map(getMapConfig(id, clone(data), maxValue));
    }
  }

  getMaxValueFromData(data) {
    return get(max(data, ({ value }) => value), 'value') || 0;
  }

  render() {
    const { intl: { formatMessage } } = this.props;
    const { id, data, isLoading } = this.props;

    return !isEmpty(data) ? (
      <div id={id}>
        {
          isLoading ? (
            <span>{formatMessage(MESSAGES.highmapLoading)}</span>
          ) : null
        }
      </div>
    ) : null;
  }
}

HighMap.propTypes = {
  intl: intlShape.isRequired,
  id: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string,
    value: PropTypes.number,
  })),
  isLoading: PropTypes.bool,
  mapData: PropTypes.object.isRequired,
};

HighMap.defaultProps = {
  mapData: MAP_DATA,
};

export default injectIntl(HighMap);
