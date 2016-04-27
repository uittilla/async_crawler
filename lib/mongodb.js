/* jslint -W033, -W097, -W117, -W104 */
"use strict";

const MongoClient = require('mongodb').MongoClient;
const Event       = require('events').EventEmitter;
const assert      = require('assert');
const Util        = require('util');
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
       this._dbUrl = "mongodb://localhost:27017/crawler";
   }
   /**
    * [connect description]
    * @return {[type]} [description]
    */
   connect() {
       const self=this;
       MongoClient.connect(self._dbUrl, function(err, db) {
         assert.equal(null, err);
         Util.log("Connected correctly to the mongo server.");
         self.emit('mongoConnect', db);
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
          Util.log("Document inserted OK.");
          self.emit('mongoSaved', db);
      });
   }
   /**
    * [close description]
    * @param  {[type]} db [description]
    * @return {[type]}    [description]
    */
   close(db) {
       Util.log("Mongo Connection closed");
       db.close();
   }
}

module.exports = Mongo;
