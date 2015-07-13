import nconf from 'nconf';
import SessionHandler from '../utils/SessionHandler';
import { fetchDep } from '../utils/bottle';

const redisClient = fetchDep(nconf.get('containerName'), 'RedisClient');

function initialize(client) {
  return new SessionHandler(client);
}

export default initialize(redisClient);
