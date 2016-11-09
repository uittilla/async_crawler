"use strict";

var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var test_conn = require('tcp-ping');
var debug = require('debug')('app.spec');
var bs = require('nodestalker'),
    client = bs.Client('127.0.0.1:11300');

var app = require('./app');

describe('Beastalk', function() {
    it('It should be listening on port 11300', function() {
        test_conn.probe('127.0.0.1', 11300, function(err, available) {
            expect(available).to.eql(true);
        });
    });
});

describe('Beastalk', function() {
   it('adds a job to the queue', function() {
       client.use('links').onSuccess(function (data) {

           expect(data).to.eql(['links']);

           client.put(JSON.stringify( {
               "link":    "http://www.sportal.com",
               "targets": ["http://www.skybet.com", "https://www.skybet.com"],
               "worker":  "backlinks",
               "max_links": 10
           })).onSuccess(function(res){
              debug("HEREW", res);
           }).onError(function(res){
               debug("THERE", res);
           });

       });
   });
});

describe('Beastalk', function() {
    it('consumes the job from the queue', function() {
        //debug("HERE");
        app.stats();

        /*client.watch('links').onSuccess(function(data) {
            expect(data).to.not.be.empty;

            client.reserve().onSuccess(function (job) {

                expect(job.data).to.eql('test');

                client.deleteJob(job.id).onSuccess(function(del_msg) {
                    expect(del_msg).to.eql(['DELETED']);
                });

            }).onError(function(err){
                console.log("Its fucked");
            })
        });*/
    });
});
