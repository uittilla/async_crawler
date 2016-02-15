/* jslint -W033, -W097, -W117, -W104 */
"use strict";

const MongoClient = require('mongodb').MongoClient;
const Event       = require('events').EventEmitter;
const assert      = require('assert');

/**
 *
 */
class Mongo extends Event{
   /**
    * [constructor description]
    * @return {[type]} [description]
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
       let self=this;
       MongoClient.connect(self._dbUrl, function(err, db) {
         assert.equal(null, err);
         console.log("Connected correctly to the mongo server.");
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
       let self=this;

       db.collection('links').insertOne( store, function(err, result) {
          assert.equal(err, null);
          console.log("Document inserted OK.");
          self.emit('mongoSaved', db);
      });
   }
   /**
    * [close description]
    * @param  {[type]} db [description]
    * @return {[type]}    [description]
    */
   close(db) {
       db.close();
   }
}

module.exports = Mongo;
