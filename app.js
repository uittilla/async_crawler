#!/usr/bin/env node
/* jslint -W033 */
"use strict";

var Queue, Crawler, Backlinks, Confluence, jobQueue, jobQueue, backlinks, confluence;

Queue      = require('./lib/queue');
Crawler    = require('./lib/crawler');
Backlinks  = require('./lib/backlinks');
Confluence = require('./lib/confluence');

jobQueue   = new Queue("default");
backlinks  = new Backlinks();
confluence = new Confluence();

/**
 * [on description]
 * @param  {[type]} 'jobReady' [description]
 * @param  {[type]} function   job(job       [description]
 * @return {[type]}            [description]
 */
jobQueue.on('jobReady', function job(job) {
    var data    = JSON.parse(job.data), worker, crawler, queue;
    // build your worker here and pass it in
    worker  = data.worker == "backlinks" ? backlinks : confluence;
    crawler = new Crawler(data, worker, data.max_links);
    queue   = crawler.makeQueue();

    queue.push(data.link);

    queue.drain = function() {
        console.log('all items have been processed');
        console.log("Found %j",crawler.getStore());

        jobQueue.deleteJob(job.id, crawler);
        crawler=null;
    }
});

/**
 * [on description]
 * @param  {[type]} 'jobDeleted' [description]
 * @param  {[type]} function     (id,          msg, crawler [description]
 * @return {[type]}              [description]
 */
jobQueue.on('jobDeleted', function (id, msg, crawler) {
    console.log("Deleted", id, msg);

    jobQueue.statsTube(function (data) {
        if(data['current-jobs-ready'] > 0 ) {
            jobQueue.getJob();
        }
        else if(data['current-jobs-reserved'] > 0) { }
        else {
            jobQueue.emit('noJob');
        }
    });
});

/**
 * Job removed
 */
jobQueue.on('noJob', function () {
    console.log("Job Queue now empty, ....");
    process.exit();
});

var jobs = 5;
while(jobs--) {
    jobQueue.getJob();
}
