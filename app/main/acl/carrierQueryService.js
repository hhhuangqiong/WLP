import Company from '../../collections/company';

/**
 * @method getCarriers
 * to return a list of existing carriers
 *
 * @param cb {Function} callback
 */
export function getCarriers(cb) {
  if (typeof cb !== 'function') {
    cb(new Error('callback is not a function'));
  }

  Company.find({}, (err, carriers) => {
    if (!err) {
      cb(null, carriers);
    }

    cb(new Error('internal server error'));
  });
}


/**
 * @method getCarrier
 * to check if a carrier exists
 *
 * @param carrierId {String} carrier id
 * @param cb {Function} callback
 */
export function getCarrier(carrierId, cb) {
  if (typeof cb !== 'function') {
    cb(new Error('callback is not a function'));
  }

  if (!carrierId) {
    cb(new Error('missing parameters'));
  }

  Company.findOne({ carrierId: carrierId }, (err, carrier) => {
    if (!err) {
      cb(null, !!carrier);
    }

    cb(new Error('internal server error'));
  })
}

/**
 * @method getCarrierType
 * Return carrier type in string format
 *
 * @param carrierId {String} carrier id
 * @param cb {Function} callback
 */
export function getCarrierType(carrierId, cb) {
  if (typeof cb !== 'function') {
    cb(new Error('callback is not a function'));
  }

  if (!carrierId) {
    cb(new Error('missing parameters'));
  }

  Company.findOne({ carrierId: carrierId }, (err, carrier) => {
    if (!err) {
      cb(null, carrier.getCompanyType());
    }

    cb(new Error('internal server error'));
  })
}
