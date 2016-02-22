# node.js ES6 async web crawler using ES6 class layout

# Usage
* install beanstalkd
* npm install
* run node lib/pushJobs.js to populate the queue with jobs
* run node app.js to deplete the queue

# Query Mongo example
* db.links.find({ "http://www-cheltenham-festival-co-uk/" : { $exists : true } } )
