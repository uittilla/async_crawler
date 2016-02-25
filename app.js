#!/usr/bin/env node
/* jslint -W033, -W104 */
'use strict';

const Queue      = require('./lib/queue');
const Crawler    = require('./lib/crawler');
const Backlinks  = require('./lib/backlinks');
const Confluence = require('./lib/confluence');
const Util       = require('util');
const JobQueue   = new Queue("links");

/**
 * [on description]
 * @param  {event}      'jobReady'
 * @param  {function}   job(job
 * @return {mull}
 */
JobQueue.on('jobReady', function jobReady(job) {
    let data = JSON.parse(job.data), worker, crawler, queue;
    worker   = data.worker == "backlinks" ? new Backlinks() : new Confluence();   // build your worker here and pass it in
    crawler  = new Crawler(data, worker, data.max_links);
    
    crawler.start(data.link, job, crawler, JobQueue);
});
/**
 * [on description]
 * @param  {event}     'jobDeleted' [description]
 * @param  {function}  (id, msg, crawler [description]
 * @return {null}
 */
JobQueue.on('jobDeleted', function jobDeleted(id, msg, crawler) {
    Util.log("Deleted", id, msg);
    JobQueue.statsTube(function(data) {
        if (data['current-jobs-ready'] > 0) {              // still jobs ready
            JobQueue.getJob();
        }
        else if (data['current-jobs-reserved'] > 0) {  }   // still running jobs
        else {
            JobQueue.emit('noJob');                        // queue empty
        }
    });
});
/**
 * Job removed
 */
JobQueue.on('noJob', function noJob() {
    Util.log("Job Queue now empty, ....");
    process.exit();
});
/**
 * statsTube description
 * @param  {function} (data json
 * @return {null}
 */
JobQueue.statsTube(function(data) {
   if (data['current-jobs-ready'] > 5) {             // run 5 jobs at a time
       let jobs = 5;
       let intv = setInterval(function() {
           Util.log("Starting %d", jobs);
           JobQueue.getJob();
           jobs--;
           if (jobs === 0) { clearInterval(intv); }
       }, 2000);
   } else {
       JobQueue.getJob();                            // run only one job
   }
});
