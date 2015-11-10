import _ from 'lodash';

/**
 * Read a and return its type.
 *
 * @method
 * @param {*} value  The value to check
 * @returns {String} A string representing the type
 * @example
 * getType(3);      // Number
 * getType('abc');  // String
 * getType(null)l   // Null
 * getType([1, 2]); // Array
 * getType({});     // Object
 */
function getType(value) {
  let type = Object.prototype.toString.call(value);

  // type must be in the form of '[object XXXXXX]' (e.g. [object Number], [object Function])
  // we need the XXXXXX part only
  return type.substring(8, type.length - 1);
}

/**
 * Get the simplified JSON schema of a JSON object.
 *
 * @method
 * @param {Object} json  The JSON to check
 * @returns {Object} The simplified JSON schema
 * @example
 * let schema = getSimplifiedJsonSchema({
 *   number: 3,
 *   string: 'abc',
 *   numberArray: [1, 2],
 *   object: {
 *     num: 7,
 *     empty: []
 *   }
 * });
 *
 * // schema
 * {
 *   number: "Number",
 *   string: "String",
 *   numberArray: "Number[2]",
 *   object: {
 *     num: "Number"
 *     empty: "EmptyArray"
 *   }
 * }
 */
function getSimplifiedJsonSchema(json) {
  let type = getType(json);

  if (type === 'Array') {
    if (json.length > 0) {
      // e.g. Number[3], Object[7]
      return `${getType(json[0])}[${json.length}]`;
    } else {
      return 'EmptyArray';
    }
  }

  if (type !== 'Object') {
    return type;
  }

  let schema = {};
  _.each(json, (value, key) => {
    schema[key] = getSimplifiedJsonSchema(value);
  });

  return schema;
}

export default getSimplifiedJsonSchema;
