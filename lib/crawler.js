var EventEmitter = require('events').EventEmitter;
var url          = require('url');
var cheerio      = require('cheerio');
var utils        = require('util');
var async        = require('async');
var request      = require('request');
var config       = require('../config.json');

var MAX_LINKS=config.max_links, RATE=config.rate;

/**
 * Crawler constructer
 *
 * @param data, worker
 * @returns null
 */
var Crawler = function(data, worker) {
    this.seen     = [];
    this.data     = data;
    this.worker   = worker;
    this.storage  = {};
    this.badLinks = /\.(bmp|exe|jpeg|swf|pdf|gif|png|jpg|doc|avi|mov|mpg|tiff|zip|tgz|xml|rss|mp3|ogg|wav|rar)$/i;
    MAX_LINKS = data.max_links;
}

utils.inherits(Crawler, EventEmitter);

/**
 * Get list of local links
 *
 * @param body, parsed
 * @returns array
 */
Crawler.prototype.getLinks = function(body, parsed) {
    var $ = cheerio.load(body), self=this;
    // format a host matching regex
    var regExp = new RegExp("^(http|https)://(www\.)?"+parsed.host+"($|/)");

    // grab all on page links
    return $('a').map(function (i, el) {
        var href = $(this).attr('href');

        if(href && href !== undefined) {
            // lowercase the url (another anti web crawling pattern)
            href = href.trim().toLowerCase();
            // check for link locality
            var isLocal = (href.substring(0,4) === "http") ? regExp.test(href) : true;
            // returns a resolved link to domain link
            if(isLocal && !/^(#|javascript|mailto)/.test(href) ) {
                return url.resolve(parsed.href, href);
            }
        }
    }).filter(function(item, pos, self){
        return self.indexOf(item) == pos;
    });
}

/**
 * Fires off async.queue
 *
 * @param worker
 * @returns async.queue
 */
Crawler.prototype.makeQueue = function(worker) {
  var self = this;

  // create async.queue
  var queue = async.queue(function crawl(link, next) {
      if(self.seen[link]) {
          console.log("Match", link, self.seen[link]);
      }
      if (!link || self.seen[link]) return next(null);

      // request our page
      request(link, function(err, response, body){
          if (err) return next(err);

          self.seen[link] = true;

          console.log(Object.keys(self.seen).length, queue.tasks.length);

          // Only queue up a given amount
          if(Object.keys(self.seen).length + queue.tasks.length < MAX_LINKS) {
              // Gets our page links
              var links = self.getLinks(body, url.parse(link));
              links = self.dropUndesirables(links);

              // add the links
              queue.push(links);

              // filter dupes and reduce number of links in the queue
              queue.tasks = queue.tasks.splice(0, MAX_LINKS);
          }

          //plug in your worker here
          self.worker.work(body, self.data, function links(links){
              console.log("Pending %d, Current %s, Found %j", queue.tasks.length, link, links.length);
              // save your findings here
              self.storage[link] = {targets: links};
          });

          console.log("--------------------------------------------------");

          self.rateLimit(next, null);
      });
  }, 1);

  return queue;
}

/**
 * Skip all links that end with the following
 * @param links
 * @returns {Array}
 */
Crawler.prototype.dropUndesirables = function(links) {
    var self = this;
    // finally drop any of the following bad urls
    return links.filter(function (elem, pos) {
      return !(self.badLinks).test(elem);
    });
};

/**
 * Rate limit the requests
 *
 * @param next, msg
 * @returns null
 */
Crawler.prototype.rateLimit = function(next, msg) {
  setTimeout(function(){
    next(msg);
  },RATE);
}

/**
 * gets the final store of data
 *
 * @param null
 * @returns array
 */
Crawler.prototype.getStore = function() {
  return this.storage;
}

module.exports = Crawler;
