import { defineMessages } from 'react-intl';
import transformJoiTemplateString from '../helpers/transformJoiTemplateString';
import stringifyI18nObject from '../helpers/stringifyI18nObject';

// IMPORTANT
// It is necessary to add placehoder {key} into the head of the message body
// to avoid the auto prepend from Joi to the strigified message
const I18N_MESSAGES = defineMessages({
  'any.unknown': {
    id: 'joi.any.unknown',
    defaultMessage: '{key} is not allowed',
  },
  'any.invalid': {
    id: 'joi.any.invalid',
    defaultMessage: '{key} contains an invalid value',
  },
  'any.empty': {
    id: 'joi.any.empty',
    defaultMessage: '{key} is not allowed to be empty',
  },
  'any.required': {
    id: 'joi.any.required',
    defaultMessage: '{key} is required',
  },
  'any.allowOnly': {
    id: 'joi.any.allowOnly',
    defaultMessage: '{key} must be one of {valids}',
  },
  'any.default': {
    id: 'joi.any.default',
    defaultMessage: '{key} threw an error when running default method',
  },
  'array.base': {
    id: 'joi.array.base',
    defaultMessage: '{key} must be an array',
  },
  'array.includes': {
    id: 'joi.array.includes',
    defaultMessage: '{key} at position {pos} does not match any of the allowed types',
  },
  'array.includesSingle': {
    id: 'joi.array.includesSingle',
    defaultMessage: 'single value of "{!key}" does not match any of the allowed types',
  },
  'array.includesOne': {
    id: 'joi.array.includesOne',
    defaultMessage: '{key} at position {pos} fails because {reason}',
  },
  'array.includesOneSingle': {
    id: 'joi.array.includesOneSingle',
    defaultMessage: 'single value of "{!key}" fails because {reason}',
  },
  'array.includesRequiredUnknowns': {
    id: 'joi.array.includesRequiredUnknowns',
    defaultMessage: '{key} does not contain {unknownMisses} required value(s)',
  },
  'array.includesRequiredKnowns': {
    id: 'joi.array.includesRequiredKnowns',
    defaultMessage: '{key} does not contain {knownMisses}',
  },
  'array.includesRequiredBoth': {
    id: 'joi.array.includesRequiredBoth',
    defaultMessage: '{key} does not contain {knownMisses} and {unknownMisses} other required value(s)',
  },
  'array.excludes': {
    id: 'joi.array.excludes',
    defaultMessage: '{key} at position {pos} contains an excluded value',
  },
  'array.excludesSingle': {
    id: 'joi.array.excludesSingle',
    defaultMessage: '{key} single value of "{!key}" contains an excluded value',
  },
  'array.min': {
    id: 'joi.array.min',
    defaultMessage: '{key} must contain at least {limit} items',
  },
  'array.max': {
    id: 'joi.array.max',
    defaultMessage: '{key} must contain less than or equal to {limit} items',
  },
  'array.length': {
    id: 'joi.array.length',
    defaultMessage: '{key} must contain {limit} items',
  },
  'array.ordered': {
    id: 'joi.array.ordered',
    defaultMessage: '{key} at position {pos} fails because {reason}',
  },
  'array.orderedLength': {
    id: 'joi.array.orderedLength',
    defaultMessage: '{key} at position {pos} fails because array must contain at most {limit} items',
  },
  'array.sparse': {
    id: 'joi.array.sparse',
    defaultMessage: '{key} must not be a sparse array',
  },
  'array.unique': {
    id: 'joi.array.unique',
    defaultMessage: '{key} position {pos} contains a duplicate value',
  },
  'boolean.base': {
    id: 'joi.boolean.base',
    defaultMessage: '{key} must be a boolean',
  },
  'binary.base': {
    id: 'joi.binary.base',
    defaultMessage: '{key} must be a buffer or a string',
  },
  'binary.min': {
    id: 'joi.binary.min',
    defaultMessage: '{key} must be at least {limit} bytes',
  },
  'binary.max': {
    id: 'joi.binary.max',
    defaultMessage: '{key} must be less than or equal to {limit} bytes',
  },
  'binary.length': {
    id: 'joi.binary.length',
    defaultMessage: '{key} must be {limit} bytes',
  },
  'date.base': {
    id: 'joi.date.base',
    defaultMessage: '{key} must be a number of milliseconds or valid date string',
  },
  'date.min': {
    id: 'joi.date.min',
    defaultMessage: '{key} must be larger than or equal to "{limit}"',
  },
  'date.max': {
    id: 'joi.date.max',
    defaultMessage: '{key} must be less than or equal to "{limit}"',
  },
  'date.isoDate': {
    id: 'joi.date.isoDate',
    defaultMessage: '{key} must be a valid ISO 8601 date',
  },
  'date.timestamp.javascript': {
    id: 'joi.date.timestamp.javascript',
    defaultMessage: '{key} must be a valid timestamp or number of milliseconds',
  },
  'date.timestamp.unix': {
    id: 'joi.date.timestamp.unix',
    defaultMessage: '{key} must be a valid timestamp or number of seconds',
  },
  'date.ref': {
    id: 'joi.date.ref',
    defaultMessage: '{key} references "{ref}" which is not a date',
  },
  'function.base': {
    id: 'joi.function.base',
    defaultMessage: '{key} must be a Function',
  },
  'function.arity': {
    id: 'joi.function.arity',
    defaultMessage: '{key} must have an arity of {n}',
  },
  'function.minArity': {
    id: 'joi.function.minArity',
    defaultMessage: '{key} must have an arity greater or equal to {n}',
  },
  'function.maxArity': {
    id: 'joi.function.maxArity',
    defaultMessage: '{key} must have an arity lesser or equal to {n}',
  },
  'object.base': {
    id: 'joi.object.base',
    defaultMessage: '{key} must be an object',
  },
  'object.child': {
    id: 'joi.object.child',
    defaultMessage: '{key} child "{!key}" fails because {reason}',
  },
  'object.min': {
    id: 'joi.object.min',
    defaultMessage: '{key} must have at least {limit} children',
  },
  'object.max': {
    id: 'joi.object.max',
    defaultMessage: '{key} must have less than or equal to {limit} children',
  },
  'object.length': {
    id: 'joi.object.length',
    defaultMessage: '{key} must have {limit} children',
  },
  'object.allowUnknown': {
    id: 'joi.object.allowunknown',
    defaultMessage: '{key} is not allowed',
  },
  'object.with': {
    id: 'joi.object.with',
    defaultMessage: '{key} missing required peer "{peer}"',
  },
  'object.without': {
    id: 'joi.object.without',
    defaultMessage: '{key} conflict with forbidden peer "{peer}"',
  },
  'object.missing': {
    id: 'joi.object.missing',
    defaultMessage: '{key} must contain at least one of {peers}',
  },
  'object.xor': {
    id: 'joi.object.xor',
    defaultMessage: '{key} contains a conflict between exclusive peers {peers}',
  },
  'object.or': {
    id: 'joi.object.or',
    defaultMessage: '{key} must contain at least one of {peers}',
  },
  'object.and': {
    id: 'joi.object.and',
    defaultMessage: '{key} contains {present} without its required peers {missing}',
  },
  'object.nand': {
    id: 'joi.object.nand',
    defaultMessage: '{key} !!"{main}" must not exist simultaneously with {peers}',
  },
  'object.assert': {
    id: 'joi.object.assert',
    defaultMessage: '{key} !!"{ref}" validation failed because "{ref}" failed to {message}',
  },
  'object.type': {
    id: 'joi.object.type',
    defaultMessage: '{key} must be an instance of "{type}"',
  },
  'object.rename.multiple': {
    id: 'joi.object.rename.multiple',
    defaultMessage: '{key} cannot rename child "{from}" because multiple renames are disabled and another key was already renamed to "{to}"',
  },
  'object.rename.override': {
    id: 'joi.object.rename.override',
    defaultMessage: '{key} cannot rename child "{from}" because override is disabled and target "{to}" exists',
  },
  'number.base': {
    id: 'joi.number.base',
    defaultMessage: '{key} must be a number',
  },
  'number.min': {
    id: 'joi.number.min',
    defaultMessage: '{key} must be larger than or equal to {limit}',
  },
  'number.max': {
    id: 'joi.number.max',
    defaultMessage: '{key} must be less than or equal to {limit}',
  },
  'number.less': {
    id: 'joi.number.less',
    defaultMessage: '{key} must be less than {limit}',
  },
  'number.greater': {
    id: 'joi.number.greater',
    defaultMessage: '{key} must be greater than {limit}',
  },
  'number.float': {
    id: 'joi.number.float',
    defaultMessage: '{key} must be a float or double',
  },
  'number.integer': {
    id: 'joi.number.integer',
    defaultMessage: '{key} must be an integer',
  },
  'number.negative': {
    id: 'joi.number.negative',
    defaultMessage: '{key} must be a negative number',
  },
  'number.positive': {
    id: 'joi.number.positive',
    defaultMessage: '{key} must be a positive number',
  },
  'number.precision': {
    id: 'joi.number.precision',
    defaultMessage: '{key} must have no more than {limit} decimal places',
  },
  'number.ref': {
    id: 'joi.number.ref',
    defaultMessage: '{key} references "{ref}" which is not a number',
  },
  'number.multiple': {
    id: 'joi.number.multiple',
    defaultMessage: '{key} must be a multiple of {multiple}',
  },
  'string.base': {
    id: 'joi.string.base',
    defaultMessage: '{key} must be a string',
  },
  'string.min': {
    id: 'joi.string.min',
    defaultMessage: '{key} length must be at least {limit} characters long',
  },
  'string.max': {
    id: 'joi.string.max',
    defaultMessage: '{key} length must be less than or equal to {limit} characters long',
  },
  'string.length': {
    id: 'joi.string.length',
    defaultMessage: '{key} length must be {limit} characters long',
  },
  'string.alphanum': {
    id: 'joi.string.alphanum',
    defaultMessage: '{key} must only contain alpha-numeric characters',
  },
  'string.token': {
    id: 'joi.string.token',
    defaultMessage: '{key} must only contain alpha-numeric and underscore characters',
  },
  'string.regex.base': {
    id: 'joi.string.regex.base',
    defaultMessage: '{key} fails to match the required pattern {pattern}',
  },
  'string.regex.name': {
    id: 'joi.string.regex.name',
    defaultMessage: '{key} fails to match the {name} pattern',
  },
  'string.email': {
    id: 'joi.string.email',
    defaultMessage: '{key} must be a valid email',
  },
  'string.uri': {
    id: 'joi.string.uri',
    defaultMessage: '{key} must be a valid uri',
  },
  'string.uriCustomScheme': {
    id: 'joi.string.uriCustomScheme',
    defaultMessage: '{key} must be a valid uri with a scheme matching the {scheme} pattern',
  },
  'string.isoDate': {
    id: 'joi.string.isoDate',
    defaultMessage: '{key} must be a valid ISO 8601 date',
  },
  'string.guid': {
    id: 'joi.string.guid',
    defaultMessage: '{key} must be a valid GUID',
  },
  'string.hex': {
    id: 'joi.string.hex',
    defaultMessage: '{key} must only contain hexadecimal characters',
  },
  'string.hostname': {
    id: 'joi.string.hostname',
    defaultMessage: '{key} must be a valid hostname',
  },
  'string.lowercase': {
    id: 'joi.string.lowercase',
    defaultMessage: '{key} must only contain lowercase characters',
  },
  'string.uppercase': {
    id: 'joi.string.uppercase',
    defaultMessage: '{key} must only contain uppercase characters',
  },
  'string.trim': {
    id: 'joi.string.trim',
    defaultMessage: '{key} must not have leading or trailing whitespace',
  },
  'string.creditCard': {
    id: 'joi.string.creditCard',
    defaultMessage: '{key} must be a credit card',
  },
  'string.ref': {
    id: 'joi.string.ref',
    defaultMessage: '{key} references "{ref}" which is not a number',
  },
  'string.ip': {
    id: 'joi.string.ip',
    defaultMessage: '{key} must be a valid ip address with a {cidr} CIDR',
  },
  'string.ipVersion': {
    id: 'joi.string.ipVersion',
    defaultMessage: '{key} must be a valid ip address of one of the following versions {version} with a {cidr} CIDR',
  },
});

