/**
 * Created by ksh on 12/17/14.
 */
import Mongoose = require('mongoose');

import Q = require('q');

export class Repos<T> {
  /**
   * Mongoose _model that will be used to perform repository operation.
   */
  _model:Mongoose.Model<any>;

  constructor(collectionName:string, connection:Mongoose.Connection, schema:Mongoose.Schema) {
    //If user didn't inject the connection
    if(!connection){
      if(Mongoose.connection){
        connection=Mongoose.connection;
      }else{
        throw "Database connection is undefined";
      }
    }
    this._model = connection.model(collectionName, schema);
  }

  add(entity:any):Q.Promise<T> {
    var deferred = Q.defer<T>();
    this._model.create(entity, function (error, result) {
      callBack(error, result, deferred);
    })
    return deferred.promise;
  }

  find(condition:any):Q.Promise<T> {
    var deferred = Q.defer<T>();
    this._model.find(condition, function (error, result) {
      callBack(error, result, deferred);
    });
    return deferred.promise;
  }

  update(condition:any, entity:any):Q.Promise<T> {
    var deferred = Q.defer<T>();
    this._model.update(condition, entity, function (error, result) {
      callBack(error, result, deferred);
    })
    return deferred.promise;
  }

  delete(condition:any):Q.Promise<T> {
    var deferred = Q.defer<T>();
    this._model.findOneAndRemove(condition, function (error, result) {
      callBack(error, result, deferred);
    })
    return deferred.promise;
  }
}

function callBack(error:any, result:any, promise:Q.Deferred<any>) {
  if (error) {
    promise.reject(error)
  } else {
    promise.resolve(result);
  }
}
