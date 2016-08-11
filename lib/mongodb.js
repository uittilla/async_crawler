/* jslint -W033, -W097, -W117, -W104 */
"use strict";

const MongoClient = require('mongodb').MongoClient;
const Event       = require('events').EventEmitter;
const assert      = require('assert');
const debug       = require('debug')('Mongo');
const Config      = require('../config.json');
/**
 *
 */
class Mongo extends Event{
   /**
    * [constructor description]
    * @return null
    */
   constructor() {
       super();
       this._dbUrl = Config.mongoConn;
   }
   /**
    * [connect description]
    * @return {[type]} [description]
    */
   connect() {
       const self=this;
       MongoClient.connect(self._dbUrl, function(err, db) {
         assert.equal(null, err);
         debug("Connected correctly to the mongo server.");
         return self.emit('mongoConnect', db);
       });
   }
   /**
    * [save description]
    * @param  {[type]} db    [description]
    * @param  {[type]} store [description]
    * @return {[type]}       [description]
    */
   save(db, store) {
       const self=this;
       db.collection('links').save( store, function(err, result) {
          assert.equal(err, null);
          debug("Document inserted OK.");
          return self.emit('mongoSaved', db);
      });
   }
   /**
    * [close description]
    * @param  {[type]} db [description]
    * @return {[type]}    [description]
    */
   close(db) {
       debug("Mongo Connection closed");
       db.close();
   }
}

module.exports = Mongo;
