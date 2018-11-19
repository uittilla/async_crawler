/* jslint -W033, -W097, -W117, -W104 */
'use strict';

const Cheerio = require('cheerio');
const Url     = require('url');
const Config  = require('../config.json');

/**
 *  Grabs links from a confluence search
 */
class Images {
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
        const  $ = Cheerio.load(body);

        let links = $(Config.selectors.images).map(function (i, e) {
            return $(this).attr('src') || $(this).attr('href') || "null";
        });

        return cb(links);
    }
}

module.exports = Images;

