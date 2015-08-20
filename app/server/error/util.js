/**
 * Decorate the native Error object with custom properties
 * 
 * @param {Error} err instance of Error
 * @param {String} moduleId Module ID 
 * @param {String} errorCode Error code
 * @return {Error} the decoreated error object
 */
export default function (err, moduleId, errorCode) {
  if(!err) throw new Error('`err` must be passed');
  if(!moduleId || !errorCode) throw new Error('`moduleId` and `errorCode` are required');

  Object.defineProperty(err, 'moduleId', {
    enumerable: true,
    configurable: false,
    value: moduleId
  });
  Object.defineProperty(err, 'errorCode', {
    enumerable: true,
    configurable: false,
    value: errorCode
  });

  return err;
};

