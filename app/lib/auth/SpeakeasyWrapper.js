var _          = require('lodash');
var speakeasy  = require('speakeasy');

const ENCODINGS = ['ascii', 'hex', 'base32'];

export default class SpeakeasyWrapper {

  /**
   * An wrapper object of the 'Speakeasy' module
   * See {@link https://github.com/markbao/speakeasy}
   *
   * @class SpeakeasyWrapper
   * @param {Object} opts
   *  @param {String} [opts.encoding='ascii'] Encoding allows: 'ascii', 'hex', or 'base32'
   */
  constructor(opts = {}) {
    var encoding = opts.encoding;

    if(encoding && ENCODINGS.indexOf(encoding) < 0 )
      throw new Error(`Unknown encoding: ${encoding}`);

    this.encoding = encoding || 'ascii';
  }

  /**
   * Get the QR code URL
   *
   * TODO: allow format to be overridden (YAGNI)
   *
   * @method qrCodeURL
   * @param {String} [name=''] Show up as the label after scanning
   * @return {String}
   */
  qrCodeURL(name = '') {
    // do not care about the lenght for now
    var qrOpts = { qr_codes: true, name: name, length: 32 };

    // how to use `Object.assign` with 6to5?
    var result = speakeasy.generate_key(_.assign({}, qrOpts));
    var target = `qr_code_${this.encoding}`;
    return result[target];
  }

}
