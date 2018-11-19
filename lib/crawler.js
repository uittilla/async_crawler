/* jslint -W033, -W097, -W117, -W104, -W030 */
"use strict";

const Url     = require('url');
const Cheerio = require('cheerio');
const Async   = require('async');
const Request = require('request');
const Colors  = require('colors');
const debug   = require('debug')('Crawler');
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
        this._agent    = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36';
        this._crawling = true;
    }
    /**
     * Fires off async.queue
     *
     * @param  {string} uri
     * @param  {json}   job
     * @returns async.queue
     */
    start(uri, job) {
        let queue = Async.queue( (link, next) => {                               // create async.queue
            if (!link || this._seen[link]) {
                debug("Seen it?", link, this._seen[link]);
                return next(null);                                               // get out early
            }

            this.getPage(link, job, queue, uri, next);

        }, Config.asyncConcurrency);                                             // queue concurrency of 2

        queue.push(uri);                                                         // stack our initial URI

        return queue;
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
        const self = this;
        let links="", numJobs=0, total=0;
        let local_data = JSON.parse(job.data);

        let options = {                                                          // options for the request
            "uri":            link,
            "followRedirect": self._crawling,
            "encoding":       'utf-8',
            "retries":        2,
            "headers":        {
                'User-Agent': self._agent
            }
        };

        if (local_data.headers) {
            let lheader = local_data.headers;
            for(let header in lheader) {
                options.headers[header] = lheader[header];
            }
        }

        Request(options, (err, response, body) => {                             // request our page

            if (err) {
                debug("Issue detected", Colors.red(err));
                this.callWorker(body, job, uri, queue, link, links, err);
                return next(err);
            }

            link = this.isRedirect(this.redirects, link);                        // map redirects

            self._crawling   = false;                                            // stop redirecting
            self._seen[link] = true;                                             // map page to seen

            if (self.getnumJobs(queue, job.id) <= this._maxLinks) {
                links = this.getLinks(body, Url.parse(link), uri, queue);        // get page links
                links = this.checkLinks(links, queue);
                queue.push(links);                                               // adds clean items to the queue
            }

            total = this._maxLinks - Object.keys(self._seen).length;
            queue.tasks = queue.tasks.splice(0, total);                          // maintains max links if possible

            self.callWorker(body, job, uri, queue, link, links, null);           // calls worker
            self.rateLimit(next, null);                                          // rate limit the queue

        });  // request

    }
    /**
     * Get list of local links
     * @param   {string}   body
     * @param   {obj}      parsed url
     * @param   {string}   uri
     * @param   {queue}    queue
     * @returns {Array}    url array of links
     */
    getLinks(body, parsed, uri, queue) {
        const $ = Cheerio.load(body), self = this;
        const restrictDomain = parsed.hostname;
        let href="", hostname="", urls=[];

        $('a').map(function(i, el)  {                                            // grab all on page links
            href     = $(this).attr('href');
            if(!href || /^(#|javascript|mailto)/.test(href)) return true;        // drop bad
            href     = Url.resolve(uri, href);                                   // makes a fqdn
            hostname = Url.parse(href).hostname;

            if (hostname === restrictDomain) {                                   // If local link
                if(!urls.indexOf(href) || !self._seen[href]) {                   // not yet seen
                    urls.push(href);
                }
            }
        });

        return urls;
    }
    /**
     * [checkLinks]
     * @param  {Array} links links to filter
     * @param  {queue} queue
     * @return {Array} links
     */
    checkLinks(links, queue) {
        const self=this;

        links = links.filter((elem, pos) => {                                    // finally drop any of the following bad urls
            return !(self._badLinks).test(elem);
        });

        links = links.filter((elem, pos, self) => {                              // remove dupes
           return links.indexOf(elem) === pos;
        });

        return links;
    }
    /**
     * [callWorker]
     * @param  {string} body  html page body
     * @param  {json} job
     * @param  {string} uri   target link
     * @param  {object} queue async.queue
     * @param  {string} link
     * @param  {Array} links
     * @param  {error} err
     * @return {null}
     */
    callWorker(body, job, uri, queue, link, links, err) {
        const self = this;

        this._worker.work(body, self._data, function links(links) {              // plug in your worker here
            let obj    = {"url": link, "targets": links, "error": err||null};
            let domain = Url.parse(link).hostname.replace(/\./g,'-');            // beautify name for storage id

            self.addpage(domain, obj);
            self.track(job, uri, queue, link, links);                            // output
        });
    }
    /**
     * addpage
     * @param {string} domain parsed domain
     * @param {object} obj json data for link
     */
    addpage(domain, obj) {
        if(!this._storage._id) {
            this._storage._id   = domain;
            this._storage.links = [];
        }

        this._storage.links.push(obj);                                           // save your links here
    }
    /**
     * [track]
     * @param  {json} job
     * @param  {string} uri
     * @param  {class} queue
     * @param  {string} link
     * @param  {Array} links
     * @return {null}
     */
    track(job, uri, queue, link, links){

        debug("Job:", job.id,
              "Uri:", Url.parse(uri).host,
              "Max:", Colors.red.underline(this._maxLinks),
              "Pending:", Colors.red.underline(queue.length()),
              "Seen:", Colors.red.underline(this._maxLinks - queue.length()),
              "Current:", link,
              "Found:", Colors.red.underline(links.length),
              "numJobs:", Colors.red.underline(Object.keys(this._seen).length)
        );

        debug("--------------------------------------------------------------------".blue);
    }
    /**
     * Check if this is a redirect
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
        setTimeout(() => {
            next(msg);
        }, Config.rate);
    }
    /**
     * gets the final store of data
     *
     * @returns array
     */
    getStore() {
        let last_save = (Date.now() / 1000 | 0)
        let i = 0;
        let count = 0;

        for(i in this._storage.links) {
            count += this._storage.links[i].targets.length || 0;
        }

        this._storage.last_save = last_save;
        this._storage.found     = count;

        return this._storage;
    }
    /**
     * [getnumJobs]
     * @param  {queue} queue
     * @return null
     */
    getnumJobs(queue, id) {
        const self = this;
        debug("get more links for Job %d, %s", id, Object.keys(self._seen).length + queue.length() < this._maxLinks);
        return Object.keys(self._seen).length + queue.length();
    }
}

module.exports = Crawler;
