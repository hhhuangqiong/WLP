import { clone, get, isEmpty, max } from 'lodash';
import React, { PropTypes, Component } from 'react';
import MAP_DATA from '../constants/mapData';
import getMapConfig from '../utils/getMapConfig';

import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';

import i18nMessages from '../../../main/constants/i18nMessages';

class HighMap extends Component {
  componentDidUpdate() {
    const { id, data, mapData, unit, intl: { formatMessage } } = this.props;

    if (!isEmpty(data)) {
      const maxValue = this.getMaxValueFromData(data);
      // eslint-disable-next-line no-undef
      Highcharts.maps['custom/world'] = mapData;
      // eslint-disable-next-line no-undef,no-new
      new Highcharts.Map(getMapConfig(
        id,
        clone(data),
        maxValue,
        formatMessage(i18nMessages.numberOfUnit, { unit })
      ));
    }
  }

  getMaxValueFromData(data) {
    return get(max(data, ({ value }) => value), 'value') || 0;
  }

  render() {
    const { id, data, isLoading } = this.props;

    return !isEmpty(data) ? (
      <div id={id}>
        {
          isLoading ? (
            <span>
              <FormattedMessage
                id="loadingMap"
                defaultMessage="Loading map"
              />
              <span>...</span>
            </span>
          ) : null
        }
      </div>
    ) : null;
  }
}

HighMap.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string,
    value: PropTypes.number,
  })),
  isLoading: PropTypes.bool,
  mapData: PropTypes.object.isRequired,
  unit: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

HighMap.defaultProps = {
  mapData: MAP_DATA,
};

export default injectIntl(HighMap);
