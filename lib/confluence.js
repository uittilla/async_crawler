/* jslint -W033, -W097, -W117, -W104 */
'use strict';

const Cheerio = require('cheerio');
const Url     = require('url');
const Config  = require('../config.json');

/**
 *  Grabs links from a confluence search
 */
class Confluence {
    /**
     * [constructor Confluence]
     * @return {null} 
     */
    constructor() { }
    /**
     * [work fumethod]
     * @param  {string}    body [html]
     * @param  {json}      data [queue]
     * @param  {Function}  cb   [callback]
     * @return {function}       [cb]
     */
    work(body, data, cb) {
        const $ = Cheerio.load(body), self = this;
        let links;

        links = $(Config.selectors.confluence_search_links).map(function (i, el) {
            return Url.resolve(self.page, $(this).attr('href'));
        });

        return cb(links);
    }
}

module.exports = Confluence;
