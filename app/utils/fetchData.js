import { filter, reduce, isFunction } from 'lodash';
import { concurrent } from 'contra';

/**
 * @method fetchData
 * to get and run all the static fetchData method in the hit component(s)
 *
 * @param context {Object} Fluxible context
 * @param renderProps {Object} renderProps returned form match function of react-router
 * @param cb {Function}
 */
export default function fetchData(context, renderProps, cb = () => {}) {
  const fetchDataRoutes = filter(renderProps.routes, route => {
    const handler = route.component.fetchData;
    return !!handler && isFunction(handler);
  });

  if (fetchDataRoutes.length === 0) {
    cb();
    return;
  }

  const dataFetchers = reduce(fetchDataRoutes, (result, route) => {
    const { fetchData: handler, displayName } = route.component;
    const fetcher = handler.bind(null, context, renderProps.params, renderProps.location.query);
    // eslint-disable-next-line no-param-reassign
    result[displayName] = fetcher;
    return result;
  }, {});

  concurrent(dataFetchers, cb);
}

module.exports = fetchData;
