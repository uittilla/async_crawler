var Queue    = require('./lib/queue');
var Crawler  = require('./lib/crawler');
var Backlinks = require('./lib/backlinks');

var jobQueue  = new Queue("default");
var backlinks = new Backlinks();

/**
 * Queue ready
 */
jobQueue.on('jobReady', function job(job) {
    var data    = JSON.parse(job.data);
    var crawler = new Crawler(data, backlinks);
    var queue   = crawler.makeQueue();

    queue.push(data.link);

    queue.drain = function() {
        console.log('all items have been processed');
        console.log("Found %j",crawler.getStore());

        crawler=null;
        jobQueue.deleteJob(job.id);
    }
});

/**
 * Job removed
 */
jobQueue.on('jobDeleted', function (id, msg, crawler) {
    console.log("Deleted", id, msg);
    jobQueue.statsTube(function (data) {
        if(data['current-jobs-ready'] > 0 ) { jobQueue.getJob();}
        else if(data['current-jobs-reserved'] > 0) { }
        else { jobQueue.emit('noJob'); }
    });
});

/**
 * Job removed
 */
jobQueue.on('noJob', function () {
    process.exit();
});

var jobs=5;
while(jobs--)
   jobQueue.getJob();
