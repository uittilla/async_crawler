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
        this._seen     = {};
        this._storage  = {};
        this._badLinks = /\.(bmp|exe|jpeg|swf|pdf|gif|png|jpg|doc|avi|mov|mpg|tiff|zip|tgz|xml|rss|mp3|ogg|wav|rar)$/i;
        this._agent    = 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/536.11 (KHTML, like Gecko) Ubuntu/12.04 Chromium/20.0.1132.47 Chrome/20.0.1132.47';
        this._crawling = true;
        this._getMore  = true;
        this._urls     = [];
    }
    /**
     * Get list of local links
     * @TOTO: www.bbc.co.uk and bbc.co.uk/ are the same.
     *        try work it so it knows they are the same
     * @param   {string}   body
     * @param   {obj}      parsed url
     * @returns {array}    array of links
     */
    getLinks(body, parsed, uri) {
        let $ = Cheerio.load(body), self = this, isLocal, href, hostname;
        let regExp = new RegExp("^(http|https)://(www\.)?" + parsed.host + "($|/)");    // format a host matching regex
        let restrictDomain = parsed.hostname;

        let urls=[], externalUrls=[];
        $('a').map(function(i, el) {                                             // grab all on page links
            href = $(this).attr('href');
            if(!href || /^(#|javascript|mailto)/.test(href)) return true;

            href = Url.resolve(uri, href);
            hostname = Url.parse(href).hostname

            if (hostname === restrictDomain) {
                if(!urls.indexOf(href) || !self._seen[href]) {
                    self._urls.push(href);
                    urls.push(href);
                }
            }
        });

        return urls;
/*
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
*/
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
            if (!link || self._seen[link]) {
                console.log("Seen it?", link, self._seen[link]);
                console.log("No link?", link);
                return next(null);                    // get out early
            }
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
        let self = this, options, links, numJobs, index;
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
                self.callWorker(body, job, uri, queue, link, links, err);
                return next(err);
            }

            link    = self.isRedirect(this.redirects, link);                 // map redirects

            self._crawling = false;                                          // stop redirecting
            self._seen[link] = true;                                         // map page to seen

            console.log("Seen", Object.keys(self._seen).length, "Queue", queue.length());

            if (self.getnumJobs(queue) <= self._maxLinks) {
                links = self.getLinks(body, Url.parse(link), uri);           // get page links
                links = self.dropUndesirables(links);
                for(index in links) {
                   if(Object.keys(self._seen).indexOf(links[index])){
                       links.splice(index, 1);
                   }
                   if(queue.tasks.indexOf(links[index])) {
                       links.splice(index, 1);
                   }
                }
                queue.push(links);                    // adds clean items to the queue
            }

            console.log("Total", self._maxLinks - Object.keys(self._seen).length);

            queue.tasks = queue.tasks.splice(0, self._maxLinks - Object.keys(self._seen).length);         // maintains max links
            self.callWorker(body, job, uri, queue, link, links, null);       // calls worker
            self.rateLimit(next, null);                                      // rate limit the queue
        });  // request
    }

    getnumJobs(queue) {
        let self = this;
        console.log("get more links", Object.keys(self._seen).length + queue.length() < this._maxLinks);
        return Object.keys(self._seen).length + queue.length();
    }

    callWorker(body, job, uri, queue, link, links, err) {
        let self = this;

        self._worker.work(body, self._data, function links(links) {      // plug in your worker here
            let obj    = {"url": link, "targets": links, "error": err||null};
            let domain = Url.parse(link).hostname.replace(/\./g,'-');

            self.addpage(domain, obj);
            self.track(job, uri, queue, link, links);                    // output
        });
    }

    /**
     * addpage
     * @param  domain parsed domain
     * @param obj json data for link
     */
    addpage(domain, obj) {
        if(!this._storage._id) {
            this._storage._id   = domain;
            this._storage.links = [];
        }
        this._storage.links.push(obj);                                        // save your links here
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
                    "Pending " + Colors.green.underline(queue.length()),
                    "Seen " + Colors.red.underline(this._maxLinks - queue.length()),
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
