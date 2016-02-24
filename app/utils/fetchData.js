import { filter, reduce } from 'lodash';
import { concurrent } from 'contra';

function fetchData(context, routerState, cb = () => {}) {
  const fetchDataRoutes = filter(routerState.routes, route => {
    return route.handler.fetchData;
  });

  if (fetchDataRoutes.length === 0) {
    return cb();
  }

  const dataFetchers = reduce(fetchDataRoutes, (result, route) => {
    const fetcher = route
      .handler
      .fetchData
      .bind(null, context, routerState.params, routerState.query);

    result[route.name] = fetcher;
    return result;
  }, {});

  concurrent(dataFetchers, cb);
}

module.exports = fetchData;
