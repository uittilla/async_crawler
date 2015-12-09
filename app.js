#!/usr/bin/env node

var Queue      = require('./lib/queue');
var Crawler    = require('./lib/crawler');
var Backlinks  = require('./lib/backlinks');
var Confluence = require('./lib/confluence');

var jobQueue   = new Queue("default");
var backlinks  = new Backlinks();
var confluence = new Confluence();

/**
 * Queue ready
 */
jobQueue.on('jobReady', function job(job) {
    var data    = JSON.parse(job.data);
    // build your worker here and pass it in
    var worker;
    switch(data.worker) {
        case "backlinks":
            worker = backlinks;
        break;
        case "confluence":
            worker = confluence;
        break;
    }

    var crawler = new Crawler(data, worker);
    var queue   = crawler.makeQueue();

    queue.push(data.link);

    queue.drain = function() {
        console.log('all items have been processed');
        console.log("Found %j",crawler.getStore());
        
        jobQueue.deleteJob(job.id, crawler);
        crawler=null;
    }
});

/**
 * Job removed
 */
jobQueue.on('jobDeleted', function (id, msg, crawler) {
    console.log("Deleted", id, msg);

    jobQueue.statsTube(function (data) {
        if(data['current-jobs-ready'] > 0 ) {
            jobQueue.getJob();
        }
        else if(data['current-jobs-reserved'] > 0) {

        }
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
