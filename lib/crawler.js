/* jslint -W033, -W097, -W117 */
'use strict';

var EventEmitter, url, cheerio, utils, async, request, config, MAX_LINKS, RATE, Crawler;

EventEmitter = require('events').EventEmitter;
url = require('url');
cheerio = require('cheerio');
utils = require('util');
async = require('async');
request = require('request');
config = require('../config.json');

MAX_LINKS = config.max_links;
RATE      = config.rate;

/**
 * Crawler constructer
 *
 * @param data, worker
 * @returns null
 */
Crawler = function(data, worker, maxLinks) {
    this.data     = data;
    this.worker   = worker;
    this.maxLinks = maxLinks;
    this.seen     = [];
    this.storage  = {};
    this.badLinks = /\.(bmp|exe|jpeg|swf|pdf|gif|png|jpg|doc|avi|mov|mpg|tiff|zip|tgz|xml|rss|mp3|ogg|wav|rar)$/i;
    this.crawling = true;
}

utils.inherits(Crawler, EventEmitter);

/**
 * Get list of local links
 *
 * @param body, parsed
 * @returns array
 */
Crawler.prototype.getLinks = function(body, parsed) {
    var $      = cheerio.load(body), self = this, isLocal, href;
    var regExp = new RegExp("^(http|https)://(www\.)?" + parsed.host + "($|/)");       // format a host matching regex

    return $('a').map(function(i, el) {                                                // grab all on page links
        href = $(this).attr('href');

        if (href && href !== undefined) {
            href = href.trim().toLowerCase();                                           // lowercase the url
            isLocal = (href.substring(0, 4) === "http") ? regExp.test(href) : true;     // check for link locality
            if (isLocal && !/^(#|javascript|mailto)/.test(href)) {                      // returns a resolved link to domain link
                return url.resolve(parsed.href, href);
            }
        }
    }).filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
    });
}

/**
 * Fires off async.queue
 *
 * @param worker
 * @returns async.queue
 */
Crawler.prototype.makeQueue = function(uri, job) {
    var self  = this, options, links, tmp, numJobs, queue;

    queue = async.queue(function crawl(link, next) {                     // create async.queue
        if (!link || self.seen[link]) return next(null);                 // get out early
        options = {                                                      // options for the request
            "uri": link,
            "followRedirect": self.crawling,
            "encoding": 'utf-8',
            "retries": 2,
            "headers": {
                'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/536.11 (KHTML, like Gecko) Ubuntu/12.04 Chromium/20.0.1132.47 Chrome/20.0.1132.47'
            }
        };

        request(options, function(err, response, body) {                  // request our page
            if (err) {
                console.log("Issue detected", err)
                return next(err);
            }

            link = self.isRedirect(this.redirects, link);                 // map redirects
            self.crawling   = false;                                      // stop redirecting
            self.seen[link] = true;                                       // redirects on 1st page only
            numJobs = Object.keys(self.seen).length + queue.tasks.length; // Only queue up a given amount

            if (numJobs < self.maxLinks) {
                links = self.getLinks(body, url.parse(link));             // get page links
                queue.push(self.dropUndesirables(links));                 // adds clean items to the queue
                queue.tasks = queue.tasks.splice(0, self.maxLinks);       // maintains max links
            }

            self.worker.work(body, self.data, function links(links) {     // plug in your worker here
                console.log("Job %d, URI %s, Max %d, Pending %d, Current %s, Found %j",
                    job.id, url.parse(uri).host, self.maxLinks,  queue.tasks.length, link, links.length);

                self.storage[link] = { "targets": links };                // save your findings here
            });

            self.rateLimit(next, null);                                   // rate limit the queue
        }); // request

    }, 1); // queue concurrency of 1

    queue.push(uri);                                                       // stack our initial URI

    return queue;
}

/**
 * [function description]
 * @param  {[type]} redirects [description]
 * @return {[type]}           [description]
 */
Crawler.prototype.isRedirect = function(redirects, link) {
    var tmp;

    // Redirects found under this.redirects
    if (redirects && redirects.length > 0) {
        console.log("Redirect", link);
        tmp  = url.parse(redirects[redirects.length - 1].redirectUri);
        return tmp.protocol + "//" + (tmp.host || tmp.hostname);
    }

    return link;
}

/**
 * Skip all links that end with the following
 * @param links
 * @returns {Array}
 */
Crawler.prototype.dropUndesirables = function(links) {
    var self = this;
    // finally drop any of the following bad urls
    return links.filter(function(elem, pos) {
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
    setTimeout(function() {
        next(msg);
    }, RATE);
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
