#!/usr/bin/env node
/* jslint -W033, -W104, -W040, -W117, -W030 */
'use strict';
const debug      = require('debug')('app');
const Util       = require('util');
const Queue      = require('./lib/queue');
const Crawler    = require('./lib/crawler');
const Backlinks  = require('./lib/backlinks');
const Confluence = require('./lib/confluence');
const Mongo      = require('./lib/mongodb');
const Config     = require('./config.json');

const JobQueue   = new Queue("links");

/**
 * [doMongo handles job results to mongo]
 * @param  {object} crawler
 * @param  {object} jobQueue
 * @return {null}
 */
function doMongo (crawler, jobQueue, job) {
    debug('all items processed');

    let MongoDb = new Mongo();

    MongoDb.on('mongoConnect', function(db){
        saveMongo(MongoDb, db, crawler);
    });

    MongoDb.on('mongoSaved', function(db) {
        mongoSaved(jobQueue, job, db, crawler);
        MongoDb.close(db);
    });

    MongoDb.connect();
}
/**
 * [saveMongo Saves reasults to mongo]
 * @param  {object} MongoDb instace
 * @param  {object} db fd
 * @param  {object} crawler
 * @return null
 */
function saveMongo(MongoDb, db, crawler) {
    MongoDb.save(db, crawler.getStore());
}
/**
 * [mongoSaved event to signal succesfull save]
 * @param  {object} jobQueue object
 * @param  {json} job job payload
 * @param  {mongo} db database fd
 * @param  {object} crawler crawler instance
 * @return null
 */
function mongoSaved(jobQueue, job, db, crawler) {
    jobQueue.deleteJob(job.id, crawler);
}
/**
 * [on description]
 * @param  {event}      'jobReady'
 * @param  {function}   job(job
 * @return {mull}
 */
JobQueue.on('jobReady', function jobReady(job) {
    let data = JSON.parse(job.data), worker, crawler, queue;
    worker   = data.worker == "backlinks" ? new Backlinks() : new Confluence();   // build your worker here and pass it in
    crawler  = new Crawler(data, worker, data.max_links);                         // instantiate the crawler
    queue    = crawler.start(data.link, job);                                     // make our async queue

    queue.drain = function() {                                                    // Adds our drained
        if(Config.useMongo) {                                                         // use mongo ?
            doMongo(crawler, JobQueue, job);
        } else {
            debug('All items processed\nFound %j', crawler.getStore());
            crawler = null;
            JobQueue.deleteJob(job.id, crawler);
        }
    }
});
/**
 * [on description]
 * @param  {event}     'jobDeleted' [description]
 * @param  {function}  (id, msg, crawler [description]
 * @return {null}
 */
JobQueue.on('jobDeleted', function jobDeleted(id, msg, crawler) {
    debug("Deleted %d, %s", id, msg);
    JobQueue.statsTube(function(data) {
        if (data['current-jobs-ready'] > 0) {                                     // still jobs ready
            JobQueue.getJob();
        }
        else if (data['current-jobs-reserved'] > 0) {  }                          // still running jobs
        else {
            JobQueue.emit('noJob');                                               // queue empty
        }
    });
});
/**
 * Job removed
 */
JobQueue.on('noJob', function noJob() {
    debug("Job Queue now empty, ....");
    process.nextTick(function(){
        process.exit();
    });
});
/**
 * statsTube description
 * @param  {function} (data json
 * @return {null}
 */
JobQueue.statsTube(function(data) {
   if (data['current-jobs-ready'] > 5) {                                          // run 5 jobs at a time
       let jobs = 5;
       let intv = setInterval(function() {
           debug("Starting %d", jobs);
           JobQueue.getJob();
           jobs--;
           if (jobs === 0) { clearInterval(intv); }
       }, 1000);
   }
   else if(!data['current-jobs-ready']) {
       JobQueue.emit('noJob');
   }
   else {
       debug("Getting next job %d", data['current-jobs-ready']);
       JobQueue.getJob();                                                         // run only one job
   }
});
