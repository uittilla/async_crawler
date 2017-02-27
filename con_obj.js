const bs = require('nodestalker'),
    client = bs.Client('127.0.0.1:11300');

client.watch("obj").onSuccess(function(data) {
    client.reserve().onSuccess(function(job) {
        "use strict";
         let dat = JSON.parse(job.data);
         console.log(job);
    });
});