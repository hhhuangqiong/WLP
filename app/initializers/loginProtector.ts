import logger = require('winston');

interface Requester {
  count: number;
  lastAttempt: number;
}

class Bouncer {
  chance: number;
  addresses: {};
  whitelist: Array<string>;

  constructor(chance: number = 3) {
    this.addresses = {};
    this.whitelist = [];
    //this.whitelist = ['127.0.0.1'];
  }

  getIPAddress(req) {
    var address: string;

    try {
      address = req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress   ||
      req.socket.remoteAddress       ||
      req.connection.socket.remoteAddress;
    } catch (err) {
      logger.error(err);
    }

    return address;
  }

  inWhitelist(address: string): boolean {
    if (this.whitelist.indexOf(address) > -1) {
      return true;
    }

    return false;
  }

  needCaptcha(req): boolean {

    var needCaptcha: boolean = false;
    var address: string = this.getIPAddress(req);
    var whitelisted = this.inWhitelist(address);

    // If no IP address is get, captcha is needed
    if (!address) {
      return needCaptcha = true;
    }

    // If IP address is in whitelist, captcha isn't needed
    if (whitelisted) {
      return needCaptcha = false;
    }

    var requester = this.addresses[address] || { count: 0, lastAttempt: 0 };

    if (requester.count >= this.chance) {
      return needCaptcha = true;
    }

    return needCaptcha = false;
  }

  postRequest(req, fn) {

    var address: string = this.getIPAddress(req);
    var whitelisted = this.inWhitelist(address);

    if (whitelisted) {
      fn();
    };

    var requester = this.addresses[address] || { count: 0, lastAttempt: 0 };

    if (req.isAuthenticated()) {
      this.resetForce(address, requester);
      fn(true);
    } else {
      this.traceForce(address, requester);
      fn(false);
    }
  }

  traceForce(address: string, force: Requester): void {
    force.count ++;
    force.lastAttempt = Date.now();

    this.addresses[address] = force;
  }

  resetForce(address: string, force: Requester): void {
    force.count = 0;
    force.lastAttempt = Date.now();

    this.addresses[address] = force;
  }
};

var bouncer = new Bouncer();

export = bouncer;