// transform template string format from react-intl to joi
// e.g. {key} to {{key}}
const i18nMessages = transformJoiTemplateString(I18N_MESSAGES);

// IMPORTANT
// since defineMessages must contain object that have only one signle level
// the following object structure maintains a Joi format validation messages
// that can be input to joi-validation-strategy
export default stringifyI18nObject({
  language: {
    any: {
      unknown: i18nMessages['any.unknown'],
      invalid: i18nMessages['any.invalid'],
      empty: i18nMessages['any.empty'],
      required: i18nMessages['any.required'],
      allowOnly: i18nMessages['any.allowOnly'],
      default: i18nMessages['any.default'],
    },
    array: {
      base: i18nMessages['array.base'],
      includes: i18nMessages['array.includes'],
      includesSingle: i18nMessages['array.includesSingle'],
      includesOne: i18nMessages['array.includesOne'],
      includesOneSingle: i18nMessages['array.includesOneSingle'],
      includesRequiredUnknowns: i18nMessages['array.includesRequiredUnknowns'],
      includesRequiredKnowns: i18nMessages['array.includesRequiredKnowns'],
      includesRequiredBoth: i18nMessages['array.includesRequiredBoth'],
      excludes: i18nMessages['array.excludes'],
      excludesSingle: i18nMessages['array.excludesSingle'],
      min: i18nMessages['array.min'],
      max: i18nMessages['array.max'],
      length: i18nMessages['array.length'],
      ordered: i18nMessages['array.ordered'],
      orderedLength: i18nMessages['array.orderedLength'],
      sparse: i18nMessages['array.sparse'],
      unique: i18nMessages['array.unique'],
    },
    boolean: {
      base: i18nMessages['boolean.base'],
    },
    binary: {
      base: i18nMessages['binary.base'],
      min: i18nMessages['binary.min'],
      max: i18nMessages['binary.max'],
      length: i18nMessages['binary.length'],
    },
    date: {
      base: i18nMessages['date.base'],
      min: i18nMessages['date.min'],
      max: i18nMessages['date.max'],
      isoDate: i18nMessages['date.isoDate'],
      timestamp: {
        javascript: i18nMessages['date.timestamp.javascript'],
        unix: i18nMessages['date.timestamp.unix'],
      },
      ref: i18nMessages['date.ref'],
    },
    function: {
      base: i18nMessages['function.base'],
      arity: i18nMessages['function.arity'],
      minArity: i18nMessages['function.minArity'],
      maxArity: i18nMessages['function.maxArity'],
    },
    object: {
      base: i18nMessages['object.base'],
      child: i18nMessages['object.child'],
      min: i18nMessages['object.min'],
      max: i18nMessages['object.max'],
      length: i18nMessages['object.length'],
      allowUnknown: i18nMessages['object.allowUnknown'],
      with: i18nMessages['object.with'],
      without: i18nMessages['object.without'],
      missing: i18nMessages['object.missing'],
      xor: i18nMessages['object.xor'],
      or: i18nMessages['object.or'],
      and: i18nMessages['object.and'],
      nand: i18nMessages['object.nand'],
      assert: i18nMessages['object.assert'],
      rename: {
        multiple: i18nMessages['object.rename.multiple'],
        override: i18nMessages['object.rename.override'],
      },
      type: i18nMessages['object.type'],
    },
    number: {
      base: i18nMessages['number.base'],
      min: i18nMessages['number.min'],
      max: i18nMessages['number.max'],
      less: i18nMessages['number.less'],
      greater: i18nMessages['number.greater'],
      float: i18nMessages['number.float'],
      integer: i18nMessages['number.integer'],
      negative: i18nMessages['number.negative'],
      positive: i18nMessages['number.positive'],
      precision: i18nMessages['number.precision'],
      ref: i18nMessages['number.ref'],
      multiple: i18nMessages['number.multiple'],
    },
    string: {
      base: i18nMessages['string.base'],
      min: i18nMessages['string.min'],
      max: i18nMessages['string.max'],
      length: i18nMessages['string.length'],
      alphanum: i18nMessages['string.alphanum'],
      token: i18nMessages['string.token'],
      regex: {
        base: i18nMessages['string.regex.base'],
        name: i18nMessages['string.regex.name'],
      },
      email: i18nMessages['string.email'],
      uri: i18nMessages['string.uri'],
      uriCustomScheme: i18nMessages['string.uriCustomScheme'],
      isoDate: i18nMessages['string.isoDate'],
      guid: i18nMessages['string.guid'],
      hex: i18nMessages['string.hex'],
      hostname: i18nMessages['string.hostname'],
      lowercase: i18nMessages['string.lowercase'],
      uppercase: i18nMessages['string.uppercase'],
      trim: i18nMessages['string.trim'],
      creditCard: i18nMessages['string.creditCard'],
      ref: i18nMessages['string.ref'],
      ip: i18nMessages['string.ip'],
      ipVersion: i18nMessages['string.ipVersion'],
    },
  },
});
