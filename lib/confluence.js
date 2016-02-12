/* jslint -W033, -W097, -W117, -W104 */
'use strict';

const cheerio = require('cheerio');
const url     = require('url');

/**
 *  Grabs links from a confluence search
 */
class Confluence {
    /**
     * [constructor Confluence]
     * @return {[type]} [description]
     */
    constructor() {
        this.page = "https://tools.skybet.net/confluence";
    }
    /**
     * [work fumethod]
     * @param  {[type]}   body [html]
     * @param  {[type]}   data [queue]
     * @param  {Function} cb   [callback]
     * @return {[type]}        [cb]
     */
    work(body, data, cb) {
        let $ = cheerio.load(body), self = this, links;
        links = $('.search-results a').map(function (i, el) {
            return url.resolve(self.page, $(this).attr('href'));
        });

        return cb(links);
    }
}

module.exports = Confluence;
