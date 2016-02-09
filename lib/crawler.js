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
RATE = config.rate;

/**
 * Crawler constructer
 *
 * @param data, worker
 * @returns null
 */
Crawler = function(data, worker, maxLinks) {
    this.seen = [];
    this.data = data;
    this.worker = worker;
    this.storage = {};
    this.badLinks = /\.(bmp|exe|jpeg|swf|pdf|gif|png|jpg|doc|avi|mov|mpg|tiff|zip|tgz|xml|rss|mp3|ogg|wav|rar)$/i;
    this.maxLinks = maxLinks;
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
    var $ = cheerio.load(body),
        self = this;
    // format a host matching regex
    var regExp = new RegExp("^(http|https)://(www\.)?" + parsed.host + "($|/)");

    // grab all on page links
    return $('a').map(function(i, el) {
        var href = $(this).attr('href');

        if (href && href !== undefined) {
            // lowercase the url (another anti web crawling pattern)
            href = href.trim().toLowerCase();
            // check for link locality
            var isLocal = (href.substring(0, 4) === "http") ? regExp.test(href) : true;
            // returns a resolved link to domain link
            if (isLocal && !/^(#|javascript|mailto)/.test(href)) {
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
Crawler.prototype.makeQueue = function(uri) {
    var self = this,
        options;

    // create async.queue
    var queue = async.queue(function crawl(link, next) {
        // get out early
        if (!link || self.seen[link]) return next(null);

        options = { // options for the request
            "uri": link,
            "followRedirect": self.crawling,
            "encoding": 'utf-8',
            "retries": 2,
            "headers": {
                'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/536.11 (KHTML, like Gecko) Ubuntu/12.04 Chromium/20.0.1132.47 Chrome/20.0.1132.47'
            }
        };

        // request our page
        request(options, function(err, response, body) {
            if (err) {
                console.log("Issue detected", err)
                return next(err);
            }

            self.crawling = false;

            // Redirects found under this.redirects
            if (this.redirects && this.redirects.length > 0) {
                var location = this.redirects[this.redirects.length - 1].redirectUri,
                tmp  = url.parse(location);
                link =  tmp.protocol + "//" + (tmp.host || tmp.hostname);

                console.log("Redirect", link);
            }

            // redirect on 1st page only
            self.seen[link] = true;

            // Only queue up a given amount
            if (Object.keys(self.seen).length + queue.tasks.length < self.maxLinks) {
                // Gets our page links
                var links = self.getLinks(body, url.parse(link));
                links = self.dropUndesirables(links);

                // add the links
                queue.push(links);

                // filter dupes and reduce number of links in the queue
                queue.tasks = queue.tasks.splice(0, self.maxLinks);
            }

            //plug in your worker here
            self.worker.work(body, self.data, function links(links) {
                console.log("Max %d, Pending %d, Current %s, Found %j",self.maxLinks,  queue.tasks.length, link, links.length);
                // save your findings here
                self.storage[link] = {
                    targets: links
                };
            });

            console.log("--------------------------------------------------");

            self.rateLimit(next, null);
        });
    }, 1);

    queue.push(uri);
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
