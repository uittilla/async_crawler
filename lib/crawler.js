/* jslint -W033, -W097, -W117, -W104 */
"use strict";

const Url     = require('url');
const Cheerio = require('cheerio');
const Async   = require('async');
const Request = require('request');
const Util    = require('util');
const Colors  = require('colors');
const Mongo   = require('./mongodb');
const Config  = require('../config.json');

const MAX_LINKS = Config.max_links;
const RATE      = Config.rate;

let MongoDb = "";

console.log(MongoDb);

/**
 * Crawler constructer
 *
 * @param data, worker
 * @returns null
 */
class Crawler {
    /**
     * constructor Crawler
     * @param  {json} data
     * @param  {class} worker
     * @param  {int} maxLinks
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
     * @param   {string}   body
     * @param   {obj}      parsed url
     * @returns {array}    array of links
     */
    getLinks(body, parsed) {
        let $ = Cheerio.load(body), self = this, isLocal, href,
            regExp = new RegExp("^(http|https)://(www\.)?" + parsed.host + "($|/)");    // format a host matching regex

        return $('a').map(function(i, el) {                                             // grab all on page links
            href = $(this).attr('href');
            if (href && href !== undefined) {
                href = href.trim().toLowerCase();                                       // lowercase the url
                isLocal = (href.substring(0, 4) === "http") ? regExp.test(href) : true; // check for link locality
                if (isLocal && !/^(#|javascript|mailto)/.test(href)) {                  // returns a resolved link to domain link
                    return Url.resolve(parsed.href, href);
                }
            }
        }).filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        });
    }
    /**
     * Fires off async.queue
     *
     * @param  uri
     * @param  job
     * @returns async.queue
     */
    start(uri, job, crawler, jobQueue) {
        let self = this, links, numJobs, queue;

        queue = Async.queue(function crawl(link, next) {                         // create async.queue
            if (!link || self._seen[link]) return next(null);                    // get out early
            self.getPage(link, job, queue, uri, next);
        }, 1); // queue concurrency of 1

        queue.push(uri);                                                         // stack our initial URI

        queue.drain = function() {                                               // Adds our drained
            //Util.log('all items processed\nFound %j', crawler.getStore());
            Util.log('all items processed');

            MongoDb = new Mongo();

            MongoDb.on('mongoConnect', function(db){
                MongoDb.save(db, crawler.getStore());
            });

            MongoDb.on('mongoSaved', function(db) {
                jobQueue.deleteJob(job.id, crawler);
                db.close();
                MongoDb = null;
            });

            MongoDb.connect();
        }
    }
    /**
     * [getPage description]
     * @param  {string}   link
     * @param  {json}     job
     * @param  {queue}    queue
     * @param  {string}   uri
     * @param  {Function} next
     * @return {[type]}
     */
    getPage(link, job, queue, uri, next) {
        let self = this, options, links, numJobs;
        options = {                                                          // options for the request
            "uri": link,
            "followRedirect": self._crawling,
            "encoding": 'utf-8',
            "retries": 2,
            "headers": {
                'User-Agent': self._agent
            }
        };

        Request(options, function(err, response, body) {                     // request our page
            if (err) {                                                       // next on err
                console.error("Issue detected", Colors.red(err));
                return next(err);
            }

            link    = self.isRedirect(this.redirects, link);                 // map redirects
            numJobs = Object.keys(self._seen).length + queue.length();       // Only queue up a given amount

            self._crawling = false;                                          // stop redirecting
            self._seen[link] = true;                                         // map page to seen
            self._seen[link + "/"] = true;                                   // prevents the likes of bbc.co.uk + bbc.co.uk/

            if (numJobs++ < self._maxLinks) {
                links = self.getLinks(body, Url.parse(link));                // get page links
                queue.push(self.dropUndesirables(links));                    // adds clean items to the queue
                queue.tasks = queue.tasks.splice(0, self._maxLinks);         // maintains max links
            }

            self._worker.work(body, self._data, function links(links) {      // plug in your worker here
                self.track(job, uri, queue, link, links);                    // output

                let obj    = {"url": link, "targets": links };
                let domain = Url.parse(link).hostname.replace(/\./g,'-');

                self._storage[domain] = (!self._storage[domain]) ?
                [] : self._storage[domain];

                self._storage[domain].push(obj);                              // save your links here
            });

            self.rateLimit(next, null);                                       // rate limit the queue
        });  // request
    }
    /**
     * [track description]
     * @param  {json} job
     * @param  {string} uri
     * @param  {class} queue
     * @return {null}
     */
    track(job, uri, queue, link, links){
        console.log("Job " + job.id, "Uri " + Url.parse(uri).host,
                    "Max " + Colors.red.underline(this._maxLinks),
                    "Pending " + Colors.green.underline(queue.tasks.length),
                    "Current " + link, "Found " + links.length
        );
        console.log("-----------------------------------------------".blue)
    }
    /**
     * [function description]
     * @param  redirects
     * @param link
     * @return link
     */
    isRedirect(redirects, link) {
        let tmp="";
        if (redirects && redirects.length > 0) {                             // Redirects found under this.redirects
            tmp = Url.parse(redirects[redirects.length - 1].redirectUri);
            return tmp.protocol + "//" + (tmp.host || tmp.hostname);
        }

        return link;
    }
    /**
     * Skip all links that end with badLinks
     * @param links
     * @returns array
     */
    dropUndesirables(links) {
        let self=this;
        return links.filter(function(elem, pos) {                            // finally drop any of the following bad urls
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
