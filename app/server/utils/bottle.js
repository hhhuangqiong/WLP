import Bottle from 'bottlejs';
import { isUndefined, isString } from 'lodash';

/**
 * Retrieve the container with the specified name
 *
 * NB: only able to retrieve bottle instantiated without `new`
 *
 * @param {String} name The name of the container
 * @return {Bottle} container
 */
export function fetchContainerInstance(name) {
  return Bottle.pop(name);
}

/**
 * Retrieve the dependency registered with that container with the specified name
 *
 * @param {String} name The name of the container instantiated
 * @param {String} depIdentifier Dependency identifier
 *
 * @return {*} The registered dependency
 */
export function fetchDep(name, depIdentifier) {
  // Since only one container instance is used in app,
  // this allows to use this function as fetchDep('SomeService') without references to nconf everywhere
  // until we migrate to using IoC container for all application components
  if (!isString(depIdentifier)) {
    depIdentifier = name;
    name = 'm800';
  }
  const ioc = fetchContainerInstance(name);

  if (ioc) {
    // TODO prevent the 'identifier.' case
    const dependency = depIdentifier.split('.').reduce((result, key) => {
      return result[key];
    }, ioc.container);
    if (isUndefined(dependency)) {
      throw new Error(`Failed to resolve dependency from IoC container: ${depIdentifier}.`);
    }
    return dependency;
  }
  throw new Error(`Failed to find IoC container with name: ${name}.`);
}
