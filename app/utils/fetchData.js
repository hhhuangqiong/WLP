import { filter, reduce } from 'lodash';
import { concurrent } from 'contra';

function fetchData(context, routerState, cb = () => {}) {
  const fetchDataRoutes = filter(routerState.routes, route => route.handler.fetchData);

  if (fetchDataRoutes.length === 0) {
    cb();
    return;
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
