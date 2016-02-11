/* jslint -W033, -W097, -W117, -W104 */
'use strict';

var EventEmitter, url, cheerio, async, request, config, MAX_LINKS, RATE;

url     = require('url');
cheerio = require('cheerio');
async   = require('async');
request = require('request');
config  = require('../config.json');

MAX_LINKS = config.max_links;
RATE = config.rate;

/**
 * Crawler constructer
 *
 * @param data, worker
 * @returns null
 */

class Crawler {

    /**
     * [constructor Crawler]
     * @param  {[type]} data     [queue]
     * @param  {[type]} worker   [class]
     * @param  {[type]} maxLinks [int]
     */
    constructor(data, worker, maxLinks) {
        this._data     = data;
        this._worker   = worker;
        this._maxLinks = maxLinks;
        this._seen     = [];
        this._storage  = {};
        this._badLinks = /\.(bmp|exe|jpeg|swf|pdf|gif|png|jpg|doc|avi|mov|mpg|tiff|zip|tgz|xml|rss|mp3|ogg|wav|rar)$/i;
        this._agent    = 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/536.11 (KHTML, like Gecko) Ubuntu/12.04 Chromium/20.0.1132.47 Chrome/20.0.1132.47';
        this._crawling = true;
    }

    /**
     * Get list of local links
     * @TOTO: www.bbc.co.uk and bbc.co.uk/ are the same.
     *        try work it so it knows they are the same
     * @param body, parsed
     * @returns array
     */
    getLinks(body, parsed) {
        var $ = cheerio.load(body), self = this, isLocal, href,
            regExp = new RegExp("^(http|https)://(www\.)?" + parsed.host + "($|/)");    // format a host matching regex

        return $('a').map(function(i, el) {                                             // grab all on page links
            href = $(this).attr('href')
            if (href && href !== undefined) {
                href = href.trim().toLowerCase();                                       // lowercase the url
                isLocal = (href.substring(0, 4) === "http") ? regExp.test(href) : true; // check for link locality
                if (isLocal && !/^(#|javascript|mailto)/.test(href)) {                  // returns a resolved link to domain link
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
    makeQueue(uri, job) {
        var self = this,
            options, links, tmp, numJobs, queue;

        queue = async.queue(function crawl(link, next) {                         // create async.queue
            if (!link || self._seen[link]) return next(null);                    // get out early
            options = {                                                          // options for the request
                "uri": link,
                "followRedirect": self._crawling,
                "encoding": 'utf-8',
                "retries": 2,
                "headers": {
                    'User-Agent': self._agent
                }
            };

            request(options, function(err, response, body) {                     // request our page
                if (err) {
                    console.log("Issue detected", err)
                    return next(err);
                }

                link = self.isRedirect(this.redirects, link);                    // map redirects
                self._crawling = false;                                          // stop redirecting
                self._seen[link] = true;                                         // map page to seen
                numJobs = Object.keys(self._seen).length + queue.tasks.length;   // Only queue up a given amount

                if (numJobs < self._maxLinks) {
                    links = self.getLinks(body, url.parse(link));                // get page links
                    queue.push(self.dropUndesirables(links));                    // adds clean items to the queue
                    queue.tasks = queue.tasks.splice(0, self._maxLinks);         // maintains max links
                }

                self._worker.work(body, self._data, function links(links) {      // plug in your worker here
                    console.log("Job %d, URI %s, Max %d, Pending %d, Current %s, Found %j",
                        job.id, url.parse(uri).host, self._maxLinks, queue.tasks.length, link, links.length);

                });

                self.rateLimit(next, null);                                      // rate limit the queue
            });  // request

        }, 1); // queue concurrency of 1

        queue.push(uri);                                                         // stack our initial URI

        return queue;
    }

    /**
     * [function description]
     * @param  {[type]} redirects [description]
     * @return {[type]}           [description]
     */
    isRedirect(redirects, link) {
        var tmp;

        // Redirects found under this.redirects
        if (redirects && redirects.length > 0) {
            tmp = url.parse(redirects[redirects.length - 1].redirectUri);
            return tmp.protocol + "//" + (tmp.host || tmp.hostname);
        }

        return link;
    }

    /**
     * Skip all links that end with the following
     * @param links
     * @returns {Array}
     */
    dropUndesirables(links) {
        var self = this;
        // finally drop any of the following bad urls
        return links.filter(function(elem, pos) {
            return !(self._badLinks).test(elem);
        });
    }

    /**
     * Rate limit the requests
     *
     * @param next, msg
     * @returns null
     */
    rateLimit(next, msg) {
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
    getStore() {
        return this._storage;
    }
}

module.exports = Crawler;
