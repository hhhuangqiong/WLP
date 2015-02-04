var logger = require('winston');
var Bouncer = (function () {
    function Bouncer(chance) {
        if (chance === void 0) { chance = 3; }
        this.addresses = {};
        this.whitelist = [];
        //this.whitelist = ['127.0.0.1'];
    }
    Bouncer.prototype.getIPAddress = function (req) {
        var address;
        try {
            address = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        }
        catch (err) {
            logger.error(err);
        }
        return address;
    };
    Bouncer.prototype.inWhitelist = function (address) {
        if (this.whitelist.indexOf(address) > -1) {
            return true;
        }
        return false;
    };
    Bouncer.prototype.needCaptcha = function (req) {
        var needCaptcha = false;
        var address = this.getIPAddress(req);
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
    };
    Bouncer.prototype.postRequest = function (req, fn) {
        var address = this.getIPAddress(req);
        var whitelisted = this.inWhitelist(address);
        if (whitelisted) {
            fn();
        }
        ;
        var requester = this.addresses[address] || { count: 0, lastAttempt: 0 };
        if (req.isAuthenticated()) {
            this.resetForce(address, requester);
            fn(true);
        }
        else {
            this.traceForce(address, requester);
            fn(false);
        }
    };
    Bouncer.prototype.traceForce = function (address, force) {
        force.count++;
        force.lastAttempt = Date.now();
        this.addresses[address] = force;
    };
    Bouncer.prototype.resetForce = function (address, force) {
        force.count = 0;
        force.lastAttempt = Date.now();
        this.addresses[address] = force;
    };
    return Bouncer;
})();
;
var bouncer = new Bouncer();
module.exports = bouncer;
