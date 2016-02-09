#!/usr/bin/env node

/* jslint -W033 */
"use strict";

var Queue, Crawler, Backlinks, Confluence, jobQueue, jobQueue;

Queue = require('./lib/queue');
Crawler = require('./lib/crawler');
Backlinks = require('./lib/backlinks');
Confluence = require('./lib/confluence');

jobQueue = new Queue("default");
/**
 * [on description]
 * @param  {[type]} 'jobReady' [description]
 * @param  {[type]} function   job(job       [description]
 * @return {[type]}            [description]
 */
jobQueue.on('jobReady', function job(job) {
    var data = JSON.parse(job.data),
        worker, crawler, queue;
    // build your worker here and pass it in
    worker = data.worker == "backlinks" ? new Backlinks() : new Confluence();
    crawler = new Crawler(data, worker, data.max_links);

    queue = crawler.makeQueue(data.link, job);

    queue.drain = function() {                                             // Adds our drained
        console.log('all items processed\nFound %j', crawler.getStore());
        jobQueue.deleteJob(job.id, crawler);
    }
});

/**
 * [on description]
 * @param  {[type]} 'jobDeleted' [description]
 * @param  {[type]} function     (id,          msg, crawler [description]
 * @return {[type]}              [description]
 */
jobQueue.on('jobDeleted', function(id, msg, crawler) {
    console.log("Deleted", id, msg);

    jobQueue.statsTube(function(data) {
        if (data['current-jobs-ready'] > 0) {
            // new job
            jobQueue.getJob();
        } else if (data['current-jobs-reserved'] > 0) {
            // do nothing
        }
        else {
            // all done
            jobQueue.emit('noJob');
        }
    });
});

/**
 * Job removed
 */
jobQueue.on('noJob', function() {
    console.log("Job Queue now empty, ....");
    process.exit();
});

var jobs = 5;

var int = setInterval(function() {
    console.log("Starting %d", jobs)
    jobQueue.getJob();
    jobs--;
    if (jobs === 0) { clearInterval(int); }
}, 2000);
