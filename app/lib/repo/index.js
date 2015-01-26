var Mongoose = require('mongoose');
var Q = require('q');
var Repos = (function () {
    function Repos(collectionName, connection, schema) {
        //If user didn't inject the connection
        if (!connection) {
            if (Mongoose.connection) {
                connection = Mongoose.connection;
            }
            else {
                throw "Database connection is undefined";
            }
        }
        this._model = connection.model(collectionName, schema);
    }
    Repos.prototype.add = function (entity) {
        var deferred = Q.defer();
        this._model.create(entity, function (error, result) {
            callBack(error, result, deferred);
        });
        return deferred.promise;
    };
    Repos.prototype.find = function (condition) {
        var deferred = Q.defer();
        this._model.find(condition, function (error, result) {
            callBack(error, result, deferred);
        });
        return deferred.promise;
    };
    Repos.prototype.update = function (condition, entity, opt) {
        var deferred = Q.defer();
        this._model.update(condition, entity, opt, function (error, result) {
            callBack(error, result, deferred);
        });
        return deferred.promise;
    };
    Repos.prototype.delete = function (condition) {
        var deferred = Q.defer();
        this._model.findOneAndRemove(condition, function (error, result) {
            callBack(error, result, deferred);
        });
        return deferred.promise;
    };
    return Repos;
})();
exports.Repos = Repos;
function callBack(error, result, promise) {
    if (error) {
        promise.reject(error);
    }
    else {
        promise.resolve(result);
    }
}
