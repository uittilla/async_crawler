/* jslint -W033, -W097, -W117, -W104, -W030 */
"use strict";

const Url     = require('url');
const Cheerio = require('cheerio');
const Async   = require('async');
const Request = require('request');
const Util    = require('util');
const Colors  = require('colors');
const Mongo   = require('./mongodb');
const Config  = require('../config.json');

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
        this._seen     = {};
        this._storage  = {};
        this._badLinks = /\.(bmp|exe|jpeg|swf|pdf|gif|png|jpg|doc|avi|mov|mpg|tiff|zip|tgz|xml|rss|mp3|ogg|wav|rar)$/i;
        this._agent    = 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/536.11 (KHTML, like Gecko) Ubuntu/12.04 Chromium/20.0.1132.47 Chrome/20.0.1132.47';
        this._crawling = true;
        this._getMore  = true;
    }
    /**
     * Get list of local links
     * @param   {string}   body
     * @param   {obj}      parsed url
     * @returns {array}    array of links
     */
    getLinks(body, parsed, uri, queue) {
        const $ = Cheerio.load(body), self = this;
        const restrictDomain = parsed.hostname;
        let href="", hostname="", urls=[], externalUrls=[];

        $('a').map(function(i, el) {                                             // grab all on page links
            href     = $(this).attr('href');
            if(!href || /^(#|javascript|mailto)/.test(href)) return true;        // drop bad
            href     = Url.resolve(uri, href);                                   // maskes a fqdn
            hostname = Url.parse(href).hostname

            if (hostname === restrictDomain) {                                   // If local link
                if(!urls.indexOf(href) || !self._seen[href]) {                   // not yet seen
                    urls.push(href);
                }
            }
        });

        return this.scrutinizeLinks(urls, queue);
    }
    /**
     * Fires off async.queue
     *
     * @param  {string} uri
     * @param  {json}   job
     * @returns async.queue
     */
    start(uri, job, crawler, jobQueue) {
        const self = this;
        let links=[], numJobs=0, queue="";

        queue = Async.queue(function crawl(link, next) {                         // create async.queue
            if (!link || self._seen[link]) {
                console.log("Seen it?", link, self._seen[link]);
                return next(null);                                               // get out early
            }

            self.getPage(link, job, queue, uri, next);

        }, Config.asyncConurrency);                                              // queue concurrency of 2

        queue.push(uri);                                                         // stack our initial URI

        queue.drain = function() {                                               // Adds our drained
            Config.useMongo ?
            self.doMongo(crawler, jobQueue, job) :
            Util.log('all items processed\nFound %j', crawler.getStore());
        }
    }
    /**
     * [doMongo description]
     * @param  {object} crawler
     * @param  {object} jobQueue
     * @return {null}
     */
    doMongo(crawler, jobQueue, job) {
        const self=this;

        Util.log('all items processed');

        let MongoDb = new Mongo();

        MongoDb.on('mongoConnect', function(db){
            self.saveMongo(MongoDb, db, crawler);
        });

        MongoDb.on('mongoSaved', function(db) {
            self.mongoSaved(jobQueue, job, db, crawler);
        });

        MongoDb.connect();
    }
    /**
     * [saveMongo]
     * @param  {mongo} db database fd
     * @return {object} crawler crawler object
     */
    saveMongo(MongoDb, db, crawler) {
        MongoDb.save(db, crawler.getStore());
    }
    /**
     * [mongoSaved]
     * @param  {object} queue object
     * @param  {json} job job payload
     * @param  {mongo} db database fd
     * @param  {object} crawler crawler instance
     * @return null
     */
    mongoSaved(jobQueue, job, db, crawler) {
        jobQueue.deleteJob(job.id, crawler);
        db.close();
    }
    /**
     * [getPage]
     * @param  {string}   link
     * @param  {json}     job
     * @param  {queue}    queue
     * @param  {string}   uri
     * @param  {Function} next
     * @return {null}
     */
    getPage(link, job, queue, uri, next) {
        const self = this
        let options={}, links="", numJobs=0, total=0;

        options = {                                                              // options for the request
            "uri": link,
            "followRedirect": self._crawling,
            "encoding": 'utf-8',
            "retries": 2,
            "headers": {
                'User-Agent': self._agent
            }
        };

        Request(options, function(err, response, body) {                         // request our page
            if (err) {                                                           // next on err
                console.error("Issue detected", Colors.red(err));
                self.callWorker(body, job, uri, queue, link, links, err);
                return next(err);
            }

            link    = self.isRedirect(this.redirects, link);                     // map redirects

            self._crawling = false;                                              // stop redirecting
            self._seen[link] = true;                                             // map page to seen

            if (self.getnumJobs(queue) <= self._maxLinks) {
                links = self.getLinks(body, Url.parse(link), uri, queue);        // get page links
                queue.push(links);                                               // adds clean items to the queue
                queue.tasks = queue.tasks.filter(function(item, pos, self) {
                    return self.indexOf(item) == pos;
                });
            }

            total = self._maxLinks - Object.keys(self._seen).length;
            queue.tasks = queue.tasks.splice(0, total);                          // maintains max links if possible

            self.callWorker(body, job, uri, queue, link, links, null);           // calls worker
            self.rateLimit(next, null);                                          // rate limit the queue
        });  // request
    }
    /**
     * [scrutinizeLinks]
     * @param  {array} links links to filter
     * @param  {async.queue} queue
     * @return {array} links
     */
    scrutinizeLinks(links, queue) {
        const self=this;

        links = links.filter(function(elem, pos) {                               // finally drop any of the following bad urls
            return !(self._badLinks).test(elem);
        });

        links = links.filter(function(item, pos, self) {
           return links.indexOf(item) == pos;
        });

        links = links.filter( function( el ) {
           return queue.tasks.indexOf( el ) < 0;
        });

        return links;
    }
    /**
     * [getnumJobs description]
     * @param  {async.queue} queue
     * @return null
     */
    getnumJobs(queue) {
        const self = this;
        console.log("get more links", Object.keys(self._seen).length + queue.length() < this._maxLinks);
        return Object.keys(self._seen).length + queue.length();
    }
    /**
     * [callWorker description]
     * @param  {string} body  html page body
     * @param  {json} job
     * @param  {string} uri   target link
     * @param  {object} queue async.queue
     * @param  {string} link
     * @param  {array} links
     * @param  {error} err
     * @return {null}
     */
    callWorker(body, job, uri, queue, link, links, err) {
        const self = this;
        self._worker.work(body, self._data, function links(links) {              // plug in your worker here
            let obj    = {"url": link, "targets": links, "error": err||null};
            let domain = Url.parse(link).hostname.replace(/\./g,'-');

            self.addpage(domain, obj);
            self.track(job, uri, queue, link, links);                            // output
        });
    }
    /**
     * addpage
     * @param {string} domain parsed domain
     * @param {obj}    json data for link
     */
    addpage(domain, obj) {
        if(!this._storage._id) {
            this._storage._id   = domain;
            this._storage.links = [];
        }
        this._storage.links.push(obj);                                           // save your links here
    }
    /**
     * [track description]
     * @param  {json} job
     * @param  {string} uri
     * @param  {class} queue
     * @return {null}
     */
    track(job, uri, queue, link, links){
        console.log("Job "     + job.id, "Uri " + Url.parse(uri).host,
                    "Max "     + Colors.red.underline(this._maxLinks),
                    "Pending " + Colors.green.underline(queue.length()),
                    "Seen "    + Colors.red.underline(this._maxLinks - queue.length()),
                    "Current " + link, "Found " + links.length,
                    "numJobs " +  Object.keys(this._seen).length
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
        if (redirects && redirects.length > 0) {                                 // Redirects found under this.redirects
            tmp = Url.parse(redirects[redirects.length - 1].redirectUri);
            return tmp.protocol + "//" + (tmp.host || tmp.hostname);
        }

        return link;
    }
    /**
     * Rate limit the requests
     *
     * @param {function} next
     * @param {string}   msg
     * @returns null
     */
    rateLimit(next, msg) {
        setTimeout(function() {
            next(msg);
        }, Config.rate);
    }
    /**
     * gets the final store of data
     *
     * @returns array
     */
    getStore() {
        return this._storage;
    }
}

module.exports = Crawler;
